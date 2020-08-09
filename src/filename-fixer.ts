import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";

export class FilenameFixer {
	public async fix() {
		const document = vscode.window.activeTextEditor?.document;
		if (typeof document === "undefined") {
			return;
		}

		const regexes = [
			/class\s(\w+)/g,
			/interface\s(\w+)/g,
			/enum\s(\w+)/g,
		];

		let destinationFilename = "";

		for (let i = 0; i < regexes.length; i++) {
			let regex = new RegExp(regexes[i]);
			for (let i = 0; i < document!.lineCount; i++) {
				let documentLine = document?.lineAt(i);
				let match;
				if ((match = regex.exec(documentLine!.text))) {
					destinationFilename = match[1];
					break;
				}
			}

			if (destinationFilename !== "") {
				break;
			}
		}

		if (destinationFilename === "") {
			vscode.window.showInformationMessage(
				"Couldn't find class/interface/enum"
			);
			return;
		}

		var pathSeparator = "/";
		if (os.platform() === "win32") {
			pathSeparator = "\\";
		}

		let destination =
			path.dirname(document.fileName) +
			pathSeparator +
			destinationFilename +
			".cs";
		if (destination !== document.fileName) {
			let sourceUri = vscode.Uri.file(document.fileName);
			let destinationUri = vscode.Uri.file(destination);
			vscode.workspace.fs.rename(sourceUri, destinationUri);
		}
	}
}
