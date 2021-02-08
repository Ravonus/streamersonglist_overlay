import fs from "fs";
import path from "path";

export function readConfig() {
  const conf = JSON.parse(
    fs.readFileSync(path.join("__dirname", "../", "config.json"), "utf8")
  );

  if (process.env.music_twitch_client_id)
    conf.client_id = process.env.music_twitch_client_id;
  if (process.env.music_twitch_client_secret)
    conf.client_secret = process.env.music_twitch_client_secret;

  return conf;
}
