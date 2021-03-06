module.exports = function(grunt) {
  'use strict';

  var fs = require('fs');
  var symlink = fs.symlink;
  var unlink = fs.unlink;

  var cp = require('child_process');
  var execSync = cp.execSync;
  var spawn = cp.spawn;

  var path = require('path');

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    NodeBB: '../../dev/',
    pkg: grunt.file.readJSON('package.json'),
    buildPath: {
      _buildsBase: function(relative) {
        return relative ? 'builds' : __dirname + '/builds';
      },
      current: '<%= buildPath._buildsBase() %>/current',
      dev: '<%= buildPath._buildsBase() %>/dev',
      publish: '<%= buildPath._buildsBase() %>/publish',
      npm_install: path.resolve(__dirname, '../'),
      npm_module: '<%= buildPath.npm_install %>/node_modules/<%= pkg.name %>'
    },
    babel: {
      options: {
        presets: [ 'es2015' ]
      },
      dev: {
        files: [
          {
            expand: true,
            cwd: './',
            src: [ '**/*.js', '!<%= buildPath._buildsBase(true) %>/**/**', '!node_modules/**' ],
            dest: '<%= buildPath.dev %>'
          }
        ]
      },
      publish: {
        files: [
          {
            expand: true,
            cwd: './',
            src: [ '**/*.js', '!<%= buildPath._buildsBase(true) %>/**/**', '!node_modules/**' ],
            dest: '<%= buildPath.publish %>'
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
      dev: [ '<%= buildPath.dev %>/**/*.js' ],
      publish: [ '<%= buildPath.publish %>/**/*.js' ]
    },
    clean: {
      dev: [ '<%= buildPath.dev %>/*', '!node_modules/**' ],
      publish: [ '<%= buildPath.publish %>/*', '!node_modules/**' ],
      npm: {
        options: {
          force: true
        },
        src: [ '<%= buildPath.npm_module %>/*' ]
      }
    },
    copy: {
      dev: {
        src: [
          'package.json',
          'plugin.json',
          'public/locales/**/*.json',
          '**/*.{tpl,css}',
          '!node_modules/**',
          '!<%= buildPath._buildsBase(true) %>/**/**'
        ],
        dest: '<%= buildPath.dev %>/'
      },
      publish: {
        src: [
          'package.json',
          'plugin.json',
          'public/locales/**/*.json',
          '**/*.{tpl,css}',
          'assets/*',
          'README.md',
          'CHANGELOG.md',
          'LICENSE',
          '!node_modules/**',
          '!<%= buildPath._buildsBase(true) %>/**/**' ],
        dest: '<%= buildPath.publish %>/'
      }
    },
    symlink: {
      dev: {
        link: '<%= buildPath.current %>',
        target: '<%= buildPath.dev %>',
        linkNodeBB: true
      },
      publish: {
        link: '<%= buildPath.current %>',
        target: '<%= buildPath.publish %>'
      },
      npm: {
        link: '<%= buildPath.current %>',
        target: '<%= buildPath.npm_module %>'
      },
      NodeBB: {
        link: '<%= NodeBB %>/node_modules/<%= pkg.name %>',
        target: '<%= buildPath.current %>'
      }
    },
    npm_install: {
      default: {
        cwd: '<%= buildPath.npm_install %>',
        packageDir: '<%= buildPath.publish %>'
      }
    }
  });

  grunt.registerMultiTask('symlink', 'Link last build to NodeBB', function() {
    var done = grunt.task.current.async();

    var data = grunt.task.current.data;
    var sym = {
      link: path.normalize(grunt.template.process(data.link)),
      target: path.normalize(grunt.template.process(data.target + '/'))
    };
    var isNodeBB = grunt.task.current.target === 'NodeBB';

    var chktarget = function(cb) {
      grunt.log.write('Checking target...');
      fs.lstat(sym.target, function(err, stats) {
        if (err) {
          if (err.code === 'ENOENT') {
            grunt.log.verbose.error('Can\'t access \'' + sym.target + '\' !');
          }
          return done(err);
        }
        if (!stats.isDirectory() && !stats.isSymbolicLink()) {
          grunt.log.error();
          grunt.log.verbose.error('Target must be a symlink or directory!');
          return done(err);
        }
        grunt.log.ok();
        cb();
      });
    };

    var _unlink = function(cb) {
      grunt.log.write('Removing link...');
      unlink(sym.link, function(err) {
        var okmsg = 'deleted';
        if (err) {
          if (err.code === 'EISDIR') {
            grunt.log.writeln('Link is a directory!'['yellow']);
            grunt.log.warn(err);
            return done(err);
          } else if (err.code === 'ENOENT') {
            okmsg = 'No link to delete';
          }
        }
        grunt.log.ok(okmsg);
        cb();
      });
    };

    var _symlink = function() {
      var linkpath = path.relative(__dirname, sym.link);
      grunt.log.write(isNodeBB ? 'Linking into NodeBB...' :
                                 'Writing link \'' + linkpath + '\'...');
      symlink(sym.target, sym.link, function(err) {
        if (err) {
          grunt.log.error();
          return done(err);
        }
        grunt.log.ok();
        done();
      });
    };

    if (!isNodeBB && data.linkNodeBB) {
      grunt.task.run('symlink:NodeBB');
    }

    chktarget(function() {
      _unlink(function() {
        _symlink();
      });
    });
  });

  grunt.registerMultiTask('npm_install', 'Test NPM installation', function() {
    var done = grunt.task.current.async();
    var verbose = grunt.verbose;

    var packageDir = grunt.task.current.data.packageDir;
    var cwd = grunt.task.current.data.cwd;

    var installProc = spawn('npm', [ 'i', packageDir ], { cwd: cwd });

    installProc.stdout.on('data', grunt.log.writeln);

    installProc.stderr.on('data', verbose.error);

    installProc.on('close', function(code) {
      if (code !== 0) {
        return done(new Error('NPM install failed!'));
      }
      grunt.log.ok('NPM install good.');
      done();
    });
  });

  grunt.registerTask('restart', 'Restart NodeBB dev instance', function() {
    grunt.log.write('Restarting NodeBB...');
    var pkillOut = execSync('pkill -fe -SIGHUP "loader.js --no-daemon --no-silent"')
                   .toString().split('\n');

    pkillOut.filter(function(line) {
      if (line.startsWith('nodejs')) {
        grunt.log.ok('@ ' + line.match(/\(pid (\d*)\)/)[1]);
        return false;
      }
      return true;
    });
    if (pkillOut.length < 3) {
      grunt.log.write('No NodeBB instance is running in dev mode!'['yellow']);
    }
  });

  grunt.registerTask('dev', [
    'clean:dev',
    'babel:dev',
    'eslint:dev',
    'copy:dev',
    'restart'
  ]);
  grunt.registerTask('dev:symlinks', [
    'dev',
    'symlink:dev'
  ]);

  grunt.registerTask('publish', [
    'clean:publish',
    'babel:publish',
    'eslint:publish',
    'copy:publish'
  ]);

  grunt.registerTask('publish:symlinks', [
    'publish',
    'symlink:publish'
  ]);

  grunt.registerTask('npm', [
    'clean:npm',
    'npm_install',
    'symlink:npm'
  ]);

  grunt.registerTask('deploy', ['publish', 'npm']);
};
