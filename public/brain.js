
let commented = false;
let quota = 0;
let huntMethodFirst = "";
function addAndSetCounter(val) {
  counter+=val
  setCounter(counter)
}
function authenticate() {
  return gapi.auth2.getAuthInstance()
      .signIn({scope: "https://www.googleapis.com/auth/youtube.force-ssl"})
      .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); });
}
function loadClient() {
  gapi.client.setApiKey(API_KEY);
  return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function() { console.log("GAPI client loaded for API");
      loggedIn();
    },
            function(err) { console.error("Error loading GAPI client for API", err); });
}
function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
function execute(videoId) {
  if(commented) {
    return true;
  }
  setStateVal("NEW VIDEO UP. COMMENTING..");
  commented= true;
  return gapi.client.youtube.commentThreads.insert({
    "part": "snippet",
    "resource": {
      "snippet": {
        "videoId": videoId,
        "topLevelComment": {
          "snippet": {
            "textOriginal": commentText
          }
        }
      }
    }
  })
      .then(function(response) {
              quota+=50;
              setQuota(quota);
              setStateVal(JSON.stringify(response))
              setStateVal("COMMENTED. Final hunt method was: " + huntMethodFirst)
              commented = true;
              openInNewTab("https://www.youtube.com/watch?v=" + videoId);
              //alert(huntMethodFirst);
            },
            function(err) { console.error("Execute error", err); });
}
gapi.load("client:auth2", function() {
  gapi.auth2.init({client_id: CLIENT_ID});
});
function isNewVideo(id) {
  if(id=="none") {
    return false;
  }
  return (id!=currentLatestVideoID);
}
function peek(url,consoleText) { //call SERVER API ENDPOINT to return latest video
try {
  fetch(url)
  .then(res => res.json())
  .then((out) => {
    setStateVal(consoleText)
    addAndSetCounter(1)
    let title = out.title
    setLatestTitle(title)
    let videoID = out.link
    console.log("title:" + title + " and video id: " + videoID); //return true;
    if(isNewVideo(videoID)) {
      huntMethodFirst = consoleText;
      setLatestTitle(title)
      execute(videoID);
    }
  })
  .catch((err) => { console.log(err) });
} catch(e) {
  console.log(e)
}
}
function hunt() {
  quota+=3;
  let url = SERVER_HOST + "/hunt?key=" + API_KEY + "&playlistId=" + uploadPlaylistID //"/hunt3/" + channelID
  peek(url,"Queried Youtube Data API for latest video");
}

function hunt2() {
  let url = SERVER_HOST + "/hunt2/" + channelID;
  peek(url,"Scraped featured section on youtube channel");
}

function hunt3() {
  let url = SERVER_HOST + "/hunt3/" + channelID;
  peek(url,"Scraped videos section on youtube channel");
}

function hunt4() {
  let url = SERVER_HOST + "/hunt4/" + channelID;
  peek(url,"Scraped youtube RSS xml for channel");
}

function hunt5() {
  let url = SERVER_HOST + "/hunt5/" + channelID;
  peek(url,"TOR Scraped featured section on youtube channel");
}

function hunt6() {
  let url = SERVER_HOST + "/hunt6/" + channelID;
  peek(url,"TOR Scraped videos section on youtube channel");
}
let counter=0;
function goBeast() {
  if(commented) {
    fetched();
    return true;
  }
//setStateVal("Checking for new video.")
if(quota<5000) { //call API
  //hunt();
  setQuota(quota);
}

hunt2();
hunt3();
hunt4();
setLatestTitle("")
//setCounter(counter)
setTimeout(goBeast, 500);
}
//latestVideoScraper()
