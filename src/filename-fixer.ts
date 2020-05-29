import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

export class FilenameFixer {
    public async fix() {
        const document = vscode.window.activeTextEditor?.document;
        if (typeof document === 'undefined') {
            return;
        }

        let classRegex = new RegExp(/class\s(\w+)/g);
        let className = '';
        for (let i = 0; i < document!.lineCount; i++) {
            let documentLine = document?.lineAt(i);
            let match;
            if ((match = classRegex.exec(documentLine!.text))) {
                className = match[1];
                break;
            }
        }

        if (className === '') {
            vscode.window.showInformationMessage('Couldn\'t find class');
            return;
        }

        var pathSeparator = '/';
        if (os.platform() === "win32") {
            pathSeparator = '\\';
        }

        let destination = path.dirname(document.fileName) + pathSeparator + className + '.cs';
        if (destination !== document.fileName) {
            let sourceUri = vscode.Uri.file(document.fileName);
            let destinationUri = vscode.Uri.file(destination);
            vscode.workspace.fs.rename(sourceUri, destinationUri);
        }
    }
}