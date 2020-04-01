import * as vscode from 'vscode';
import { DependencyInjector } from './inject-dependency';
import { FileCreator } from './file-creator';

export function activate(context: vscode.ExtensionContext) {
	const injector = new DependencyInjector()
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.inject-dependency', injector.inject));

	const fileCreator = new FileCreator();
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-class', fileCreator.createClass));
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-interface', fileCreator.createInterface));
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-enum', fileCreator.createEnum));
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-test', fileCreator.createTest));
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

export function deactivate() { }