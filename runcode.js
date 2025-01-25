/* eslint-disable no-unused-vars */
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const { spawn } = require('child_process');

// Display a notification in the editor based on test results
function showTestResults(allTestsPassed) {
    if (allTestsPassed) {
        vscode.window.showInformationMessage('All test cases passed! 🎉');
    } else {
        vscode.window.showErrorMessage('Some test cases failed. Please review your solution. ❌');
    }
}

// Update the status bar in VS Code with test results
function updateStatusIndicator(allTestsPassed) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = allTestsPassed ? '$(check) All tests passed!' : '$(x) Tests failed.';
    statusBarItem.tooltip = 'Click to view details';
    statusBarItem.show();
}

// Write test results to the output panel in VS Code
function displayTestOutput(results, outputs) {
    const outputPanel = vscode.window.createOutputChannel('Test Results');
    outputPanel.clear();
    outputPanel.appendLine('========== Test Results ==========');
    results.forEach((result, index) => {
        const { testCase, passed } = result;
        const { expectedOutput, actualOutput } = outputs[index];
        if (passed) {
            outputPanel.appendLine(`Test Case ${index + 1}: ✅ Passed`);
        } else {
            outputPanel.appendLine(`Test Case ${index + 1}: ❌ Failed`);
            outputPanel.appendLine(`Expected: ${expectedOutput}`);
            outputPanel.appendLine(`Actual: ${actualOutput}`);
        }
    });
    outputPanel.show(); // Focus on the output panel
}

// Run and evaluate a C++ solution against test cases
async function executeCppCode(solutionFile, executableFile, testFolderPath) {
    const compileProcess = spawn('g++', [solutionFile, '-o', executableFile]);

    await new Promise((resolve, reject) => {
        compileProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Compilation successful.');
                resolve();
            } else {
                console.error('Compilation failed.');
                reject(new Error('Compilation error.'));
            }
        });

        compileProcess.stderr.on('data', (data) => {
            console.error(`Compilation Error: ${data.toString()}`);
        });
    });

    const testFiles = fs.readdirSync(testFolderPath).filter(file => file.startsWith('ip') && file.endsWith('.txt'));
    let allTestsPassed = true;

    const results = [];
    const outputs = [];

    for (const inputFile of testFiles) {
        const testCaseNumber = inputFile.match(/\d+/)[0]; // Extract test case number
        const expectedOutputFile = `op${testCaseNumber}.txt`;

        const inputPath = path.join(testFolderPath, inputFile);
        const outputPath = path.join(testFolderPath, expectedOutputFile);

        if (!fs.existsSync(outputPath)) {
            console.error(`Expected output file ${expectedOutputFile} not found.`);
            continue;
        }

        const inputContent = fs.readFileSync(inputPath, 'utf-8');
        const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();

        console.log(`Executing test case ${testCaseNumber}...`);

        const childProcess = spawn(executableFile);

        let actualOutput = '';
        childProcess.stdout.on('data', (data) => {
            actualOutput += data.toString();
        });

        childProcess.stderr.on('data', (data) => {
            console.error(`Error in test case ${testCaseNumber}: ${data}`);
        });

        childProcess.on('close', () => {
            actualOutput = actualOutput.trim();

            const passed = (actualOutput === expectedOutput);
            outputs.push({ actualOutput, expectedOutput });

            if (passed) {
                console.log(`Test case ${testCaseNumber} passed!`);
            } else {
                console.error(`Test case ${testCaseNumber} failed.`);
                console.error(`Expected: ${expectedOutput}`);
                console.error(`Actual: ${actualOutput}`);
                allTestsPassed = false;
            }
            results.push({ testCase: testCaseNumber, passed });
        });

        childProcess.stdin.write(inputContent);
        childProcess.stdin.end();

        await new Promise((resolve) => childProcess.on('close', resolve));
    }

    showTestResults(allTestsPassed);
    updateStatusIndicator(allTestsPassed);
    displayTestOutput(results, outputs);
}

// Run and evaluate a Python solution against test cases
async function executePythonCode(scriptPath, testFolderPath) {
    const testFiles = fs.readdirSync(testFolderPath).filter(file => file.startsWith('ip') && file.endsWith('.txt'));
    let allTestsPassed = true;

    const results = [];
    const outputs = [];

    for (const inputFile of testFiles) {
        const testCaseNumber = inputFile.match(/\d+/)[0]; // Extract test case number
        const expectedOutputFile = `op${testCaseNumber}.txt`;

        const inputPath = path.join(testFolderPath, inputFile);
        const outputPath = path.join(testFolderPath, expectedOutputFile);

        if (!fs.existsSync(outputPath)) {
            console.error(`Expected output file ${expectedOutputFile} not found.`);
            continue;
        }

        const inputContent = fs.readFileSync(inputPath, 'utf-8');
        const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();

        console.log(`Executing test case ${testCaseNumber}...`);

        let actualOutput = '';
        let errorOutput = '';

        await new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [scriptPath]);

            pythonProcess.stdout.on('data', (data) => {
                actualOutput += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', () => {
                if (errorOutput) {
                    console.error(`stderr: ${errorOutput}`);
                    reject(new Error(`Test case ${testCaseNumber} encountered an error.`));
                } else {
                    actualOutput = actualOutput.trim();

                    const passed = (actualOutput === expectedOutput);
                    outputs.push({ expectedOutput, actualOutput });

                    if (passed) {
                        console.log(`Test case ${testCaseNumber} passed!`);
                    } else {
                        console.error(`Test case ${testCaseNumber} failed.`);
                        console.error(`Expected: ${expectedOutput}`);
                        console.error(`Actual: ${actualOutput}`);
                        allTestsPassed = false;
                    }
                    results.push({ testCase: testCaseNumber, passed });
                    resolve();
                }
            });

            pythonProcess.stdin.write(inputContent);
            pythonProcess.stdin.end();
        });
    }

    showTestResults(allTestsPassed);
    updateStatusIndicator(allTestsPassed);
    displayTestOutput(results, outputs);
}

module.exports = { executeCppCode, executePythonCode };
