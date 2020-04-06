import * as vscode from 'vscode';
import * as path from 'path';
import { findCsProjFile, generateNamespace } from './utilities';

export class NamespaceFixer {
    public async fix() {
        const document = vscode.window.activeTextEditor?.document;
        if (typeof document === 'undefined') {
            return;
        }

        const csProjFile = findCsProjFile(path.dirname(document.fileName));
        if (typeof csProjFile === 'undefined') {
            return;
        }

        const namespace = generateNamespace(csProjFile, path.dirname(document.fileName));

        let namespaceRegex = new RegExp(/namespace\s/g);
        let namespaceLine = -1;
        for (let i = 0; i < document!.lineCount; i++) {
            let documentLine = document?.lineAt(i);
            let match;
            if ((match = namespaceRegex.exec(documentLine!.text))) {
                namespaceLine = i;
                break;
            }
        }

        if (namespaceLine === -1) {
            vscode.window.showInformationMessage('Couldn\'t find namespace');
            return;
        }

        await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.delete(new vscode.Range(namespaceLine, 0, namespaceLine + 1, 0));
            editBuilder.insert(new vscode.Position(namespaceLine, 0), `namespace ${namespace}\n`);
        });
    }
}