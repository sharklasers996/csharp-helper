import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createVerify } from 'crypto';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {

		vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Please enter class name.' })
			.then((className) => {

				if (typeof className === 'undefined') {
					return;
				}
				// -------------------- Find csharp file with name prompt
				// className = className.toLowerCase();
				// let csharpfiles = findFilesRecursively(<string>vscode.workspace.rootPath);
				// let matches: string[] = [];
				// csharpfiles.forEach(file => {
				// 	if (file.toLowerCase().startsWith(className!)) {
				// 		matches.push(file);
				// 	}
				// });

				// vscode.window.showQuickPick(matches)
				// 	.then(selection => {
				// 		vscode.window.showInformationMessage(selection!);
				// 	});
				// --------------------------------------------------


				let document = vscode.window.activeTextEditor?.document;
				// Get class name
				let matchedClassName = '';
				var classRegex = new RegExp(/(private|internal|public|protected)\s?(static)?\sclass\s(\w*)/g);
				for (let i = 0; i < document!.lineCount; i++) {
					let documentLine = document?.lineAt(i);
					let match;
					if ((match = classRegex.exec(documentLine!.text))) {
						matchedClassName = match[3];
						vscode.window.showInformationMessage(match[3]);
						break;
					}
				}

				// get constructor line
				let constructorStartLine = -1;
				var constructorRegex = new RegExp("public\\s" + matchedClassName + "\\(.+", "g");
				for (let i = 0; i < document!.lineCount; i++) {
					let documentLine = document?.lineAt(i);
					let match;
					if ((match = constructorRegex.exec(documentLine!.text))) {
						constructorStartLine = i;
						break;
					}
				}
				vscode.window.showInformationMessage(constructorStartLine.toString());


				// Get last private readonly field
				let readonlyFieldRegex = new RegExp(/private\sreadonly\s(\w*)/g);
				let lastReadonlyFieldLine = -1;
				for (let i = 0; i < constructorStartLine; i++) {
					let documentLine = document?.lineAt(i);
					let match;
					if ((match = readonlyFieldRegex.exec(documentLine!.text))) {
						lastReadonlyFieldLine = i;
					}
				}
				vscode.window.showInformationMessage(lastReadonlyFieldLine.toString());


				// vscode.window.showInformationMessage(className);
			});

		console.log(vscode.workspace.rootPath);
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
}

function findFilesRecursively(p: string) {
	let csFiles: string[] = [];

	let pathContent = fs.readdirSync(p, { withFileTypes: true });
	for (let i = 0; i < pathContent.length; i++) {
		var pathItem = pathContent[i];
		if (pathItem.isDirectory()) {
			var dirFiles = findFilesRecursively(path.join(p, pathContent[i].name));
			dirFiles.forEach(f => csFiles.push(f));
		}
		else if (pathItem.isFile()
			&& pathItem.name.endsWith(".cs")) {
			csFiles.push(pathItem.name);
		}
	}

	return csFiles;
}

function toCase(toType: 'pascal' | 'camel' | '_camel', str: string): string {
	if (!str) {
		return "";
	}

	if (str === "_" && toType === "_camel") {
		return "_";
	} else if (str === "_" && toType !== "_camel") {
		return "";
	}

	if (str[0] === "_") {
		str = str.substr(1);
	}

	if (toType === "camel") {
		str = str[0].toLowerCase() + str.substr(1);
	}
	if (toType === "_camel") {
		str = "_" + str[0].toLowerCase() + str.substr(1);
	}
	if (toType === "pascal") {
		str = str[0].toUpperCase() + str.substr(1);
	}

	return str;
}


// this method is called when your extension is deactivated
export function deactivate() { }
