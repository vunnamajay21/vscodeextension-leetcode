Vs code execution--leetcode

The VS Code extension "Exec LeetCode" is designed to streamline the process of solving and testing LeetCode problems locally within Visual Studio Code. This tool enhances the competitive programming workflow by automating key tasks and providing a seamless environment for developers.


## How to use it
How to Use
Step 1: Setup Your Workspace
Create a Folder:
Start by creating a folder in your workspace where the fetched test cases will be stored. For example, name it TestCases.
Open the Folder in VS Code:
Open this folder in VS Code to work within the project.
Step 2: Extract Test Cases
Open the Command Palette in VS Code by pressing Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac).
Search for the command Fetch Test Cases and select it.
Paste the URL of the LeetCode question when prompted (e.g., https://leetcode.com/problems/two-sum/).
Press Enter. The extension will automatically extract the test cases and save them in the TestCases folder.
Step 3: Run Test Cases
Write your solution in a .py or .cpp file, using the same name as the problem (e.g., two_sum.py or two_sum.cpp).
Open the Command Palette again and search for the command Run Test Cases.
Paste the name of the problem (e.g., two_sum) when prompted.
Press Enter.
The extension will execute your code with the fetched test cases and display the results in the VS Code output panel.

This project aims to create a VS Code extension designed specifically to enhance the efficiency of solving LeetCode problems. The extension allows users to input a LeetCode problem URL and its name, and it automatically extracts the problem’s test cases. By leveraging this, users can execute their solutions locally against the extracted test cases, verifying their correctness without needing to submit the solution on the LeetCode platform. This streamlined workflow simplifies testing and debugging, making the coding process faster and more intuitive.

Key Features

Input Problem Details:

Users can provide the problem URL and name as inputs to the extension.

Automated Test Case Extraction:

The extension scrapes the problem’s test cases (input/output pairs) directly from the LeetCode website.

Handles various test case formats, ensuring proper extraction of edge cases.

Local Execution and Validation:

Executes user-provided solutions locally using the extracted test cases.

Compares the program’s output against the expected output to validate correctness.

Multi-Language Support:

Supports popular programming languages like Python and C++ for executing solutions.

Error Reporting:

Provides detailed feedback when the output does not match the expected results, including mismatched test cases and runtime errors.

User-Friendly Integration:

Seamless integration into VS Code’s interface with minimal setup required.

Supports custom settings for user preferences, such as specifying a custom testing environment or adjusting input/output configurations.
## Authors

- [@vunnamajay21](https://github.com/vunnamajay21)



## Acknowledgements

 - [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Awesome README](https://github.com/matiassingers/awesome-readme)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)

