const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname,"views"));

async function ankiHandler(action,params) {
  const ankiResponse = await fetch("http://localhost:8765", {
    method: "POST",
    body: JSON.stringify({
      action: action,
      version: 5,
      params: params
    })
  });
  var outputString = await ankiResponse.text();

  if (action == "guiCurrentCard") {
    // replace filename with media/filename
    const re = /src=\\"([^"\\]+)\\"/g
    // const found = outputString.match(re);
    // console.log("src attribute found: ", found, outputString.slice(found,found+10));
    outputString = outputString.replace(re, 'src=\\"/media/$1\\"')
  }

  const outputJSON = JSON.parse(outputString)
  // console.log(outputString);
  return outputJSON["result"];
}

app.get("/favicon.ico", (request, response) => {response.status(204).end()});

app.use("/media", express.static(path.join(__dirname, "media")));

app.get("/review/:name", (request, response) => {
  console.log("get route");
  ankiHandler("guiDeckReview",request.params).then(() => {
  ankiHandler("guiCurrentCard").then(result => {
    response.render("review",result);
  })
  })
});

const urlEncodedParser = bodyParser.urlencoded();

app.post("/review/:name", urlEncodedParser, (request, response) => {
  console.log("post route")
  ankiHandler("guiShowAnswer").then(() => {
  request.body["ease"] = parseInt(request.body["ease"]);
  ankiHandler("guiAnswerCard", request.body).then(answerResult => {
  ankiHandler("guiDeckReview", request.params).then(() => {
  ankiHandler("guiCurrentCard").then(currentResult => {
    response.render("review",currentResult);
  })
  })
  })
  });
})

app.use("/", (request, response) => {
  ankiHandler("deckNames").then(result => {
    let display = "<ul>";
    for (const [_,name] of Object.entries(result)) {
      display += `<li><a href="/review/${name}">${name}</a></li>`;
    }
    display += "</ul>";
    response.render("selection",{display: display});
  });
});

app.listen(3000);
