# Simple Web App with the GitHub API

API endpoint that returns the aggregated statistics across a user’s GitHub repositories given a username. Allows filtering down to just non-forked repositories. 
<br/>


### Access from web browser (preferably Google Chrome):
1. On the url bar, type: <br>
`https://my-github-api.web.app` <br>
  
### Run locally:
1. Download the zip file then unzip it or clone the repository: <br>
shell> `git clone https://github.com/etanowid/github-api.git`
2. On your machine: `github-api` -> open `index.html` on a web browser (preferably Google Chrome) 


### Details: <br>
User's statistics provided:
- Total count of repositories
- Total stargazers for all repositories
- Total fork count for all repositories
- Average size of a repository in KB
- A list of languages with their counts, sorted by the most used to least used. I only calculated the top language for each repo because the "languages_url" returns empty for some. 
- There's an additional parameter input “include forked repo” as a checkbox. When this box is unchecked, it will only show statistics for repositories that are not forked.

### Even more details: <br>
- To see the JSON data retrieved and any error codes, right click on the browser -> `inspect` -> `console`
- The project is deployed using Firebase (Hosting)


<br>
<br>
reference: <br/>
GoLinks project <br>
https://codesnippet.io/github-api-tutorial/
<br>
https://github.com/timmywheels/github-api-tutorial
<br>
https://www.skcript.com/svr/web-app-using-html-js-firebase-part-1/

<br><br>

Edriana Tanowidjaja