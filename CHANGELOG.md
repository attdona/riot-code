# Change Log

## 1.0.1 (November 19, 2019)

- Bux Fixes: RIOT init hangs with "RIOT setup.
  ([@attdona](https://github.com/attdona) in [#14](https://github.com/attdona/riot-code/issues/14))

## 1.0.0 (September 6, 2019)

- Progress status notification when creating settings and tasks files.

- Better intellisense: Removed include basename directory from paths included in
  browse.path `c_cpp_properties.json` property and provision for user defined browse.path paths.

- Removed automatic update of project configuration when modifyng vscode settings. A new RIOT
  build configuration (`.vscode/c_cpp_properties.json` and `.vscode/tasks.json`) have to be explicitly
  triggered by `RIOT init` command.

- Pull Request: regex improvement, many thanks for the contribution to Kees Bakker.
  ([@keestux](https://github.com/attdona) in [#12](https://github.com/attdona/riot-code/issues/12))

- Bug Fixes: added riot.base property for managing correctly apps external to RIOT.
  ([@attdona](https://github.com/attdona) in [#11](https://github.com/attdona/riot-code/issues/11))

- Bug Fixes: Setting riot.compiler_path is broken.
  ([@attdona](https://github.com/attdona) in [#13](https://github.com/attdona/riot-code/issues/13))

## 0.1.5 (June 13, 2019)

- Bug Fixes: clean and flash commands
  ([@attdona](https://github.com/attdona) in [#10](https://github.com/attdona/riot-code/issues/10))

## 0.1.4 (June 08, 2019)

- Change request: riot.quiet renamed to riot.make_defs
  ([@attdona](https://github.com/attdona) in [#10](https://github.com/attdona/riot-code/issues/10))

## 0.1.3 (June 29, 2018)

- Bug fixes
  ([@attdona](https://github.com/attdona) in [#7](https://github.com/attdona/riot-code/issues/7))
  ([@attdona](https://github.com/attdona) in [#8](https://github.com/attdona/riot-code/issues/8))

## 0.1.2 (April 6, 2018)

- Bug fixes
  ([@attdona](https://github.com/attdona) in [#6](https://github.com/attdona/riot-code/issues/6))

## 0.1.1 (April 5, 2018)

- add toolchain location to PATH
  ([@attdona](https://github.com/attdona) in [#5](https://github.com/attdona/riot-code/issues/5))

## 0.1.0 (April 3, 2018)

- Code refactoring
  ([@attdona](https://github.com/attdona) in [#4](https://github.com/attdona/riot-code/issues/4))
- Bug fixes
  ([@attdona](https://github.com/attdona) in [#3](https://github.com/attdona/riot-code/issues/3))

## 0.0.3 (February 2, 2018)

- Enhancement: Windows platform
  ([@attdona](https://github.com/attdona) in [#2](https://github.com/attdona/riot-code/issues/2))

## 0.0.2 (January 13, 2018)

- Enhancement: automatic update of `tasks.json` and `c_cpp_properties.json` when riot user setting are saved
  ([@attdona](https://github.com/attdona) in [#1](https://github.com/attdona/riot-code/issues/1))

- Enhancement: introduced `riot.sync_tasks` flag
  ([@attdona](https://github.com/attdona) in [#1](https://github.com/attdona/riot-code/issues/1))

## 0.0.1 (January 10, 2018)

- Initial release
