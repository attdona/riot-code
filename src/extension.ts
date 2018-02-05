'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as shell from 'shelljs';
import { read } from 'fs';


let idle = true

let late_arrival = false

function morph_path(linux_path: string): string {
    let prjroot = path.basename(vscode.workspace.rootPath)
    let path_re = new RegExp("^.*" + prjroot);
    let real_path = linux_path.replace(path_re, vscode.workspace.rootPath)
    let sep_re = /\//g;
    real_path = real_path.replace(sep_re, "\\")
    return real_path
}

function get_defines(riot_build_h_file: string) {
    let match: RegExpExecArray;
    let set = new Set();

    // windows?
    let real_path = riot_build_h_file
    if (/^win/.test(process.platform)) {
        real_path = morph_path(riot_build_h_file)
    }

    var out = shell.cat(real_path)
    //console.log(out);
    let lines = out.split('\n');
    let re = /^(#define[\s]+)([^\s]+)[\s]+([^\s]+)$/;

    for (let line of lines) {
        if (match = re.exec(line)) {
            //console.log(`match: ${match[0]} -- <${match[2]}><${match[3]}>`);
            set.add(match[2] + "=" + match[3]);
        }
    }

    return set;
}

function get_system_includes() {
    let match: RegExpExecArray;
    let sys_includes = new Set();

    const compiler = vscode.workspace.getConfiguration().get('riot.compiler');

    // https://stackoverflow.com/questions/17939930/finding-out-what-the-gcc-include-path-is
    //let out = shell.exec(compiler + " -E -Wp,-v -xc /dev/null").stderr

    let out = shell.exec("echo | " + compiler + " -E -Wp,-v -xc -").stderr
    let lines = out.split(/\r?\n/);
    let re = /^(\s)+([^\s]+)+$/;

    for (let line of lines) {
        if (match = re.exec(line)) {
            let pitems = match[2].split('/');
            let idir: string;
            if (/^win/.test(process.platform)) {
                idir = path.join.apply(null, pitems);
            } else {
                idir = pitems.reduce((acc, part) => (path.join(acc, part)), path.sep);
            }
            try {
                let stats = fs.lstatSync(idir)
                if (stats.isDirectory()) {

                    sys_includes.add(idir);
                }

            } catch (err) {
                console.log(err);
            }
        }
    }
    return sys_includes;

}

function build_dir_exists(build_dir: string): boolean {

    let app_dir = path.join(vscode.workspace.rootPath, build_dir)
    try {
        let stats = fs.lstatSync(app_dir)
        if (!stats.isDirectory()) {
            throw "not a directory"
        }
    } catch (err) {
        vscode.window.showErrorMessage(`invalid directory ${build_dir}`)
        return false
    }
    return true

}

function build_tasks() {

    let tasks = {
        "version": "2.0.0",
        "tasks": [
            {
                "label": "",
                "type": "shell",
                "command": "make",
                // use options.cwd property if the Makefile is not in the project root ${workspaceRoot} dir
                "options": {
                    "cwd": "${config:riot.build_dir}"
                },
                // start the build without prompting for task selection, use "group": "build" otherwise
                "group": {
                    "kind": "build",
                    "isDefault": true
                },
                "presentation": {
                    "echo": true,
                    "reveal": "always",
                    "focus": false,
                    "panel": "shared"
                },
                // arg passing example: in this case is executed make QUIET=0
                "args": ["${config:riot.quiet}", "BOARD=${config:riot.board}"],
                // Use the standard less compilation problem matcher.
                "problemMatcher": {
                    "owner": "cpp",
                    "fileLocation": ["absolute"],
                    "pattern": {
                        "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
                        "file": 1,
                        "line": 2,
                        "column": 3,
                        "severity": 4,
                        "message": 5
                    }
                }
            },
            {
                "label": "",
                "type": "shell",
                "command": "make",
                // use options.cwd property if the Makefile is not in the project root ${workspaceRoot} dir
                "options": {
                    "cwd": "${config:riot.build_dir}"
                },
                // start the build without prompting for task selection, use "group": "build" otherwise
                "group": "build",
                "presentation": {
                    "echo": true,
                    "reveal": "always",
                    "focus": false,
                    "panel": "shared"
                },
                // arg passing example: in this case is executed make QUIET=0
                "args": ["${config:riot.quiet}", "BOARD=${config:riot.board}", "flash"],
                // Use the standard less compilation problem matcher.
                "problemMatcher": {
                    "owner": "cpp",
                    "fileLocation": ["absolute"],
                    "pattern": {
                        "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
                        "file": 1,
                        "line": 2,
                        "column": 3,
                        "severity": 4,
                        "message": 5
                    }
                }
            },
            {
                "label": "",
                "type": "shell",
                "command": "make",
                // use options.cwd property if the Makefile is not in the project root ${workspaceRoot} dir
                "options": {
                    "cwd": "${config:riot.build_dir}"
                },
                // start the build without prompting for task selection, use "group": "build" otherwise
                "group": "build",
                "presentation": {
                    "echo": true,
                    "reveal": "always",
                    "focus": false,
                    "panel": "shared"
                },
                // arg passing example: in this case is executed make QUIET=0
                "args": ["${config:riot.quiet}", "BOARD=${config:riot.board}", "clean"],
                "problemMatcher": []
            }


        ]
    }

    // launch.json configuration
    const config = vscode.workspace.getConfiguration();

    const build_dir: string = config.get('riot.build_dir')
    // retrieve values
    const app_name = path.basename(build_dir);

    if (build_dir_exists(build_dir)) {
        tasks.tasks[0].label = "build: " + app_name;
        tasks.tasks[1].label = "flash: " + app_name;
        tasks.tasks[2].label = "clean: " + app_name;

        mkdirp(path.join(vscode.workspace.rootPath, ".vscode"), (err) => {
            if (err) {
                console.error(err);
                return;
            };

            fs.writeFile(path.join(vscode.workspace.rootPath, ".vscode", "tasks.json"), JSON.stringify(tasks, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    return;
                };
            });

        });

    }
}

function setup() {
    let includes = new Set();
    // launch.json configuration
    const config = vscode.workspace.getConfiguration();
    const board = config.get('riot.board');
    const app_dir: string = config.get('riot.build_dir');

    const compiler: string = config.get('riot.compiler');

    // check compiler
    if (!shell.which(compiler)) {
        vscode.window.showErrorMessage(`compiler ${compiler} not found`)
    }

    let cpp_settings = {
        configurations: [
            {
                includePath: [],
                defines: [],
                name: process.platform,
                intelliSenseMode: "clang-x64",
                browse: {
                    path: []
                }
            }
        ],
        "version": 3
    }

    let system_includes = get_system_includes()

    cpp_settings.configurations[0].includePath = [...system_includes]
    cpp_settings.configurations[0].browse.path = [...system_includes]

    if (!build_dir_exists(app_dir)) {
        return
    }

    let make = spawn("make", ["QUIET=0", "BOARD=" + board, "clean", "all"], {
        cwd: path.join(vscode.workspace.rootPath, app_dir)
    });

    make.stdout.on('data', (data) => {
        let match: RegExpExecArray;

        let re = /(-I)([^\s]+)+/g;
        while (match = re.exec(data.toString())) {
            // windows?
            let real_path = match[2].toString()
            if (/^win/.test(process.platform)) {
                real_path = morph_path(real_path)
            }

            includes.add(real_path)
        }

        re = /(-include[\s]+')([^\s']+)+/g;
        while (match = re.exec(data.toString())) {
            let defines = get_defines(match[2]);
            cpp_settings.configurations[0].defines = [...defines];
        }
    });
    make.stderr.on('data', (data) => {
        let message = data.toString()

        console.log(`make stderr:\n${message}`);
        let re = /.*(The specified board .*) Stop/
        let match = re.exec(message)
        if (match) {
            vscode.window.showErrorMessage(match[1])
        } else {
            vscode.window.showErrorMessage(message)
        }

    });

    make.on('exit', function (code, signal) {
        console.log('make process exited with ' +
            `code ${code} and signal ${signal}`);

        for (let item of includes) {
            cpp_settings.configurations[0].includePath.push(item);
            cpp_settings.configurations[0].browse.path.push(item);
        }

        mkdirp(path.join(vscode.workspace.rootPath, ".vscode"), (err) => {
            if (err) {
                console.error(err);
                return;
            };
            fs.writeFile(path.join(vscode.workspace.rootPath, ".vscode", "c_cpp_properties.json"), JSON.stringify(cpp_settings, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    //return;
                };
                if (late_arrival) {
                    late_arrival = false
                    setup()
                } else {
                    idle = true
                }
            });

        });

    });

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    vscode.workspace.onDidChangeConfiguration(event => {
        const auto_sync = vscode.workspace.getConfiguration().get('riot.sync_tasks');

        let affected = event.affectsConfiguration("riot.compiler") ||
            event.affectsConfiguration("riot.board");
        if (affected) {
            // rebuild cpp project settings

            if (idle) {
                idle = false;
                setup();
            } else {
                late_arrival = true;
            }

        }

        if (auto_sync && event.affectsConfiguration("riot.build_dir")) {
            build_tasks();
        }
    })

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.riotInit', () => {
        // The code you place here will be executed every time your command is executed

        setup();

        build_tasks();

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}