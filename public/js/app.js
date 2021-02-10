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
    stringToHslColor: (str, s, l, opposite, hex) => {
      if (!str) return;
      console.log(str, s, l);

      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      if (opposite) {
        s = s + 10;
        l = l - 30;
      }
      var h = hash % 360;

      if (hex) {
        let hex = app.hslToHex(h, s, l).replace("-", "");
        return hex;
      }

      return "hsl(" + h + ", " + s + "%, " + l + "%)";
    },

    borderColor(str, s, l) {
      let color = app.stringToHslColor(str, s + 5, l - 5, true);

      $("head").append(
        `<style>.box span:before{background:${color} !important;}</style>`
      );

      return "";
    },
    pickTextColorBasedOnBgColorAdvanced: (bgColor, lightColor, darkColor) => {
      var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
      var r = parseInt(color.substring(0, 2), 16); // hexToR
      var g = parseInt(color.substring(2, 4), 16); // hexToG
      var b = parseInt(color.substring(4, 6), 16); // hexToB
      var uicolors = [r / 255, g / 255, b / 255];
      var c = uicolors.map((col) => {
        if (col <= 0.03928) {
          return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
      });
      var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      return L > 0.055 ? darkColor : lightColor;
    },
    hslToHex: (h, s, l) => {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0"); // convert to Hex and prefix "0" if needed
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    },

    songs: [],
    logos: [],
    maxSongList: 10,
    colors: ["primary", "info", "secondary", "warning", "success"],
  },
});
