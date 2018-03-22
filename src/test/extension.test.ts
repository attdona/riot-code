//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as shell from 'shelljs';
import {expected} from './fixtures/c_cpp_properties';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
//import * as riot from '../extension';
import * as fs from 'fs';

async function sleep(ms: number) {
    await _sleep(ms);
}

function _sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    test("setup", async function () {
        this.timeout(20000);
        let cfg: any;
        let actual_properties: string = "";

        const config = vscode.workspace.getConfiguration();

        await config.update('riot.compiler', 'gcc')
        await config.update('riot.board', 'native')
        await config.update('riot.compiler', 'arm-none-eabi-gcc')
        await config.update('riot.board', 'arduino-zero')

        await sleep(500);
        let fname = await vscode.workspace.findFiles('.vscode/c_cpp_properties.json');
        if (fname[0]) {
            actual_properties = fs.readFileSync(fname[0].path).toString();
            cfg = JSON.parse(actual_properties);
            assert.equal(cfg.configurations[0].intelliSenseMode, "clang-x64");
            assert.equal(cfg.configurations[0].includePath.length, 12);
        } else {
            assert.fail(fname, [{ fsPath: "/tmp/RIOT/.vscode/c_cpp_properties.json" }], 'c_cpp_properties.json not found');
        }

        let expected_ipaths = expected.configurations[0].includePath
        let actual_ipaths = cfg.configurations[0].includePath

        let expected_defines = expected.configurations[0].defines
        let actual_defines = cfg.configurations[0].defines
        
        for (var i = 0; i<expected_ipaths.length; i++) {
            //console.log(`${expected_ipaths[i]} ==? ${actual_ipaths[i]}`)
            assert(expected_ipaths[i] == actual_ipaths[i])
        }

        for (var i = 0; i<expected_defines.length; i++) {
            //console.log(`${expected_defines[i]} ==? ${actual_defines[i]}`)
            assert(expected_defines[i] == actual_defines[i])
        }
    })
});