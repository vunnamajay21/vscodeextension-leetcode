const assert = require('assert');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const { executePythonScript } = require('./urlexec.js');
const { getName } = require('./frontend/fetchName.js');
const { executeCppCode, executePythonCode} = require('./runcode.js');
const { getHTML } = require('./frontend/frontend.js');

/**
 * Formats a problem name into lowercase and replaces spaces with hyphens.
 */
function formatName(str) {
    return str.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Determines the programming language based on the file extension.
 */
function getLanguage(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    switch (extension) {
        case '.cpp': return 'cpp';
        case '.py': return 'python';
        case '.js': return 'javascript';
        default: return 'unknown';
    }
}

/**
 * Extracts test cases from the given URL and saves them to a folder.
 */
async function getTests(url) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Extracting Test Cases...',
        cancellable: false,
    }, async (progress) => {
        const [inputArray, outputArray] = await executePythonScript(url);
        const problemName = formatName(getName(url));

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No folder or workspace is open.');
            return;
        }

        const folderPath = workspaceFolders[0].uri.fsPath; // Use the first folder in the workspace
        const testCasesFolder = path.join(folderPath, 'TestData');

        if (!fs.existsSync(testCasesFolder)) {
            fs.mkdirSync(testCasesFolder, { recursive: true });
            console.log(`TestData folder created.`);
        }

        const problemDir = path.join(testCasesFolder, problemName);
        if (!fs.existsSync(problemDir)) {
            fs.mkdirSync(problemDir);
            console.log(`Folder for problem "${problemName}" created.`);
        }

        inputArray.forEach((input, index) => {
            const filePath = path.join(problemDir, `ip${index + 1}.txt`);
            fs.writeFileSync(filePath, input);
            progress.report({ increment: (index + 1) / inputArray.length * 50, message: `Writing input file ${index + 1}...` });
        });

        outputArray.forEach((output, index) => {
            const filePath = path.join(problemDir, `op${index + 1}.txt`);
            fs.writeFileSync(filePath, output);
            progress.report({ increment: (index + 1) / outputArray.length * 50, message: `Writing output file ${index + 1}...` });
        });

        vscode.window.showInformationMessage('Sample input and output are now present in TestData folder 🎉');
    });
}

/**
 * Handles Webview interactions for fetching and running test cases.
 */
class MyWebviewViewProvider {
    constructor(context) {
        this._context = context;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getHTML(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'fetchTests') {
                await getTests(message.value);
            } else if (message.type === 'runTests') {
                await this.runTests(message.value);
            }
        });
    }

    async runTests(problemName) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No folder or workspace is open.');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found! Open your solution file.');
            return;
        }

        const userCode = editor.document.getText();
        if (!userCode.trim()) {
            vscode.window.showErrorMessage('Solution code is empty!');
            return;
        }

        if (!problemName) {
            vscode.window.showErrorMessage('Problem name is required!');
            return;
        }

        problemName = formatName(problemName);
        let problemFolderPath;
        let found = false;

        for (const folder of workspaceFolders) {
            const testDataFolder = path.join(folder.uri.fsPath, 'TestData');
            if (!fs.existsSync(testDataFolder)) continue;

            problemFolderPath = path.join(testDataFolder, problemName);
            if (fs.existsSync(problemFolderPath)) {
                found = true;
                break;
            }
        }

        if (!found) {
            vscode.window.showErrorMessage(`TestData folder or problem folder '${problemName}' not found.`);
            return;
        }

        const filePath = editor.document.uri.fsPath;
        const lang = getLanguage(filePath);

        if (lang === 'cpp') {
            const userSolutionFile = path.join(problemFolderPath, 'temp_solution.cpp');
            const executableFile = path.join(problemFolderPath, 'solution_exec.exe');
            fs.writeFileSync(userSolutionFile, userCode, 'utf8');
            await executeCppCode(userSolutionFile, executableFile, problemFolderPath);
        } else if (lang === 'python') {
            await executePythonCode(filePath, problemFolderPath);
        } else {
            vscode.window.showErrorMessage('Unsupported file type. Only .cpp and .py are supported.');
        }
    }
}

/**
 * Activates the extension and registers commands.
 */
async function activate(context) {
    console.log('Extension "cph-lc" is now active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('cph-leetcode.Toextracttestcases', async () => {
            const url = await vscode.window.showInputBox({
                prompt: 'Enter the problem URL',
                placeHolder: 'https://example.com/problem/123',
            });
            if (url) await getTests(url);
        }),
        vscode.commands.registerCommand('cph-leetcode.TorunTestCases', async () => {
            const problemName = await vscode.window.showInputBox({
                prompt: 'Enter the problem name',
            });
            if (problemName) {
                const provider = new MyWebviewViewProvider();
                await provider.runTests(problemName);
            }
        }),
        vscode.window.registerWebviewViewProvider('explorerView', new MyWebviewViewProvider(context))
    );
}

/**
 * Deactivates the extension.
 */
function deactivate() {}

module.exports = { activate, deactivate };
