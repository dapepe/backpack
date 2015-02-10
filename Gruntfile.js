module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    paths: ["assets/css"],
                    yuicompress: true
                },
                files: {
                    "assets/css/main.css": "assets/css/style.less"
                }
            }
        },
        watch: {
            scripts: {
                files: ['index.src.html'],
                tasks: ['replace', 'minifyHtml']
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: '<%= pkg.version %>'
                        }
                    ]
                },
                files: {
                    './temp/index.html': './index.src.html'
                }
            }
        },

        minifyHtml: {
            options: {},
            dist: {
                files: {
                    'index.html': './temp/index.html'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-minify-html');

    grunt.registerTask('default', ['replace', 'minifyHtml']);
    grunt.registerTask('dev', ['replace', 'minifyHtml', 'watch']);
};
