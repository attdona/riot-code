# A simple vscode extension for RIOT

This is an initial version that has been tested on ubuntu 16.04 and 17.10 with `arm-none-eabi-gcc` cross compiler.

![demo](https://raw.githubusercontent.com/attdona/riot-code/master/images/riot-code.gif)

## Prerequisite

[C/C++ for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) is a required extension.

## Getting started

`native` is the default `board` and `examples/hello-world` is the default build directory.

To change these properties:
* open Settings (keyboard `Ctrl+,` or menu `File->Preferences->Settings`) and search `RIOT-OS` section
* modify `riot.board` and `riot.build_dir` with your values.
* change `compiler` value with your toolchain compiler executable (the only tested cross compiler is `arm-none-eabi-gcc`)

Press `F1` or `Ctrl+Shift+P` and run the command `RIOT init` to create both the project configuration and the three tasks:

* build: *app_name*
* clean: *app_name*
* flash: *app_name*

where *app_name* is the directory basename of `riot.build_dir`.

Select `Tasks->Run Tasks` to run the tasks.

**NOTE**: If you change `riot.board` or/and `riot.build_dir` rerun `RIOT init` command.

Fill an issue or post a PR to help improving the tool.

Enjoy RIOT coding with vscode!
