module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
      }
    },
    eslint: {
      options: {
        fix: true,
        cache: true
      },
      target: ['build/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-babel');
  grunt.registerTask('default', ['babel', 'eslint']);
};
