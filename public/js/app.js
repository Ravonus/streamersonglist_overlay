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
