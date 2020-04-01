import * as vscode from 'vscode';
import { DependencyInjector } from './inject-dependency';
import { FileCreator } from './file-creator';
import { CodeEmbed } from './code-embed';

export function activate(context: vscode.ExtensionContext) {
	const injector = new DependencyInjector()
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.inject-dependency', injector.inject));

	const fileCreator = new FileCreator();
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-class', fileCreator.createClass));
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-interface', fileCreator.createInterface));
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-enum', fileCreator.createEnum));
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-test', fileCreator.createTest));

	const codeEmbed = new CodeEmbed();
	context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.embed-code', codeEmbed.embedCode));
}

export function deactivate() { }