# Developing RIOT apps with vscode 

This is a no-frills and (currently) a minimalist extension with the aim to ease the setup of vscode for RIOT-based development.  

As prerequisite install [C/C++ for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) extension.


## Getting started

This is an initial effort that has tested on ubuntu machine and arm gcc environment.

Please fill an issue/PR to give feedback and improve the tool.

Before publishing to marketplace if you like give a try installing with:

    > cd $HOME/.vscode/extensions # vscode extensions dir on linux
    > git clone  https://github.com/attdona/riot-code

    > cd <your_path_to>/RIOT # RIOT base dir
    > code . 

For default BOARD is set to `native` and the build directory to `examples/hello-world`.
To change this default setting open Settings (keyboard `Ctrl+,` or menu `File->Preferences->Settings`) and search `RIOT-OS` section.

Modify `riot.board` and `riot.build_dir` with your values;
Press `F1` or `Ctrl+Shift+P` and select command `RIOT init`:

`RIOT init` setup the right configuration (check `.vscode/c_cpp_properties.json`) and creates three tasks:

1. build: <app_name>
2. clean: <app_name>
3. flash: <app_name>

To run these tasks select `Tasks->Run Tasks`

Enjoy RIOT coding with vscode!


