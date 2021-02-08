const LastFM = require("last-fm");
const lastfm = new LastFM("fe61f611d675d7b2a4a57a406d661c7f", {
  userAgent: "MyApp/1.0.0 (http://example.com)",
});

export function search(query: string) {
  return new Promise((resolve, reject) => {
    lastfm.trackSearch({ q: query }, (err: Error, data: any) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
