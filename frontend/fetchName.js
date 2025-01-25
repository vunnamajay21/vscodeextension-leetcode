const getName = (url) => {
    // Find the part between 'problems' and 'description'
    const start = url.indexOf('problems') + 'problems'.length + 1; // Start after 'problems/'
    const end = url.indexOf('description');

    // Extract the problem name
    const pName = url.slice(start, end).replace(/\/$/, ''); // Remove trailing slash if present

    return pName;
};

module.exports = { getName };
