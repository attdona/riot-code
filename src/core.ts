'use strict';
import * as path from 'path';

function morph_path(linux_path: string, root_dir: string): string {

    let prjroot = path.basename(root_dir);
    let path_re = new RegExp("^.*" + prjroot);
    let real_path = linux_path.replace(path_re, root_dir);
    let sep_re = /\//g;
    real_path = real_path.replace(sep_re, "\\");
    return real_path;
}

export function platformPath(pth: string, root_dir: string): string {
    if (/^win/.test(process.platform)) {
        pth = morph_path(pth, root_dir);
    }
    return pth;
}

export function getIncludes(data: string) {
    let set: Set<string> = new Set();
    let match: RegExpExecArray | null;

    let re = /(-I)([^\s]+)+/g;
    while (match = re.exec(data.toString())) {
        let real_path = match[2].toString();
        set.add(real_path);
    }

    return set;
}

export function getDefines(data: string) {
    let match: RegExpExecArray | null;
    let set = new Set(['__GNUC__']);

    let re = /(-D)([^\s]+)+/g;
    while (match = re.exec(data.toString())) {
        let sym = match[2];
        if (/^RIOT_FILE_NOPATH/.test(sym) || /^RIOT_FILE_RELATIVE/.test(sym)) {
            // do nothing
        } else {
            set.add(sym);
        }
        
    }
    return set;
}