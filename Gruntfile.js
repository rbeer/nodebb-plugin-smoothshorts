module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  var execFile = require('child_process').execFile;

  grunt.initConfig({
    babel: {
      options: {
        presets: ['es2015']
      },
      build: {
        files: [
          {
            expand: true,
            cwd: './',
            src: ['**/*.js', '!build/**', '!node_modules/**', '!Gruntfile.js'],
            dest: 'build/'
          }
        ]
      },
      publish: {
        files: [
          {
            expand: true,
            cwd: './',
            src: ['**/*.js', '!build/**', '!publish/**', '!node_modules/**', '!Gruntfile.js'],
            dest: 'publish/'
          }
        ]
      }
    },
    eslint: {
      options: {
        // auto-fix the mess babel produces
        // (mainly space-before-function-paren :rage:)
        fix: true,
        // max-len warnings be cluttering
        quiet: true
      },
      build: ['build/**/*.js'],
      publish: ['publish/**/*.js']
    },
    clean: {
      build: ['build/*', '!node_modules/**'],
      publish: ['publish/*', '!node_modules/**']
    },
    copy: {
      build: {
        src: ['package.json', 'plugin.json', '**/*.{tpl,css}', '!node_modules/**'],
        dest: 'build/'
      },
      publish: {
        src: [
          'package.json',
          'plugin.json',
          '**/*.{tpl,css}',
          'assets/*',
          'README.md',
          'CHANGELOG.md',
          'LICENSE',
          '!node_modules/**',
          '!build/*'],
        dest: 'publish/'
      }
    }
  });

  grunt.registerTask('restart', 'Restart NodeBB', function() {
    grunt.log.writeln('Restarting NodeBB...');
    execFile('pkill', ['-SIGHUP', '-f', 'loader.js']);
  });
  grunt.registerTask('default', ['clean', 'babel', 'eslint', 'copy', 'restart']);
  grunt.registerTask('publish', ['clean:publish', 'babel:publish', 'eslint:publish', 'copy:publish']);
};
