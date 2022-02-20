function callCfApi(method, callback) {
  var url = "https://codeforces.com/api/" + method; // + '?' + params
  console.log('Calling CF API:', url)

  const request = new XMLHttpRequest();
  request.open("GET", url);
  request.onreadystatechange = (e) => {
    if (request.readyState != 4 || request.status != 200) {
      return;
    }
    response = JSON.parse(request.responseText);
    if (response["status"] != "OK") {
      console.log(response);
    } else {
      callback(response["result"]);
    }
  }
  request.send();
}

class CfLoader {
  constructor() {
    this.allLangs = new Set();
  }

  onProblemListLoaded(response) {
    this.problemDropdown = document.getElementById("select-problem");
    this.problemDropdown.onchange = () => this.onProblemSelected();

    const problems = response["problems"];
    this.problemsByName = {};
    for (const problem of problems) {
      const problemName = problem["contestId"] + problem["index"] + " - " + problem["name"];
      const option = document.createElement("option");
      option.text = problemName;
      this.problemsByName[problemName] = problem;
      this.problemDropdown.appendChild(option);
    }
    this.problemDropdown.selectedIndex = 100;
    this.onProblemSelected();
  }

  onProblemSelected() {
    const problemName = this.problemDropdown.options[this.problemDropdown.selectedIndex].text;
    const problem = this.problemsByName[problemName];
    this.contestId = problem["contestId"];
    this.problemId = problem["index"];
    const method = "contest.status?contestId=" + this.contestId + "&from=1&count=100000";
    callCfApi(method, r => this.onStatusLoaded(r));
  }

  onStatusLoaded(response) {
    this.allLangs = new Set();
    this.okSubmissions = [];
    for (const subm of response) {
      if(subm['testset'] != 'TESTS') continue;
      if(subm['verdict'] != 'OK') continue;
      if(subm['problem']['index'] != this.problemId) continue;
      this.okSubmissions.push(subm);
      this.allLangs.add(subm['programmingLanguage']);
    }

    this.refreshLangsDropdown();
  }

  refreshLangsDropdown() {
    this.langDropdown = document.getElementById("lang-dropdown");
    this.langDropdown.innerHTML = '';
    this.langDropdown.onchange = () => this.onLangSelected();

    const langs = [];
    for (const lang of this.allLangs) {
      langs.push(lang);
    }
    langs.sort();

    for (const lang of langs) {
      const option = document.createElement("option");
      option.text = lang;
      this.langDropdown.appendChild(option);
    }

    this.langDropdown.selectedIndex = 0;
    this.onLangSelected();
  }

  onLangSelected() {
    this.selectedLang = this.langDropdown.options[this.langDropdown.selectedIndex].text;
    this.renderSubmissions();
  }

  renderSubmissions() {
    var subms = [];
    for (const subm of this.okSubmissions) {
      if (subm["programmingLanguage"] == this.selectedLang) {
        subms.push(subm);
      }
    }

    console.log(this.okSubmissions.length, subms.length);
    var tableHtml = '<tr><th>Submission</th><th>Author</th></tr>';
    for (const subm of subms) {
      const id = subm["id"];
      const author =  subm['author']['members'][0]['handle'];
      const url = "https://codeforces.com/contest/" + this.contestId + "/submission/" + id;
      tableHtml += "<tr><td><a href='" + url + "'>" + id + "</td><td>" + author + "</td></tr>";
    }

    const tableSubms = document.getElementById("table-subms");
    tableSubms.innerHTML = tableHtml;
  }

  init() {
    callCfApi("problemset.problems", r => this.onProblemListLoaded(r));
  }
}

const cfl = new CfLoader();
cfl.init();
