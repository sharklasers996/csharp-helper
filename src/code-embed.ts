import * as vscode from 'vscode';

const codeBlocks: CodeBlock[] = [
    {
        name: 'try { ... } catch(Exception ex) { ... }',
        template: 'trycatch.txt'
    },
    {
        name: 'if (...) { ... }',
        template: 'if.txt'
    }
];

export class CodeEmbed {
    public async embedCode() {
        let document = vscode.window.activeTextEditor?.document!;
        let start = vscode.window.activeTextEditor?.selection?.start;
        let end = vscode.window.activeTextEditor?.selection?.end;

        // determine indentation to add to template
        let lineText = document.lineAt(start!.line).text;
        let emptySpaceMatch = lineText.match(/^[\s]+/g);
        let indentation = '';
        if (emptySpaceMatch!.length > 0) {
            indentation = emptySpaceMatch![0];
        }

        if (typeof start === 'undefined') {
            return;
        }

        const quickPickSelection = await vscode.window.showQuickPick(codeBlocks.map(c => c.name));
        if (typeof quickPickSelection === 'undefined') {
            return;
        }

        const selectedCodeBlock = codeBlocks.find(c => c.name == quickPickSelection);
        const doc = await vscode.workspace.openTextDocument(vscode.extensions.getExtension('roadsidejesus.csharp-helper')!.extensionPath + '/templates/code-blocks/' + selectedCodeBlock?.template);

        const selectionRange = new vscode.Range(new vscode.Position(start!.line, 0), new vscode.Position(end!.line + 1, 0));
        let codeToEmbed = document.getText(selectionRange);

        // indent all selected lines
        let codeToEmbedLines = codeToEmbed.split('\n');
        if (codeToEmbedLines.length > 1) {
            codeToEmbed = codeToEmbedLines[0];
            for (let i = 1; i < codeToEmbedLines.length; i++) {
                codeToEmbed += `\t${codeToEmbedLines[i]}`;
            }
        }

        // replace code
        await vscode.window.activeTextEditor?.edit(async (editBuilder: vscode.TextEditorEdit) => {
            editBuilder.delete(selectionRange);

            let codeBlockText = doc.getText();
            codeBlockText = codeBlockText.replace(/\$indent /g, indentation);
            codeBlockText = codeBlockText.replace('$code', codeToEmbed.trimRight());

            editBuilder.insert(new vscode.Position(start?.line!, 0), codeBlockText);
        });
    }
}

interface CodeBlock {
    name: string;
    template: string;
}