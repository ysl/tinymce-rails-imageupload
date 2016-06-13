# -*- encoding: utf-8 -*-
# stub: tinymce-rails-imageupload 4.0.16.beta ruby lib

Gem::Specification.new do |s|
  s.name = "tinymce-rails-imageupload"
  s.version = "4.0.16.beta"

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Per Christian B. Viken"]
  s.date = "2016-06-12"
  s.description = "TinyMCE plugin for taking image uploads in Rails >= 3.2. Image storage is handled manually, so works with everything."
  s.email = ["perchr@northblue.org"]
  s.files = ["CHANGELOG.md", "LICENSE", "README.md", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/de.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/en.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/es.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/fr.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/fr_FR.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/nb.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/pl.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/pt.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/pt_BR.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/ru.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/zh-cn.js", "app/assets/javascripts/tinymce/plugins/uploadimage/langs/zh_TW.js", "app/assets/javascripts/tinymce/plugins/uploadimage/plugin.js", "lib/tasks/tinymce-uploadimage-assets.rake", "lib/tinymce-rails-imageupload.rb", "lib/tinymce-rails-imageupload/rails.rb", "lib/tinymce-rails-imageupload/version.rb"]
  s.homepage = "http://eastblue.org/oss"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.4.8"
  s.summary = "TinyMCE plugin for taking image uploads in Rails >= 3.2"

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<railties>, ["< 5", ">= 3.2"])
      s.add_runtime_dependency(%q<tinymce-rails>, ["~> 4.0"])
      s.add_development_dependency(%q<bundler>, ["~> 1.0"])
      s.add_development_dependency(%q<rails>, [">= 3.1"])
    else
      s.add_dependency(%q<railties>, ["< 5", ">= 3.2"])
      s.add_dependency(%q<tinymce-rails>, ["~> 4.0"])
      s.add_dependency(%q<bundler>, ["~> 1.0"])
      s.add_dependency(%q<rails>, [">= 3.1"])
    end
  else
    s.add_dependency(%q<railties>, ["< 5", ">= 3.2"])
    s.add_dependency(%q<tinymce-rails>, ["~> 4.0"])
    s.add_dependency(%q<bundler>, ["~> 1.0"])
    s.add_dependency(%q<rails>, [">= 3.1"])
  end
end
