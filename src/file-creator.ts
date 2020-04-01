import * as vscode from 'vscode';
import * as os from 'os';
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

let _lastSelectedPath = '';

export class FileCreator {
    public async createClass() {
        await promptFileCreation('class');
    }

    public async createInterface() {
        await promptFileCreation('interface');
    }

    public async createEnum() {
        await promptFileCreation('enum');
    }

    public async createTest() {
        await promptFileCreation('test');
    }
}

async function promptFileCreation(fileType: string) {
    if (_lastSelectedPath == '') {
        const activeDoc = vscode.window.activeTextEditor?.document;
        if (typeof activeDoc !== 'undefined') {
            _lastSelectedPath = path.dirname(activeDoc.fileName);
        }
        else {
            _lastSelectedPath = vscode.workspace.rootPath!;
        }
    }

    const selectedPath = await promptForPath();
    if (typeof selectedPath === 'undefined') {
        return;
    }
    const projPath = findCsProjFile(selectedPath);
    if (typeof projPath === 'undefined') {
        vscode.window.showErrorMessage('Failed to find C# project.');
        return;
    }

    const namespace = generateNamespace(projPath, selectedPath);
    if (typeof namespace === 'undefined') {
        vscode.window.showErrorMessage('Failed to generate namespace.');
        return;
    }

    const className = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Please enter class name.' });
    if (typeof className === 'undefined') {
        return;
    }

    const filename = path.join(selectedPath, className + '.cs');
    await createFile(filename, fileType, className, namespace);
    const doc = await vscode.workspace.openTextDocument(filename);
    await vscode.window.showTextDocument(doc);

    _lastSelectedPath = selectedPath;
}

async function createFile(filename: string, templateName: string, objectName: string, namespace: string) {
    const doc = await vscode.workspace.openTextDocument(vscode.extensions.getExtension('roadsidejesus.csharp-helper')!.extensionPath + '/templates/' + templateName + '.txt')

    let text = doc.getText();
    text = text.replace('$namespace', namespace);
    text = text.replace(/\$name/g, objectName);

    fs.writeFileSync(filename, text);
}

function generateNamespace(projectPath: string, selectedPath: string) {
    const rootNamespace = projectPath.substr(projectPath.lastIndexOf('\\'));
    let namespace = rootNamespace + selectedPath.replace(projectPath, '');

    var pathSepRegEx = /\//g;
    if (os.platform() === "win32") {
        pathSepRegEx = /\\/g;
    }

    namespace = namespace.replace(pathSepRegEx, '.');
    namespace = namespace.replace(/\s+/g, "_");
    namespace = namespace.replace(/-/g, "_");
    if (namespace.startsWith('.')) {
        namespace = namespace.substr(1);
    }

    return namespace;
}

async function promptForPath(): Promise<string> {
    let pathInput = _lastSelectedPath;
    let selectedPath = '';
    while (selectedPath == '') {
        let pathSelectionArray = getDirectories(pathInput);
        let quickPickItems: vscode.QuickPickItem[] = [];
        if (pathInput != vscode.workspace.rootPath) {
            quickPickItems.push(<vscode.QuickPickItem>{
                label: '<Up>',
                description: path.join(pathInput, '..')
            });
        }
        quickPickItems.push(<vscode.QuickPickItem>{
            label: '<Here>',
            description: pathInput
        });

        pathSelectionArray.forEach(p => {
            quickPickItems.push(<vscode.QuickPickItem>{
                label: p
            });
        });

        const selection = await vscode.window.showQuickPick(quickPickItems);
        if (typeof selection === 'undefined') {
            break;
        }

        if (selection.label === '<Here>') {
            selectedPath = pathInput;
        }
        else if (selection.label === '<Up>') {
            pathInput = path.join(pathInput, '..');
        }
        else {
            pathInput = path.join(pathInput, selection.label);
        }
    }

    return selectedPath;
}

function getDirectories(p: string) {

    let directories = [];

    let pathContent = fs.readdirSync(p, { withFileTypes: true });
    for (let i = 0; i < pathContent.length; i++) {
        var pathItem = pathContent[i];
        if (ignoredDirectories.includes(pathItem.name)) {
            continue;
        }

        if (pathItem.isDirectory()) {
            directories.push(pathContent[i].name);
        }
    }

    return directories;
}

function findCsProjFile(p: string) {
    for (let n = 0; n < 10; n++) {

        let pathContent = fs.readdirSync(p, { withFileTypes: true });
        for (let i = 0; i < pathContent.length; i++) {
            var pathItem = pathContent[i];
            if (pathItem.isDirectory()) {
                continue;
            }

            if (pathItem.name.endsWith('.csproj')) {
                return p;
            }
        }

        p = path.join(p, '..');
    }

    return undefined;
}