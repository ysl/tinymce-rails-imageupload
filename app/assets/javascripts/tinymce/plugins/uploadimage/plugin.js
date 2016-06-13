(function() {
  tinymce.PluginManager.requireLangPack('uploadimage');

  tinymce.create('tinymce.plugins.UploadImage', {
    UploadImage: function(ed, url) {
      var form,
          iframe,
          win,
          throbber,
          editor = ed;

      function showDialog() {
        win = editor.windowManager.open({
          title: ed.translate('Insert an image from your computer'),
          width:  500 + parseInt(editor.getLang('uploadimage.delta_width', 0), 10),
          height: 350 + parseInt(editor.getLang('uploadimage.delta_height', 0), 10),
          body: [
            {type: 'iframe',  url: 'javascript:void(0)'},
            {type: 'container', name: 'container',
              html: '<div id="uploadArea" style="width: 450px; height: 150px; border: 10px dashed #ccc; padding: 50px 40px; display: table-cell; vertical-align: middle; text-align: center; background-size: contain; background-position: center center; background-repeat: no-repeat;">' +
                      '<div style="text-align: center;">' + ed.translate('Drag and drop image to here') + '</div>' +
                      '<div style="text-align: center;">or</div>' +
                      '<input id="imageUpload" type="file" name="file" style="display: none;"/>' +
                      '<button type="button" onclick="$(\'#imageUpload\').click();" style="border: 1px solid #666; padding: 10px; cursor: pointer;">' + ed.translate('Choose an image') + '</button>' +
                    '</div>'
            },
            {type: 'textbox', name: 'alt', label: ed.translate('Image description')},
            {type: 'container', classes: 'error', html: "<p style='color: #b94a48;'>&nbsp;</p>"},

            // Trick TinyMCE to add a empty div that "preloads" the throbber image
            {type: 'container', classes: 'throbber'},
          ],
          buttons: [
            {
              text: ed.translate('Insert'),
              onclick: insertImage,
              subtype: 'primary'
            },
            {
              text: ed.translate('Cancel'),
              onclick: ed.windowManager.close
            }
          ],
        }, {
          plugin_url: url
        });

        // TinyMCE likes pointless submit handlers
        win.off('submit');
        win.on('submit', insertImage);

        /* WHY DO YOU HATE <form>, TINYMCE!? */
        iframe = win.find("iframe")[0];
        form = createElement('form', {
          action: ed.getParam("uploadimage_form_url", "/tinymce_assets"),
          target: iframe._id,
          method: "POST",
          enctype: 'multipart/form-data',
          accept_charset: "UTF-8",
        });

        // Might have several instances on the same page,
        // so we TinyMCE create unique IDs and use those.
        iframe.getEl().name = iframe._id;

        // Create some needed hidden inputs
        form.appendChild(createElement('input', {type: "hidden", name: "utf8", value: "✓"}));
        form.appendChild(createElement('input', {type: 'hidden', name: 'authenticity_token', value: getMetaContents('csrf-token')}));
        form.appendChild(createElement('input', {type: 'hidden', name: 'hint', value: ed.getParam("uploadimage_hint", "")}));

        var el = win.getEl();
        var body = document.getElementById(el.id + "-body");

        // Copy everything TinyMCE made into our form
        var containers = body.getElementsByClassName('mce-container');
        for(var i = 0; i < containers.length; i++) {
          form.appendChild(containers[i]);
        }

        // Fix inputs, since TinyMCE hates HTML and forms
        var inputs = form.getElementsByTagName('input');
        for(var i = 0; i < inputs.length; i++) {
          var ctrl = inputs[i];

          if(ctrl.tagName.toLowerCase() == 'input' && ctrl.type != "hidden") {
            if(ctrl.type == "file") {
              ctrl.name = "file";

              // Hack styles
              tinymce.DOM.setStyles(ctrl, {
                'border': 0,
                'boxShadow': 'none',
                'webkitBoxShadow': 'none',
              });
            } else {
              ctrl.name = "alt";
            }
          }
        }

        body.appendChild(form);

        // Set preview.
        function handleFileUpload(file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            $('#uploadArea').css('background-image', 'url(' + e.target.result + ')');
            $('#uploadArea').children().css('display', 'none');
          }
          reader.readAsDataURL(file);
        }

        // Supporting drag and drop to upload image.
        var uploadArea = $("#uploadArea");
        uploadArea.on('dragenter', function (e) {
          e.stopPropagation();
          e.preventDefault();
          $(this).css('border-style', 'solid');
        });
        uploadArea.on('dragover', function (e) {
          e.stopPropagation();
          e.preventDefault();
          $(this).css('border-style', 'dotted');
        });
        uploadArea.on('drop', function (e) {
          $(this).css('border-style', 'none');
          e.preventDefault();
          var files = e.originalEvent.dataTransfer.files;
          $("#imageUpload").prop("files", e.originalEvent.dataTransfer.files);
          handleFileUpload(files[0]);
        });

        // Also can upload by click button.
        $("#imageUpload").change(function() {
          if (this.files && this.files[0]) {
            handleFileUpload(this.files[0])
          }
        });

      }

      function insertImage() {
        var input = $('#imageUpload')[0];
        if (!input.files || !input.files[0]) {
          return handleError('You must choose a file');
        }

        throbber = new top.tinymce.ui.Throbber(win.getEl());
        throbber.show();

        clearErrors();

        /* Add event listeners.
         * We remove the existing to avoid them being called twice in case
         * of errors and re-submitting afterwards.
         */
        var target = iframe.getEl();
        if(target.attachEvent) {
          target.detachEvent('onload', uploadDone);
          target.attachEvent('onload', uploadDone);
        } else {
          target.removeEventListener('load', uploadDone);
          target.addEventListener('load', uploadDone, false);
        }

        form.submit();
      }

      function uploadDone() {
        if(throbber) {
          throbber.hide();
        }

        var target = iframe.getEl();
        if(target.document || target.contentDocument) {
          var doc = target.contentDocument || target.contentWindow.document;
          handleResponse(doc.getElementsByTagName("body")[0].innerHTML);
        } else {
          handleError("Didn't get a response from the server");
        }
      }

      function handleResponse(ret) {
        try {
          var json = tinymce.util.JSON.parse(ret);

          if(json["error"]) {
            handleError(json["error"]["message"]);
          } else {
            ed.execCommand('mceInsertContent', false, buildHTML(json));
            ed.windowManager.close();
          }
        } catch(e) {
          handleError('Got a bad response from the server');
        }
      }

      function clearErrors() {
        var message = win.find(".error")[0].getEl();

        if(message)
          message.getElementsByTagName("p")[0].innerHTML = "&nbsp;";
      }

      function handleError(error) {
        var message = win.find(".error")[0].getEl();

        if(message)
          message.getElementsByTagName("p")[0].innerHTML = ed.translate(error);
      }

      function createElement(element, attributes) {
        var el = document.createElement(element);
        for(var property in attributes) {
          if (!(attributes[property] instanceof Function)) {
            el[property] = attributes[property];
          }
        }

        return el;
      }

      function buildHTML(json) {
        var default_class = ed.getParam("uploadimage_default_img_class", "");
        var figure = ed.getParam("uploadimage_figure", false);
        var alt_text = getInputValue("alt");

        var imgstr = "<img src='" + json["image"]["url"] + "'";

        if(default_class != "")
          imgstr += " class='" + default_class + "'";

        if(json["image"]["height"])
          imgstr += " height='" + json["image"]["height"] + "'";
        if(json["image"]["width"])
          imgstr += " width='"  + json["image"]["width"]  + "'";

        imgstr += " alt='" + alt_text + "'/>";

        if(figure) {
          var figureClass = ed.getParam("uploadimage_figure_class", "figure");
          var figcaptionClass = ed.getParam("uploadimage_figcaption_class", "figcaption");

          var figstr = "<figure";

          if (figureClass !== "")
            figstr += " class='" + figureClass + "'";
          figstr += ">" + imgstr;
          figstr += "<figcaption";
          if (figcaptionClass != "")
            figstr += " class='" + figcaptionClass + "'";
          figstr += ">" + alt_text + "</figcaption>";
          figstr += "</figure>";

          return figstr;
        } else {
          return imgstr;
        }
      }

      function getInputValue(name) {
        var inputs = form.getElementsByTagName("input");

        for(var i in inputs)
          if(inputs[i].name == name)
            return inputs[i].value;

        return "";
      }

      function getMetaContents(mn) {
        var m = document.getElementsByTagName('meta');

        for(var i in m)
          if(m[i].name == mn)
            return m[i].content;

        return null;
      }

      // Add a button that opens a window
      editor.addButton('uploadimage', {
        tooltip: ed.translate('Insert an image from your computer'),
        icon : 'image',
        onclick: showDialog
      });

      // Adds a menu item to the tools menu
      editor.addMenuItem('uploadimage', {
        text: ed.translate('Insert an image from your computer'),
        icon : 'image',
        context: 'insert',
        onclick: showDialog
      });
    }
  });

  tinymce.PluginManager.add('uploadimage', tinymce.plugins.UploadImage);
})();
