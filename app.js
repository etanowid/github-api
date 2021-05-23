// Get the GitHub username input form
const gitHubForm = document.getElementById('gitHubForm');

// languageInfoElement corresponds to index.html's id=language_info
let languageInfoElement = jQuery("#language_info");

let overallInfoElement = jQuery("#user_repos");

// Listen for submit button on GitHub username input form
gitHubForm.addEventListener('submit', (e) => {

    // Prevent default form submission action
    e.preventDefault();

    // Get the GitHub username input field on the DOM
    let usernameInput = document.getElementById('usernameInput');

    // Get the value of the GitHub username input field
    let gitHubUsername = usernameInput.value;

    // Get the forked checkbox field, the .checked returns boolean
    let includeAll = document.getElementById('includeAll').checked;

    // empty out languageInfoElement for each submit button clicked
    overallInfoElement.empty();
    languageInfoElement.empty();

    let totalRepo = 0;
    let totalStargazers = 0;
    let totalForksCount = 0;
    let totalKB = 0;
    // js object (or dictionary) to keep track of language count
    // { "Python" : 4, "CSS" : 8 , .... }
    let languageFreq = {};
    let forkedRepoCount = 0;

    // Run GitHub API function, passing in the GitHub username, includeAll checkbox, vars to keep track of
    requestUserInfo(gitHubUsername, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount);
})


function requestUserInfo(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount)
{
    // Create new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // GitHub endpoint, dynamically passing in specified username
    const url = `https://api.github.com/users/${username}`;

    // Open a new connection, using a GET request via URL endpoint
    // Providing 3 arguments (GET/POST, The URL, Async True/False)
    xhr.open('GET', url, true);


    // When request is received
    // Process it here
    xhr.onload = function() {

        // Parse API data into JSON format
        const data = JSON.parse(this.response);

        console.log("start of user info...")
        console.log(data)

        // if no user
        if (data.message === "Not Found") {
            overallInfoElement.append("user not found")

            // Send the request to the server
            xhr.send();
            return;
        } else {
            // if user exists, get total repo count info
            totalRepo = data["public_repos"];
        }
        // Run GitHub API function, passing in the GitHub username and includeAll checkbox
        requestUserRepos(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount);

    }
    // Send the request to the server
    xhr.send();
}


function requestUserRepos(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount)
{
    let page = 1;
    if (totalRepo > 30) {
        page = Math.floor(totalRepo / 30);
        let leftover = totalRepo % 30;
        if (leftover > 0) {
            page++;
        }
    }

    for (let pg = 1; pg < page+1; pg++) {
        // Create new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // GitHub endpoint, dynamically passing in specified username
        const url = `https://api.github.com/users/${username}/repos?page=${pg}`;

        // Open a new connection, using a GET request via URL endpoint
        // Providing 3 arguments (GET/POST, The URL, Async True/False)
        xhr.open('GET', url, true);

        // When request is received, process it here
        xhr.onload = function () {

            // Parse API data into JSON format
            const data = JSON.parse(this.response);

            console.log("start of user's repo data pg = " + pg);
            console.log(data);

            // if no user
            if (data.message === "Not Found") {
                overallInfoElement.append("user not found");

            } else {
                // if user exists, get info

                // if includeAll is true, include all (forked n nonforked)
                if (includeAll) {
                    // Loop over each object in data array
                    for (let i in data) {
                        totalStargazers += data[i].stargazers_count;
                        totalForksCount += data[i].forks_count;
                        totalKB += data[i].size;
                        let topLanguage = data[i].language;
                        // fill in languageFreq dict
                        if (languageFreq.hasOwnProperty(topLanguage)) {
                            languageFreq[topLanguage]++;
                        } else {
                            languageFreq[topLanguage] = 1;
                        }
                    }

                } else {
                    // else includeAll is false, include only repos that are nonforked (fork: false)
                    // Loop over each object in data array
                    for (let i in data) {
                        if (data[i].fork === false) {
                            totalStargazers += data[i].stargazers_count;
                            totalForksCount += data[i].forks_count;
                            totalKB += data[i].size;
                            let topLanguage = data[i].language;
                            // fill in languageFreq dict
                            if (languageFreq.hasOwnProperty(topLanguage)) {
                                languageFreq[topLanguage]++;
                            } else {
                                languageFreq[topLanguage] = 1;
                            }
                        } else {
                            forkedRepoCount += 1;
                        }
                    }
                }
            }
            collectData(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount);
            console.log( pg + " =?= " + page);
            if (pg == page) {
                displayData(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount);
            }
        }
        // Send the request to the server
        xhr.send();
    }

}


function collectData(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount)
{
    console.log("collectData...");

    totalStargazers += totalStargazers;
    totalForksCount += totalForksCount;
    totalKB += totalKB;
    for (let lang in languageFreq) {
        if (languageFreq.hasOwnProperty(lang)) {
            languageFreq[lang]++;
        } else {
            languageFreq[lang] = 1;
        }
    }
    forkedRepoCount += forkedRepoCount;
    console.log(totalStargazers);
}


function displayData(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount)
{
    console.log("displayData...");

    // if includeAll is true, include all (forked n nonforked)
    if (includeAll) {
        let textHTML = "<p><strong>Total repos count: " + totalRepo + "</p>";
        overallInfoElement.append(textHTML);
    } else {
        // else includeAll is false, include only repos that are nonforked (fork: false)
        // total number of nonforked repo = all repo - number of forked repo
        let repoCountNonforked = totalRepo - forkedRepoCount;
        let textHTML = "<p><strong>Total repos count: " + repoCountNonforked + "</p>";
        overallInfoElement.append(textHTML);
    }


    // forked nonforked stuff already handled from requestUserInfo
    let textHTML = "<p><strong>Total stargazers count: " + totalStargazers + "</p>";
    overallInfoElement.append(textHTML);


    // if includeAll is true, include all (forked n nonforked)
    if (includeAll) {
        textHTML = "<p><strong>Total fork count (included): " + totalForksCount + "</p>";
        overallInfoElement.append(textHTML);
    }else {
        textHTML = "<p><strong>Total fork count (not included): " + totalForksCount + "</p>";
        overallInfoElement.append(textHTML);
    }


    // if includeAll is true, include all (forked n nonforked)
    if (includeAll) {
        // find average size. github unit in kb
        let avgKB = totalKB / totalRepo;
        avgKB = avgKB.toFixed(2);
        let textHTML = "<p><strong>Average size of repo: " + avgKB + " KB</p>";
        overallInfoElement.append(textHTML);
    }else {
        // else includeAll is false, include only repos that are nonforked (fork: false)
        // total number of nonforked repo = all repo - number of forked repo
        let repoCountNonforked = totalRepo - forkedRepoCount;
        // find average size. github unit in kb
        let avgKB = totalKB / repoCountNonforked;
        avgKB = avgKB.toFixed(2);
        let textHTML = "<p><strong>Average size of repo: " + avgKB + " KB</p>";
        overallInfoElement.append(textHTML);
    }


    // sort languageFreq. most used -> least used
    // turn languageFreq into array
    let sortable = [];
    for (let i in languageFreq){
        sortable.push([i, languageFreq[i]]);
    }

    // sort array function order by DESC.
    // index 1 for value
    // if return -, a is before b
    // if return +, b is before a
    // ex: a[1] = 4 , b[1] = 5 --> 5-4 = 1 --> b before a
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    console.log(sortable);

    // prepare the HTML text to be put inside languageInfoElement
    let languageHTML = "<p><strong>Used languages: ";
    sortable.forEach(function(item){
        if (item[0] != "null"){
            languageHTML += item[0]+ ", " + item[1] + "\n";
            languageHTML += "</p>";
        }
    });

    languageInfoElement.append(languageHTML);

}




