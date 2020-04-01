'use strict'
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const ignoredDirectories = [
    'obj',
    'bin',
    'node_modules',
    '.git',
    '.vscode',
    '.vs',
    '.github'
];


function findCsFilesRecursively(p: string) {
    let csFiles: string[] = [];

    let pathContent = fs.readdirSync(p, { withFileTypes: true });
    for (let i = 0; i < pathContent.length; i++) {
        var pathItem = pathContent[i];
        if (ignoredDirectories.includes(pathItem.name)) {
            continue;
        }

        if (pathItem.isDirectory()) {
            var dirFiles = findCsFilesRecursively(path.join(p, pathContent[i].name));
            dirFiles.forEach(f => csFiles.push(f));
        }
        else if (pathItem.isFile()
            && pathItem.name.endsWith(".cs")) {
            csFiles.push(pathItem.name);
        }
    }

    return csFiles;
}

export class DependencyInjector {
    public inject() {
        vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Please enter class name.' })
            .then(async (searchQuery) => {

                if (typeof searchQuery === 'undefined') {
                    return;
                }
                // Find csharp file with name prompt
                let originalSearchQuery = searchQuery;
                searchQuery = searchQuery.toLowerCase();
                let csharpfiles = findCsFilesRecursively(<string>vscode.workspace.rootPath);
                let matches: string[] = [];
                csharpfiles.forEach(file => {
                    if (file.toLowerCase().includes(searchQuery!)) {
                        let fileWithoutCsExtension = file.substr(0, file.length - 3);
                        matches.push(fileWithoutCsExtension);
                    }
                });

                let className = '';
                if (matches.length == 0) {
                    const cont = await vscode.window.showQuickPick([`No matches, continue with '${originalSearchQuery}'?`]);
                    if (typeof cont === 'undefined') {
                        return;
                    }
                    className = originalSearchQuery;
                }
                else {
                    const pick = await vscode.window.showQuickPick(matches);
                    if (typeof pick === 'undefined') {
                        return;
                    }

                    className = pick!;
                }

                // Set variable name
                let variableName = '';
                if (className.startsWith('I')) {
                    variableName = className.substr(1, className.length - 1);
                }
                else {
                    variableName = className;
                }
                variableName = variableName[0].toLowerCase() + variableName.substring(1, variableName.length);
                let lessSignIndex = variableName.indexOf('<');
                if (lessSignIndex != -1) {
                    variableName = variableName.substr(0, lessSignIndex);
                }

                let document = vscode.window.activeTextEditor?.document;
                // Get class name and class start line
                let matchedClassName = '';
                let classStartLine = -1;
                var classRegex = new RegExp(/(private|internal|public|protected)\s?(static)?\sclass\s(\w*)/g);
                for (let i = 0; i < document!.lineCount; i++) {
                    let documentLine = document?.lineAt(i);
                    let match;
                    if ((match = classRegex.exec(documentLine!.text))) {
                        matchedClassName = match[3];
                        classStartLine = i;
                        break;
                    }
                }

                // get start constructor line
                let constructorStartLine = -1;
                let constructorEndLine = -1;
                var constructorRegex = new RegExp("public\\s" + matchedClassName + "\\(", "g");
                for (let i = 0; i < document!.lineCount; i++) {
                    let documentLine = document?.lineAt(i);
                    let match;
                    if ((match = constructorRegex.exec(documentLine!.text))) {
                        constructorStartLine = i;
                        if (documentLine?.text.indexOf(')') != -1) {
                            constructorEndLine = i;
                        }
                        break;
                    }
                }

                if (constructorEndLine == -1
                    && constructorStartLine > 0) {
                    // search from constructor start until ) is found - constructor end assumption
                    for (let i = constructorStartLine; i < document!.lineCount; i++) {
                        let documentLine = document?.lineAt(i);
                        if (documentLine?.text.indexOf(')') != -1) {
                            constructorEndLine = i;
                            break;
                        }
                    }
                }

                // Get last private readonly field
                let readonlyFieldRegex = new RegExp(/private\sreadonly\s(\w*)/g);
                let lastReadonlyFieldLine = -1;
                let searchForFieldUntil = constructorStartLine;
                if (searchForFieldUntil == -1) {
                    searchForFieldUntil = document?.lineCount!;
                }
                for (let i = 0; i < searchForFieldUntil; i++) {
                    let documentLine = document?.lineAt(i);
                    let match;
                    if ((match = readonlyFieldRegex.exec(documentLine!.text))) {
                        lastReadonlyFieldLine = i;
                    }
                }

                // Insert read only field
                let addFieldAfterClass = false;
                if (lastReadonlyFieldLine == -1) {
                    addFieldAfterClass = true;
                    lastReadonlyFieldLine = classStartLine + 2;
                }
                else {
                    lastReadonlyFieldLine += 1;
                }
                await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                    let fieldText = `\t\tprivate readonly ${className} _${variableName};\n`;
                    if (addFieldAfterClass) {
                        fieldText += '\n';
                    }

                    editBuilder.insert(new vscode.Position(lastReadonlyFieldLine, 0), fieldText);
                });


                // constructor doesn't exist
                if (constructorStartLine == -1) {
                    if (lastReadonlyFieldLine != -1) {
                        constructorStartLine = lastReadonlyFieldLine + 2;
                    }
                    else {
                        constructorStartLine = classStartLine + 2;
                    }

                    // insert constructor
                    await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                        let constructorText = `\t\tpublic ${matchedClassName}(${className} ${variableName})\n`;
                        constructorText += `\t\t{\n`;
                        constructorText += `\t\t\t_${variableName} = ${variableName};\n`;
                        constructorText += `\t\t}\n\n`;

                        editBuilder.insert(new vscode.Position(constructorStartLine, 0), constructorText);
                    });
                }
                // constructor exists
                else {
                    if (constructorStartLine == constructorEndLine) {
                        let constrcutorLineText = document?.lineAt(constructorStartLine + 1).text!;
                        let endingParenIndex = constrcutorLineText.indexOf(')');
                        // insert type and variable
                        await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                            let constructorText = `${className} ${variableName}`;

                            let constrctorHasVarRegex = new RegExp(/\w+\)/g);
                            let match;
                            if ((match = constrctorHasVarRegex.exec(constrcutorLineText))) {
                                constructorText = ', ' + constructorText;
                            }

                            editBuilder.insert(new vscode.Position(constructorStartLine + 1, endingParenIndex), constructorText);

                            let variableText = `\t\t\t_${variableName} = ${variableName};\n`;
                            editBuilder.insert(new vscode.Position(constructorStartLine + 3, 0), variableText);
                        });

                        // format constructor variables on separate lines
                        let unformattedConstructor = document?.lineAt(constructorStartLine + 1);
                        let variableListRegex = new RegExp(/public\s\w+\((.+)\)/g);
                        let variableListMatch = variableListRegex.exec(unformattedConstructor!.text);
                        let variableList = variableListMatch![1].split(',');

                        await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                            editBuilder.delete(new vscode.Range(constructorStartLine + 1, 0, constructorStartLine + 1, unformattedConstructor!.text.length));

                            let constructorText = `\t\tpublic ${matchedClassName}(\n`;
                            for (let i = 0; i < variableList.length; i++) {
                                constructorText += `\t\t\t${variableList[i].trim()}`;
                                if (i < variableList.length - 1) {
                                    constructorText += ',\n';
                                }
                                else {
                                    constructorText += ')';
                                }
                            }

                            editBuilder.insert(new vscode.Position(constructorStartLine + 1, 0), constructorText);
                        });
                    }
                    else {
                        let constructorEndLineText = document?.lineAt(constructorEndLine + 1).text!;

                        let variableOnSameLineRegex = new RegExp(/\w+\)/g);
                        let match;
                        // last variable and closing parens are on same line
                        if ((match = variableOnSameLineRegex.exec(constructorEndLineText))) {
                            let endingParenIndex = constructorEndLineText.indexOf(')')!;
                            // insert type and variable between last variable end and closing paren start
                            await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                                let constructorText = `,\n\t\t\t${className} ${variableName}`;

                                editBuilder.insert(new vscode.Position(constructorEndLine + 1, endingParenIndex), constructorText);

                                let variableText = `\t\t\t_${variableName} = ${variableName};\n`;
                                editBuilder.insert(new vscode.Position(constructorEndLine + 3, 0), variableText);
                            });
                        }
                        // last variable and closing parens are on different lines
                        else {
                            let lastConstructorVariableLineText = document?.lineAt(constructorEndLine).text!;

                            await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                                let constructorText = `,\n\t\t\t${className} ${variableName}`;

                                editBuilder.insert(new vscode.Position(constructorEndLine, lastConstructorVariableLineText.length), constructorText);

                                let variableText = `\t\t\t_${variableName} = ${variableName};\n`;
                                editBuilder.insert(new vscode.Position(constructorEndLine + 3, 0), variableText);
                            });
                        }
                    }
                }
            });
    }
}