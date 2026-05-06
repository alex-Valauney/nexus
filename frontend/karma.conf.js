// karma.conf.js
process.env.CHROME_BIN = '/usr/bin/google-chrome';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false  // Pour des tests déterministes
      },
      clearContext: false // Garde la sortie visible
    },
    jasmineHtmlReporter: {
      suppressAll: true // Supprime le doublon des traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    },
    browsers: ['ChromeHeadlessCI'],
    singleRun: true,
    autoWatch: false,
    restartOnFileChange: true
  });
};