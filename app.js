// Get the GitHub username input form
const gitHubForm = document.getElementById('gitHubForm');

// element corresponds to index.html's id = #...
let languageInfoElement = jQuery("#language_info");
let overallInfoElement = jQuery("#user_repos");

function resetButton() {
    // empty out all elements every time reset button clicked
    overallInfoElement.empty();
    languageInfoElement.empty();
}

// Listen for submit button on GitHub username input form
gitHubForm.addEventListener('submit', (e) => {

    // Prevent default form submission action
    e.preventDefault();

    console.log('new search...');

    // Get the GitHub username input field on the DOM
    let usernameInput = document.getElementById('usernameInput');

    // Get the value of the GitHub username input field and removes trailing whitespaces
    let gitHubUsername = usernameInput.value.trim();

    // handles empty username
    if (gitHubUsername == '') {
        // empty out all elements every time submit button clicked (new search)
        overallInfoElement.empty();
        languageInfoElement.empty();
        overallInfoElement.append("please provide a username");
        return;
    }

    // Get the forked checkbox field, the .checked returns boolean
    let includeAll = document.getElementById('includeAll').checked;

    // empty out all elements every time submit button clicked (new search)
    overallInfoElement.empty();
    languageInfoElement.empty();

    let totalRepo = 0;

    // initialize final variables to keep track. will be added more for each request
    let finalDataDict = {"totalStargazers": 0, "totalForksCount": 0, "totalKB": 0, "forkedRepoCount": 0};

    // js object (or dictionary) to keep track of language count
    // { "Python" : 4, "CSS" : 8 , .... }
    let languageFreq = {};

    // Run GitHub API function to find user's number of repo, passing in the GitHub username, includeAll checkbox, vars to keep track of
    requestUserInfo(gitHubUsername, includeAll, totalRepo, finalDataDict, languageFreq);
})


function requestUserInfo(username, includeAll, totalRepo, finalDataDict, languageFreq)
{
    console.log("requestUserInfo...");

    // Create new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // GitHub endpoint, dynamically passing in specified username
    const url = `https://api.github.com/users/${username}`;

    // Open a new connection, using a GET request via URL endpoint
    // Providing 3 arguments (GET/POST, The URL, Async true/false)
    xhr.open('GET', url, true);

    // When request is received, process it here
    xhr.onload = function()
    {
        // Parse API data into JSON format
        const data = JSON.parse(this.response);

        if (xhr.status == 404) {
            console.log('ERROR: ', xhr.status);
        } else {
            console.log('REQUEST RECEIVED: ', xhr.status);
        }

        console.log(data)

        // if no user
        if (data.message === "Not Found") {
            overallInfoElement.append("user not found");
        } else {
            // if user exists, get total repo count info
            totalRepo = data["public_repos"];

            // Run GitHub API function to iterate through each repo of a user, passing in the GitHub username, includeAll checkbox, vars to keep track of
            requestUserRepos(username, includeAll, totalRepo, finalDataDict, languageFreq);
        }
    }

    console.log('DONE: ', xhr.status);
    // Send the request to the server
    xhr.send();
}


function requestUserRepos(username, includeAll, totalRepo, finalDataDict, languageFreq)
{
    console.log("requestUserRepos...");
    //let promises = [];

    // math to find the number of requests needed to fetch all repos. github max = 30 repos
    let page = 1;
    if (totalRepo > 30) {
        page = Math.floor(totalRepo / 30);
        let leftover = totalRepo % 30;
        if (leftover > 0) {
            page++;
        }
    }

    // keeps track of the num of requests. incremented in onload function
    // if count == last page, print results
    let count = 0;

    // send request for each page
    for (let pg = 1; pg < page+1; pg++)
    {
        //let p = new Promise(function(resolve,reject){

        // Create new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // GitHub endpoint, dynamically passing in specified username and pg
        const url = `https://api.github.com/users/${username}/repos?page=${pg}`;

        // Open a new connection, using a GET request via URL endpoint
        // Providing 3 arguments (GET/POST, The URL, Async True/False)
        xhr.open('GET', url, true);

        // When request is received, process it here
        xhr.onload = function ()
        {
            // Parse API data into JSON format
            const data = JSON.parse(this.response);
            if (xhr.status == 404) {
                console.log('ERROR: ', xhr.status);
            } else {
                console.log("start of user's repo data pg = " + pg);
                console.log('REQUEST RECEIVED: ', xhr.status);
            }

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
                        finalDataDict["totalStargazers"] += data[i].stargazers_count;
                        finalDataDict["totalForksCount"] += data[i].forks_count;
                        finalDataDict["totalKB"] += data[i].size;

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
                            finalDataDict["totalStargazers"] += data[i].stargazers_count;
                            finalDataDict["totalForksCount"] += data[i].forks_count;
                            finalDataDict["totalKB"] += data[i].size;

                            let topLanguage = data[i].language;
                            // fill in languageFreq dict
                            if (languageFreq.hasOwnProperty(topLanguage)) {
                                languageFreq[topLanguage]++;
                            } else {
                                languageFreq[topLanguage] = 1;
                            }
                        } else {
                            finalDataDict["forkedRepoCount"]++;
                        }
                    }
                }
            }
            // increment request count here
            count++;

            // if request count == last page, time to display the infos
            if (count === page) {
                displayData(username, includeAll, totalRepo, finalDataDict, languageFreq);
            }

        } // end of xhr.onload


        // Send the request to the server
        xhr.send();
        console.log('DONE: ', xhr.status);
        //});
        //promises.push(p);
    } // end of for loop

    // Promise.all(promises).then(values => {
    //     console.log("hi " + values);
    //     displayData(username, includeAll, totalRepo, totalStargazers, totalForksCount, totalKB, languageFreq, forkedRepoCount);
    // });
}


function displayData(username, includeAll, totalRepo, finalDataDict, languageFreq)
{
    console.log("displayData... yippeee!");


    // if includeAll is true, include all (forked n nonforked)
    if (includeAll) {
        let textHTML = "<p><strong>Total repos count: " + totalRepo + "</p>";
        overallInfoElement.append(textHTML);
    } else {
        // else includeAll is false, include only repos that are nonforked (fork: false)
        // total number of nonforked repo = all repo - number of forked repo
        let nonforkedRepoCount = totalRepo - finalDataDict["forkedRepoCount"];
        let textHTML = "<p><strong>Total repos count: " + nonforkedRepoCount + "</p>";
        overallInfoElement.append(textHTML);
    }


    // forked nonforked stuff already handled from requestUserInfo
    let textHTML = "<p><strong>Total stargazers count: " + finalDataDict["totalStargazers"] + "</p>";
    overallInfoElement.append(textHTML);


    textHTML = "<p><strong>Total fork count: " + finalDataDict["totalForksCount"] + "</p>";
    overallInfoElement.append(textHTML);


    // if includeAll is true, include all (forked n nonforked)
    if (includeAll) {
        // find average size. github unit in kb
        let avgKB = finalDataDict["totalKB"] / totalRepo;
        avgKB = avgKB.toFixed(2);

        let textHTML = "<p><strong>Average size of repo: " + avgKB + " KB</p>";
        overallInfoElement.append(textHTML);
    }else {
        // else includeAll is false, include only repos that are nonforked (fork: false)
        // total number of nonforked repo = all repo - number of forked repo
        let nonforkedRepoCount = totalRepo - finalDataDict["forkedRepoCount"];
        // find average size. github unit in kb
        let avgKB = finalDataDict["totalKB"] / nonforkedRepoCount;
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
    let languageHTML = "<p><strong>Used languages: </strong></p>";
    sortable.forEach(function(item){
        if (item[0] != "null"){
            languageHTML += "<p>" + item[0]+ ", used on " + item[1] + " repos\n";
            languageHTML += "</p>";
        }
    });

    if (languageHTML == "<p><strong>Used languages: </strong></p>") {
        languageHTML += "<p>none</p>";
    }

    languageInfoElement.append(languageHTML);
}




