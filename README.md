# A simple vscode extension for RIOT

A Multi Platform plugin for RIOT-OS based projects.

![demo](https://raw.githubusercontent.com/attdona/riot-code/master/images/riot-code.gif)

## Prerequisite

Just be sure RIOT build successfully:

    riot.build_dir> make BOARD=your-board # for example riot.build_dir = ~RIOT/example/hello-world

[C/C++ for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) is a required extension.

## Getting started

`native` is the default `board` and `examples/hello-world` is the default build directory.

To change these properties:
* open Settings (keyboard `Ctrl+,` or menu `File->Preferences->Settings`) and search `RIOT-OS` section
* modify `riot.board` and `riot.build_dir` with your values.
* set `compiler` value. The currently tested cross compilers are:
  * `arm-none-eabi-gcc`
  * `msp430-gcc`

Press `F1` or `Ctrl+Shift+P` and run the command `RIOT init` to create both the project configuration and the three tasks:

* build: *app_name*
* clean: *app_name*
* flash: *app_name*

where *app_name* is the directory basename of `riot.build_dir`.

Select `Tasks->Run Tasks` to run the tasks.

W

**NOTE**: Starting with version 1.0.0 `c_cpp_properties.json` is **NOT MORE** automatically adjusted if you change `riot.board` or/and `riot.build_dir`:
You need to run `RIOT init` command.

