from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import random
import re
import time
import ast
import sys
import json

# Configure Chrome options for headless operation
def configure_browser_options():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("start-maximized")
    options.add_argument("--window-size=1920x1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    )
    return options

# Process and clean the input string
def parse_input(input_data):
    input_data += ","
    parsed_result = []
    index = 0

    while index < len(input_data):
        char = input_data[index]

        if char != "=":
            index += 1
            continue

        index += 2  # Skip '=' and the following character
        temp_str = ""
        depth = 0

        while input_data[index] == "[":
            index += 1
            depth += 1

        if depth > 0:
            index -= depth
            temp_str = ""
            closing = "]" * depth

            while input_data[index:index+depth] != closing:
                temp_str += input_data[index]
                index += 1

            temp_str += closing
            nested_array = ast.literal_eval(temp_str)
            shape = get_array_dimensions(nested_array)

            assert len(shape) == depth or (not shape and depth == 1)

            flattened = " ".join(map(str, shape)) + " " + " ".join(map(str, flatten_array(nested_array)))
            parsed_result.append(flattened)
        else:
            if input_data[index] == '"':
                index += 1
                while input_data[index] != '"':
                    temp_str += input_data[index]
                    index += 1
            else:
                while input_data[index] != ',':
                    temp_str += input_data[index]
                    index += 1

            parsed_result.append(temp_str)

        index += 1

    return " ".join(parsed_result)

# Determine the dimensions of a nested list
def get_array_dimensions(arr):
    if not isinstance(arr, list) or not arr:
        return []
    return [len(arr)] + get_array_dimensions(arr[0])

# Flatten a nested list to a single level
def flatten_array(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten_array(item)
        else:
            yield item

# Extract the problem identifier from the URL
def get_problem_identifier(url):
    parts = url.split("/")
    for i, part in enumerate(parts):
        if part == "problems":
            return parts[i + 1]
    raise ValueError("Invalid URL format")

# Parse test cases from the page source
def parse_test_cases(page_soup):
    pre_elements = page_soup.find_all("pre")
    example_blocks = pre_elements if pre_elements else page_soup.find_all("div", class_="example-block")

    inputs, outputs = [], []

    for element in example_blocks:
        raw_text = element.get_text(separator=" ").strip()
        clean_text = re.sub(r"(Input:|Output:|Explanation:)\s*", "", raw_text)
        lines = clean_text.split("\n")

        input_segment = lines[0]
        output_segment = lines[1][1:]

        if output_segment.startswith('"'):
            outputs.append(output_segment[1:-1])
        elif output_segment.startswith('['):
            parsed_output = ast.literal_eval(output_segment)
            shape = get_array_dimensions(parsed_output)

            if len(shape) > 1:
                formatted_output = "\n".join(" ".join(map(str, row)) for row in parsed_output)
            else:
                formatted_output = " ".join(map(str, parsed_output))

            outputs.append(formatted_output)
        else:
            outputs.append(output_segment)

        inputs.append(parse_input(input_segment))

    return inputs, outputs

# Initialize and configure the WebDriver
def initialize_driver():
    service = Service()
    return webdriver.Chrome(service=service, options=configure_browser_options())

# Main workflow for scraping test cases
def main():
    driver = initialize_driver()

    try:
        input_url = sys.stdin.read().strip()
        problem_id = get_problem_identifier(input_url)

        driver.get(input_url)
        time.sleep(random.uniform(4, 5))

        page_html = driver.page_source
        soup = BeautifulSoup(page_html, 'lxml')

        input_cases, output_cases = parse_test_cases(soup)

        assert len(input_cases) == len(output_cases)

        result = {
            "message": "Scraping completed successfully",
            "output": [input_cases, output_cases],
        }

        print(json.dumps(result))

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
