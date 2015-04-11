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
			  transform: [['babelify', {sourceMap:true}]]
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
		copy: {
			main: {
				expand:true,
				cwd: 'tmp',
				src: '*.js.map',
				dest: 'dist/',
			}
		},
		watch: {
			scripts: {
				files: 'js/**/*.js',
				tasks: ["default"]
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'browserify']);

};