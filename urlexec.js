const { spawn } = require('child_process');
const path = require('path');

async function executePythonScript(inputUrl) {
  try {
    const pythonScriptPath = path.resolve(__dirname, 'urlfetching.py');
    const pythonProcess = spawn('python', [pythonScriptPath]);

    // Send the input URL to the Python script via stdin
    pythonProcess.stdin.write(inputUrl);
    pythonProcess.stdin.end();

    const result = await new Promise((resolve, reject) => {
      let stdoutData = '';
      let stderrData = '';

      // Collect standard output
      pythonProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      // Collect standard error
      pythonProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      // Handle process close event
      pythonProcess.on('close', (exitCode) => {
        if (exitCode === 0) {
          resolve(stdoutData);
        } else {
          reject(new Error(`Python script exited with code ${exitCode}: ${stderrData}`));
        }
      });
    });

    // Parse the result and extract the output
    const parsedData = JSON.parse(result);
    return parsedData.output;

  } catch (err) {
    console.error('An error occurred:', err.message);
  }
}

module.exports = { executePythonScript };
