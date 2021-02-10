import express, { Response, Request } from "express";
import path from "path";
import { socketStart } from "./sockets";

import { setLogoRoute } from "./routes/grabLogos";
import { readConfig } from "./config";
import { OpenStreamerSongListPage } from "./browser";

let conf = readConfig();

const app = express();
const port = conf.port || 8080; // default port to listen

let currentSongsList: { [key: string]: {} } = {};
let lastCurrentSongsList = {};

// Configure Express to use EJS
app.set("views", path.join(__dirname, "../", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../", "public")));

var http = require("http")
  .createServer(app)
  .listen(port, function () {
    console.log("Express server listening on port " + port);
  });

// define a route handler for the default home page
app.get("/", async (req: Request, res: Response) => {
  const streamer = req.query.streamer || conf.streamer;
  let songList: any = currentSongsList[streamer];

  if (!songList) {
    songList = await OpenStreamerSongListPage(streamer);
  }

  if (!app.locals.currentSongsList) app.locals.currentSongsList = {};

  // app.locals.currentSongsList[streamer] = songList;
  res.render("index", {
    currentSongsList: songList[streamer] || songList,
    room: streamer,
  });
});

const io = socketStart(http);

setLogoRoute(app);

export function setSongList(list: {}, streamer: string) {
  currentSongsList[streamer] = list;

  io.of("/").to(streamer).emit("list", list);
}

export function grabApp() {
  return app;
}
