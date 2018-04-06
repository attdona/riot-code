'use strict'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as shell from 'shelljs'
import { ChildProcess } from 'child_process'
import { platform } from 'os'

interface Config {
  workspace_root: string
  app_dir: string
  board: string
  compiler: string
  compiler_path: string
}

let idle = true

let late_arrival = false

let project: Config = {
  workspace_root: '',
  app_dir: '',
  board: '',
  compiler: '',
  compiler_path: '',
}

function build_dir(): string {
  let make_dir = path.join(project.workspace_root, project.app_dir)

  return make_dir
}

function posixToWindows(pth: string) {
  let path_re = /(^\/)(\w)(\/.*)/
  let match = path_re.exec(pth)
  let result = `${match[2]}:${match[3]}`

  return result.replace(/\\/g, '/')
}

function windowsToPosix(pth: string) {
  let path_re = /^(\w):(.*)/
  let match = path_re.exec(pth)
  let result = `/${match[1]}${match[2]}`

  return result.replace(/\\/g, '/')
}

export function get_includes(data: string) {
  let set: Set<string> = new Set()
  let match: RegExpExecArray | null

  let re = /(-I)([^\s]+)+/g
  while ((match = re.exec(data.toString()))) {
    let real_path = match[2].toString()
    set.add(real_path)
  }

  return set
}

function get_defines(riot_build_h_file: string) {
  let match: RegExpExecArray
  let set = new Set()

  if (/gcc$/.test(project.compiler)) {
    set.add('__GNUC__')
  }

  // windows?
  let real_path = riot_build_h_file
  if (/^win/.test(process.platform)) {
    real_path = posixToWindows(riot_build_h_file)
  }

  var out = shell.cat(real_path)
  //console.log(out);
  let lines = out.split('\n')
  let re = /^(#define[\s]+)([^\s]+)[\s]+([^\s]+)$/

  for (let line of lines) {
    if ((match = re.exec(line))) {
      //console.log(`match: ${match[0]} -- <${match[2]}><${match[3]}>`);
      set.add(match[2] + '=' + match[3])
    }
  }

  return set
}

function get_system_includes() {
  let match: RegExpExecArray
  let sys_includes = new Set()

  const compiler = vscode.workspace.getConfiguration().get('riot.compiler')

  // https://stackoverflow.com/questions/17939930/finding-out-what-the-gcc-include-path-is
  let out = shell.exec('echo | ' + compiler + ' -E -Wp,-v -xc -').stderr
  let lines = out.split(/\r?\n/)
  let re = /^(\s)+([^\s]+)+$/

  for (let line of lines) {
    if ((match = re.exec(line))) {
      let pitems = match[2].split('/')
      let idir: string
      if (/^win/.test(process.platform)) {
        idir = path.join.apply(null, pitems)
      } else {
        idir = pitems.reduce((acc, part) => path.join(acc, part), path.sep)
      }
      try {
        let stats = fs.lstatSync(idir)
        if (stats.isDirectory()) {
          sys_includes.add(idir)
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
  return sys_includes
}

function build_dir_exists(build_dir: string): boolean {
  try {
    let stats = fs.lstatSync(build_dir)
    if (!stats.isDirectory()) {
      throw new Error('not a directory')
    }
  } catch (err) {
    vscode.window.showErrorMessage(`invalid directory ${build_dir}`)
    return false
  }
  return true
}

function build_tasks() {
  let make_cmd =
    project.compiler_path === ''
      ? 'make'
      : 'PATH=${config:riot.compiler_path}:$PATH make'
  let tasks = {
    version: '2.0.0',
    tasks: [
      {
        label: '',
        type: 'shell',
        command: make_cmd,
        // use options.cwd property if the Makefile is not in the project root ${workspaceRoot} dir
        options: {
          cwd: '${config:riot.build_dir}',
        },
        // start the build without prompting for task selection, use "group": "build" otherwise
        group: {
          kind: 'build',
          isDefault: true,
        },
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
        // arg passing example: in this case is executed make QUIET=0
        args: ['${config:riot.quiet}', 'BOARD=${config:riot.board}'],
        // Use the standard less compilation problem matcher.
        problemMatcher: {
          owner: 'cpp',
          fileLocation: ['absolute'],
          pattern: {
            regexp: '^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$',
            file: 1,
            line: 2,
            column: 3,
            severity: 4,
            message: 5,
          },
        },
      },
      {
        label: '',
        type: 'shell',
        command: 'make',
        // use options.cwd property if the Makefile is not in the project root ${workspaceRoot} dir
        options: {
          cwd: '${config:riot.build_dir}',
        },
        // start the build without prompting for task selection, use "group": "build" otherwise
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
        // arg passing example: in this case is executed make QUIET=0
        args: ['${config:riot.quiet}', 'BOARD=${config:riot.board}', 'flash'],
        // Use the standard less compilation problem matcher.
        problemMatcher: {
          owner: 'cpp',
          fileLocation: ['absolute'],
          pattern: {
            regexp: '^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$',
            file: 1,
            line: 2,
            column: 3,
            severity: 4,
            message: 5,
          },
        },
      },
      {
        label: '',
        type: 'shell',
        command: 'make',
        // use options.cwd property if the Makefile is not in the project root ${workspaceRoot} dir
        options: {
          cwd: '${config:riot.build_dir}',
        },
        // start the build without prompting for task selection, use "group": "build" otherwise
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
        // arg passing example: in this case is executed make QUIET=0
        args: ['${config:riot.quiet}', 'BOARD=${config:riot.board}', 'clean'],
        problemMatcher: [],
      },
    ],
  }

  // launch.json configuration
  const app_name = path.basename(project.app_dir)
  let dir = build_dir()

  if (build_dir_exists(dir)) {
    tasks.tasks[0].label = 'build: ' + app_name
    tasks.tasks[1].label = 'flash: ' + app_name
    tasks.tasks[2].label = 'clean: ' + app_name

    mkdirp(path.join(vscode.workspace.rootPath, '.vscode'), err => {
      if (err) {
        console.error(err)
        return
      }

      fs.writeFile(
        path.join(vscode.workspace.rootPath, '.vscode', 'tasks.json'),
        JSON.stringify(tasks, null, 4),
        err => {
          if (err) {
            console.error(err)
            return
          }
        },
      )
    })
  }
}

function check_for_pending_requests() {
  if (late_arrival) {
    late_arrival = false
    setup()
  } else {
    idle = true
  }
}

interface CppSettings {
  configurations: [
    {
      includePath: string[]
      defines: string[]
      name: string
      intelliSenseMode: string
      browse: {
        path: string[]
      }
    }
  ]
  version: number
}

function setup() {
  let includes = new Set()

  // check compiler
  if (!shell.which(project.compiler)) {
    vscode.window.showErrorMessage(`compiler ${project.compiler} not found`)
  }

  let cpp_settings: CppSettings = {
    configurations: [
      {
        includePath: [],
        defines: [],
        name: process.platform,
        intelliSenseMode: 'clang-x64',
        browse: {
          path: [],
        },
      },
    ],
    version: 3,
  }

  let system_includes = get_system_includes()

  cpp_settings.configurations[0].includePath = [...system_includes]
  cpp_settings.configurations[0].browse.path = [...system_includes]

  let make_dir = build_dir()
  if (!build_dir_exists(make_dir)) {
    return
  }

  shell.cd(make_dir)

  let riot_build_h: string = path.join(
    make_dir,
    'bin',
    project.board,
    'riotbuild',
    'riotbuild.h',
  )

  if (/^win/.test(process.platform)) {
    riot_build_h = windowsToPosix(riot_build_h)
  }

  let riot_build_h_output: shell.ExecOutputReturnValue = shell.exec(
    `make BOARD=${project.board} clean ${riot_build_h}`,
  )

  if (riot_build_h_output.code !== 0) {
    vscode.window.showErrorMessage(
      `cd ${project.app_dir}; make BOARD=${
        project.board
      } clean ${riot_build_h}`,
    )
    return
  }

  let make_output: shell.ExecOutputReturnValue = shell.exec(
    `make -n QUIET=0 BOARD=${project.board}`,
    { silent: true },
  )

  if (make_output.code != 0) {
    vscode.window.showErrorMessage(
      `cd ${project.app_dir}; make -n QUIET=0 BOARD=${project.board}`,
    )
    return
  }

  includes = get_includes(make_output.stdout.toString())
  let idirs = [...includes]
    .sort()
    .map(dir =>
      path.resolve(
        project.workspace_root,
        project.app_dir,
        /^win/.test(process.platform) ? posixToWindows(dir) : dir,
      ),
    )

  for (let item of idirs) {
    cpp_settings.configurations[0].includePath.push(item)
    cpp_settings.configurations[0].browse.path.push(item)
  }

  let defines = get_defines(riot_build_h)

  cpp_settings.configurations[0].defines = [...defines]

  mkdirp(path.join(project.workspace_root, '.vscode'), err => {
    if (err) {
      vscode.window.showErrorMessage(err.message)
      return
    }
    fs.writeFile(
      path.join(project.workspace_root, '.vscode', 'c_cpp_properties.json'),
      JSON.stringify(cpp_settings, null, 4),
      err => {
        if (err) {
          vscode.window.showErrorMessage(err.message)
          return
        }
        check_for_pending_requests()
      },
    )
  })
}

var old_compiler_path = ''

function init_config() {
  project.workspace_root = ''

  if (vscode.workspace.workspaceFolders) {
    for (let folder of vscode.workspace.workspaceFolders) {
      if (/RIOT/.test(folder.uri.path)) {
        project.workspace_root = folder.uri.fsPath
      }
    }
  }

  if (project.workspace_root) {
    const config = vscode.workspace.getConfiguration()
    project.board = <string>config.get('riot.board')
    project.app_dir = <string>config.get('riot.build_dir')
    project.compiler = <string>config.get('riot.compiler')
    project.compiler_path = <string>config.get('riot.compiler_path')

    let sep = /^win/.test(process.platform) ? ';' : ':'
    // let cpath = <string>config.get('riot.compiler_path')
    if (old_compiler_path !== '') {
      let re = new RegExp(`^${old_compiler_path}${sep}`)
      if (re.test(shell.env['PATH'])) {
        shell.env['PATH'] = shell.env['PATH'].replace(re, '')
      }
    }
    if (project.compiler_path !== '') {
      shell.env['PATH'] = `${project.compiler_path}${sep}${shell.env['PATH']}`
    }

    old_compiler_path = project.compiler_path
  } else {
    vscode.window.showErrorMessage(
      'unable to setup anything: open RIOT folder first',
    )
    return false
  }

  return true
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onDidChangeConfiguration(event => {
    if (init_config()) {
      let cfg = vscode.workspace.getConfiguration()
      const auto_sync = cfg.get('riot.sync_tasks')

      let affected =
        event.affectsConfiguration('riot.compiler') ||
        event.affectsConfiguration('riot.compiler_path') ||
        event.affectsConfiguration('riot.board')
      if (affected) {
        // rebuild cpp project settings
        if (idle) {
          idle = false
          setup()
        } else {
          late_arrival = true
        }
      }

      affected =
        event.affectsConfiguration('riot.build_dir') ||
        event.affectsConfiguration('riot.compiler_path')
      if (auto_sync && affected) {
        build_tasks()
      }
    }
  })

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.riotInit', () => {
    // The code you place here will be executed every time your command is executed
    if (init_config()) {
      setup()
      build_tasks()
    }
  })

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
