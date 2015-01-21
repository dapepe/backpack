module.exports = function(grunt) {
    grunt.initConfig({
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
                files: ["assets/css/*.less", "./src/*"],
                tasks: ["less", "markdown"]
            }
        },
        markdown: {
            all: {
                files: {
                    'index.html': './src/index.md'
                },
                options: {
                    template: './src/template.html',
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-markdown');

    grunt.registerTask('default', ['less', 'markdown']);
    grunt.registerTask('dev'    , ['less', 'markdown', 'watch']);
};
