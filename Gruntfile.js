module.exports = function (grunt) {
	"use strict";
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			main: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		browserify: {
			main: {
				src: 'js/<%= pkg.main %>',
				dest: 'dist/<%= pkg.name %>.js'
			},
			options: {
				transform: [['babelify', {
					sourceMap: true
						}]]
			}
		},
		jshint: {
			main: ['Gruntfile.js', 'js/*.js'],
			options: {
				jshintrc: ".jshintrc"
			}
		},
		babel: {
			options: {
				//sourceMap: true
			},
			main: {
				files: [{
					"expand": true,
					"cwd": "js/",
					"src": ["*.js"],
					"dest": "tmp/",
					"ext": ".js"
                }]
			}
		},
		less: {
			main: {
				files: [{
					expand: true, // Enable dynamic expansion.
					cwd: 'js/', // Src matches are relative to this path.
					src: ['**/*.less'], // Actual pattern(s) to match.
					dest: 'tmp/', // Destination path prefix.
					ext: '.css', // Dest filepaths will have this extension.
                }]
			}
		},
		concat: {
			main: {
				files: {
					'dist/estilos.css': ['css/*.css', 'tmp/**/*.css']
				}
			}
		},
		copy: {
			main: {
				expand: true,
				cwd: 'tmp',
				src: '*.js.map',
				dest: 'dist/',
			}
		},
		watch: {
			scripts: {
				files: 'js/**/*.js',
				tasks: ["js"]
			},
			styles: {
				files: 'js/**/*.less',
				tasks: ['css']
			}

		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');


	// Default task(s).
	grunt.registerTask('default', ['jshint', 'browserify', 'less','concat']);
	grunt.registerTask('js', ['jshint', 'browserify']);
	grunt.registerTask('css', ['less', 'concat']);

};
