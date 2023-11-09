// FileName: AdvancedWebCrawler.js
// Description: A sophisticated web crawler that extracts relevant information from web pages

// Required Node.js modules
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');

// User input for the initial URL and search term
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter the initial URL to crawl: ", (initialUrl) => {
  rl.question("Enter the search term: ", (searchTerm) => {
    // Perform web crawling
    crawl(initialUrl, searchTerm)
      .then((results) => {
        console.log("Crawling completed. Results:", results);

        rl.close();
        process.exit(0);
      })
      .catch((error) => {
        console.error("An error occurred during crawling:", error);

        rl.close();
        process.exit(1);
      });
  });
});

/**
 * Performs web crawling recursively until reaching the maximum depth or search term is found
 * @param {string} url - The URL to crawl
 * @param {string} searchTerm - The term to search for
 * @param {number} depth - Current crawling depth
 * @param {Array} visitedUrls - Array of visited URLs
 * @returns {Promise<Object>} - Promise with the final results
 */
function crawl(url, searchTerm, depth = 0, visitedUrls = []) {
  return new Promise((resolve, reject) => {
    if (depth >= 5) {
      // Reached maximum depth, stop crawling
      resolve({
        depthReached: depth,
        visitedUrls: visitedUrls,
        searchTermFound: false
      });
      return;
    }

    // Check if URL has already been visited
    if (visitedUrls.includes(url)) {
      console.log("Skipping already visited URL:", url);
      crawl(url, searchTerm, depth, visitedUrls)
        .then(resolve)
        .catch(reject);
      return;
    }

    // Add URL to visited URLs
    visitedUrls.push(url);
    console.log("Processing URL:", url);

    // Send HTTP GET request to fetch the web page
    request(url, (error, response, body) => {
      if (error) {
        console.error("Failed to fetch the web page:", error);
        reject(error);
        return;
      }

      if (response.statusCode !== 200) {
        console.error("Failed to fetch the web page. Status code:", response.statusCode);
        reject(new Error("Failed to fetch the web page. Status code: " + response.statusCode));
        return;
      }

      // Use cheerio to parse the HTML body
      const $ = cheerio.load(body);

      // Extract relevant information from the web page
      const pageTitle = $('title').text();
      const pageContent = $('body').text();

      const searchTermRegex = new RegExp(searchTerm, 'gi');
      const matchCount = (pageContent.match(searchTermRegex) || []).length;

      if (matchCount > 0) {
        // Search term found
        console.log("Search term found in URL:", url);
        resolve({
          depthReached: depth,
          visitedUrls: visitedUrls,
          searchTermFound: true,
          searchResult: {
            url: url,
            pageTitle: pageTitle,
            matchCount: matchCount
          }
        });
        return;
      }

      // Get all links on the web page
      const links = [];
      $('a').each((index, element) => {
        const link = $(element).attr('href');
        if (link) {
          const absoluteLink = new URL(link, url).href;
          links.push(absoluteLink);
        }
      });

      // Process all child URLs
      const childPromises = links.map((link) => {
        return crawl(link, searchTerm, depth + 1, visitedUrls);
      });

      // Resolve the promise when all child promises are resolved
      Promise.all(childPromises)
        .then((childResults) => {
          const mergedResults = {
            depthReached: depth,
            visitedUrls: visitedUrls,
            searchTermFound: false
          };

          for (const childResult of childResults) {
            if (childResult.searchTermFound) {
              // Propagate the search term found result to the top level
              mergedResults.searchTermFound = true;
              mergedResults.searchResult = childResult.searchResult;
              break;
            }

            mergedResults.visitedUrls = mergedResults.visitedUrls.concat(childResult.visitedUrls);
          }

          resolve(mergedResults);
        })
        .catch(reject);
    });
  });
}