1. In order to use application. First install node.js.
2. Set env variables music_twitch_client_id and music_twitch_client_secret. In order to connect to twitch API. - This is for pulling user logo
3. You also must put your streamer name inside of config.json.
4. This applicaiton uses Chrome instead of the API - This lets the system catch changes as they are updated. I might add API layer with response check ever X in the future.

For now in order to change max song list - You need to edit index.ejs inside of the views folder. On the bottom you will see a maxSongList variable inside of the Vue Object

Working on : lastFM or another API to grab album/artist artwork.
