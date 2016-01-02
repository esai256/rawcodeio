module.exports = function(grunt) {

  grunt.initConfig({

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'public/css/main.min.css': ['public/css/hljs/zenbrun.css', 'public/css/normalize.css', 'public/css/colors.css', 'public/css/main.css'],
        },
      },
    },
    uglify: {
      js: {
        files: {
          'public/js/main.min.js': ['public/js/jquery.js', 'public/js/hljs.js', 'public/js/typeahead.jqurey.min.js', 'public/js/typeahead.js', 'public/js/clipboard.min', 'public/js/main.js', 'public/js/keybindings.js'],
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify', 'cssmin']);

};