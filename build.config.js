module.exports = {
  ng_appname: 'just',

  build_dir: 'build',
  compile_dir: 'dist',
  config_dir: './config/',
  doc_dir: 'docs',
  coverage_dir: 'coverage',

  config_files: {
    json: ['config/*.json']
  },
  app_files: {
    js: [
      'src/app/**/*.js'
    ],

    atpl: ['src/app/**/*.html'],

    sass: 'src/scss/screen.scss'
  },
  translations_files: {
      json: ['config/translations/**.json']
  },

  test_files: {
    js: [
      'bower_components/angular-mocks/angular-mocks.js'
    ]
  },

  vendor_files: {
    js: [
      'bower_components/underscore/underscore.js',
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'bower_components/jquery-resize/jquery.ba-resize.min.js',
      'bower_components/showdown/compressed/showdown.js',
      'bower_components/lodash/dist/lodash.min.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-promise-tracker/promise-tracker.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.js',
      'bower_components/angular-local-storage/dist/angular-local-storage.js',
      'bower_components/jsonapi-datastore/dist/ng-jsonapi-datastore.min.js',
      'bower_components/slick-carousel/slick/slick.js',
      'bower_components/angular-slick/dist/slick.js',
      'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
      'bower_components/angular-google-maps/dist/angular-google-maps.min.js',
      'bower_components/js-custom-select/js/customSelect.js',
      'bower_components/oi.select/dist/select.min.js',
      'bower_components/angular-elastic/elastic.js',
      'bower_components/angular-google-analytics/dist/angular-google-analytics.js'
    ],
    css: [
      'bower_components/bootstrap/dist/css/bootstrap.min.css',
      'bower_components/slick-carousel/slick/slick.css',
      'bower_components/slick-carousel/slick/slick-theme.css',
      'bower_components/js-custom-select/css/style.css',
      'bower_components/oi.select/dist/select.min.css'
    ],
    assets: [

    ]
  }
};
