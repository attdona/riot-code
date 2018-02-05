//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as riot from '../extension';
import * as fs from 'fs';

async function sleep(ms: number) {
    await _sleep(ms);
}

function _sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    test("setup", async () => {
        //let dir = vscode.workspace.getWorkspaceFolder(vscode.Uri.file('boards'))
        //this.timeout(20000);

        console.log("CWD:", process.cwd())

        const config = vscode.workspace.getConfiguration();

        await config.update('riot.compiler', 'gcc')
        await config.update('riot.board', 'native')
        await config.update('riot.compiler', 'arm-none-eabi-gcc')
        await config.update('riot.board', 'arduino-zero')

        //let res = vscode.commands.executeCommand('extension.riotInit')


        await sleep(10000)

        let fname = await vscode.workspace.findFiles('.vscode/c_cpp_properties.json');

        if (fname[0]) {
            let c_properties: Buffer = fs.readFileSync(fname[0].path);
            let cfg = JSON.parse(c_properties.toString())
            console.log(cfg)
            assert.equal(cfg.configurations[0].intelliSenseMode, "clang-x64")
            assert.equal(cfg.configurations[0].includePath.length, 11)
        } else {
            assert.fail(fname, [{fsPath:"~RIOT/.vscode/c_cpp_properties.json"}], 'c_cpp_properties.json not found')
        }
    })
});