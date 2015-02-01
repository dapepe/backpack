YAML = require('yamljs');

module.exports = function(grunt) {
    var jsSrcFiles = [];

    function buildIncludes(section, path) {
        for (var i in section) {
            if (section.hasOwnProperty(i)) {
                if (section[i] == null) {
                    jsSrcFiles.push(path + i + '.js');
                } else {
                    buildIncludes(section[i], path + i + '/');
                }
            }
        }
    }
    buildIncludes(YAML.load('./assets/includes.yml'), '');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		distFolder: 'dist',
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'assets/build/<%= pkg.name %>.js',
				dest: 'assets/build/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			options: {
				separator: ''
			},
			dist: {
				src: jsSrcFiles,
				dest: 'assets/build/<%= pkg.name %>.js'
			}
		},
		less: {
			dist: {
				options: {
					cleancss: true,
					paths: [
                        'assets/src/less/*.less'
                    ]
				},
				files: {
					"assets/build/<%= pkg.name %>.css": "assets/src/less/main.less"
				}
			}
		},
		jsvalidate: {
			options:{
				globals: {},
				esprimaOptions: {},
				verbose: false
			},
			targetName:{
				files:{
					files: jsSrcFiles
				}
			}
		},
        watch: {
            css: {
                files: ['assets/src/less/*.less'],
                tasks: ['less']
            }
        },
		compress: {
			main: {
				options: {
					mode: 'zip',
					archive: './releases/<%= pkg.name %>-<%= pkg.version %>.zip'
				},
				files: [
					{src: ['./*'], filter: 'isFile'}, // includes files in path
					{src: [
						'.cfignore',
						'.htaccess',
						'./.bp-config/**',
						'./assets/**',
						'./bower_components/**',
						'./cache/**',
						'./instances/**',
						'./lib/**',
						'./vendor/**'
					]}
				]
			}
		},
		clean: {
			release: [
				'instances/bluemixdemo/cache/',
				'instances/localdemo/cache/'
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsvalidate');

    /**
     * Task to create the initialization file for require.js
     */
    grunt.registerTask('requirejs', 'Build the includes', function(arg1) {
        var fs = require('fs'),
            _  = require('underscore');

        // Add the primary libraries for requirejs
        var requirejs = [
            'bower_components/ckeditor/ckeditor.js',
            'assets/mootools/mootools-core-1.5.1.js',
            'assets/mootools/mootools-more-1.5.1.js',
            'bower_components/ace/src-min-noconflict/ace.js',
            'bower_components/gx-core/dist/gx-core.min.js',
            'bower_components/gx-bootstrap/dist/gx-bootstrap.min.js'
        ];

        // Initalize bust parameter for Require JS
        var bustVerstion = '"bust="+(new Date()).getTime()';

        // Add the components
        if (arg1 == null || arg1 === 'dist') {
            requirejs.push('assets/build/backpack.min.js');
        } else {
            _.each(jsSrcFiles, function(src) {
                requirejs.push(src);
            });
        }

        var includes = [];
        _.each(requirejs, function(lib) {
            includes.push('<script language="JavaScript" type="text/javascript" src="{{prefix}}/' + lib + '"></script>');
        });

        //
        var initFile = fs.readFileSync('./assets/src/template/index.html');
        fs.writeFileSync(
            './assets/build/index.html',
            initFile.toString()
                .replace(/<!-- INCLUDES -->/, includes.join("\n"))
        );
    });

	grunt.registerTask('default' , ['jsvalidate', 'concat', 'less', 'uglify', 'requirejs:dist']);
	grunt.registerTask('dev'     , ['requirejs:dev', 'less', 'watch']);
	grunt.registerTask('release' , ['default', 'clean', 'compress']);
};
