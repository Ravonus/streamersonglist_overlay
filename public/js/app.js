var app = new Vue({
  el: "#app",
  data: {
    fetchLogo: async (name) => {
      return await fetch(`/logos/${name}`)
        .then((response) => response.json())
        .then((data) => data);
    },
    asyncForEach: async function (array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    stringToHslColor: (str, s, l, opposite) => {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      if (opposite) {
        s = s + 10;
        l = l - 30;
      }
      var h = hash % 360;
      return "hsl(" + h + ", " + s + "%, " + l + "%)";
    },
    hslToRgb: (h, s, l) => {
      var r, g, b;

      if (s == 0) {
        r = g = b = l; // achromatic
      } else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    invertColor: (hex) => {
      if (hex.indexOf("#") === 0) {
        hex = hex.slice(1);
      }
      // convert 3-digit hex to 6-digits.
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) {
        throw new Error("Invalid HEX color.");
      }
      // invert color components
      var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
      // pad each with zeros and return
      return "#" + padZero(r) + padZero(g) + padZero(b);
    },

    padZero: (str, len) => {
      len = len || 2;
      var zeros = new Array(len).join("0");
      return (zeros + str).slice(-len);
    },
    borderColor(str, s, l) {
      let color = app.stringToHslColor(str, s + 5, l - 5, true);
      $("head").append(
        `<style>.box span:before{background:${color} !important;}</style>`
      );

      return "";
    },
    songs: [],
    logos: [],
    maxSongList: 10,
    colors: ["primary", "info", "secondary", "warning", "success"],
  },
});
