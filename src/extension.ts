'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as shell from 'shelljs';


function get_defines(riot_build_h_file) {
    let match: RegExpExecArray;
    let set = new Set();

    var out = shell.cat(riot_build_h_file)
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
    let out = shell.exec(compiler+" -E -Wp,-v -xc /dev/null").stderr

    let lines = out.split('\n');
    let re = /^(\s)([^\s]+)+$/;

    for (let line of lines) {
        if (match = re.exec(line)) {
            let pitems = match[2].split(path.sep);

            // let idir = path.join.apply(null, pitems);
            let idir = pitems.reduce((acc, part) => (path.join(acc, part)), path.sep);
            sys_includes.add(idir);
        }
    }

    return sys_includes;

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
                "group": {
                    "kind": "build",
                    "isDefault": false
                },
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
                "group": {
                    "kind": "build",
                    "isDefault": false
                },
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

    // retrieve values
    const app_name = path.basename(config.get('riot.build_dir'));

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

function setup() {
    let includes = new Set();
    // launch.json configuration
    const config = vscode.workspace.getConfiguration();
    const board = config.get('riot.board');
    const app_dir: string = config.get('riot.build_dir');

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
        ]
    }

    let system_includes = get_system_includes()

    cpp_settings.configurations[0].includePath = [...system_includes]
    cpp_settings.configurations[0].browse.path = [...system_includes]

    let make = spawn("make", ["QUIET=0", "BOARD=" + board, "clean", "all"], {
        cwd: path.join(vscode.workspace.rootPath, app_dir)
    });

    make.stdout.on('data', (data) => {
        let match: RegExpExecArray;

        //let vals = data.toString().match(/(?:-I)([/\w])+/g);
        let re = /(-I)([^\s]+)+/g;
        while (match = re.exec(data.toString())) {
            //console.log("BINGO:", match);
            includes.add(match[2].toString());
        }

        re = /(-include[\s]+')([^\s']+)+/g;
        while (match = re.exec(data.toString())) {
            let defines = get_defines(match[2]);
            cpp_settings.configurations[0].defines = [...defines];
        }
    });
    make.stderr.on('data', (data) => {
        console.log(`make stderr:\n${data}`);
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
                    return;
                };

            });

        });

    });

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    vscode.workspace.onDidChangeConfiguration(event => {
        let affected = event.affectsConfiguration("riot.compiler");
        if (affected) {
            // rebuild cpp project settings
            setup();
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