import * as vscode from 'vscode';

export class MethodAsyncToggler {
    public async toggle() {
        const document = vscode.window.activeTextEditor?.document;
        if (typeof document === 'undefined') {
            return;
        }

        const position = vscode.window.activeTextEditor?.selection?.active;
        if (typeof position?.line === "undefined") {
            return;
        }

        let methodRegex = new RegExp(/(public|private)\s?([A-Za-z\s]+)?\s([A-Za-z\[\]\<\>]+)\s\w+\(/);
        let methodText: string = "";
        let methodMatch;
        let methodLine: number;
        for (let i = position?.line; i > 0; i--) {
            let documentLine = document?.lineAt(i);
            if ((methodMatch = methodRegex.exec(documentLine!.text))) {
                methodText = documentLine.text;
                methodLine = i;
                break;
            }
        }

        if (methodMatch == null) {
            vscode.window.showInformationMessage('Couldn\'t find a method');
            return;
        }

        if (methodText.includes("Task<")
            || methodText.includes(" Task ")) {
            let returnType = methodMatch[3];
            let syncReturnType = "";
            if (returnType == "Task") {
                syncReturnType = "void";
            }
            else {
                syncReturnType = returnType.substr(5, returnType.length - 6);
            }

            methodText = methodText?.replace(returnType, syncReturnType).replace(" async ", " ");
        }
        else {
            let returnType = methodMatch[3];
            let asyncReturnType = "async";
            if (returnType == "void") {
                asyncReturnType += " Task";
            }
            else {
                asyncReturnType += ` Task<${returnType}>`;
            }

            methodText = methodText?.replace(returnType, asyncReturnType);
        }

        await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.delete(new vscode.Range(methodLine + 1, 0, methodLine, 0));
            editBuilder.insert(new vscode.Position(methodLine + 1, 0), `${methodText}\n`);
        });
    }
}
