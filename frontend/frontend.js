const vscode = require('vscode');
const path = require('path');

function getHTML(webview) {
    // Resolve paths for CSS and JS files using the webview
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'app.css')));
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'script.js')));
    
    // Return the HTML content
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HTML with Linked CSS and JS</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <!-- Section for fetching test cases -->
            <div class="container">
                <p id="p1">Paste problem URL to get test cases</p>
                <form class="fomo" id="fetchForm">
                    <input id="urlInput" type="text" placeholder="https://www.leetcode.com/problems/problem_name">
                    <button type="submit" id="getButton">Fetch test cases</button>
                </form>
                <p id="fetchResult"></p>
            </div>

            <!-- Section for running code against test cases -->
            <div class="container">
                <div class="runningText">
                    If you have fetched sample test cases, you can run your code on them locally.
                    <br>
                    Click the button below to automatically execute your code against them.
                </div>
                <form class="fomo" id="runForm">
                    <input id="nameInput" type="text" placeholder="Problem Name">
                    <button type="submit" id="runCode">Test</button>
                </form>
                <p id="runResult"></p>
            </div>

            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
}

module.exports = { getHTML };
