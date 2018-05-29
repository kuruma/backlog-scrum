export default {
  methods: {
    dateToString(dtstr) {
      const dt = new Date(dtstr);
      let str = '';
      const now = new Date();
      const y = dt.getFullYear();
      if (y !== now.getFullYear()) {
        str += `${y}年`;
      }
      str += `${dt.getMonth() + 1}月`;
      str += `${dt.getDate()}日`;
      return str;
    },
    datetimeToString(dttmstr) {
      const dt = new Date(dttmstr);
      const m = dt.getMonth() + 1;
      const d = dt.getDate();
      const hr = dt.getHours();
      const mi = `0${dt.getMinutes()}`.slice(-2); // 2桁になるように0埋め
      return `${m}/${d} ${hr}:${mi}`;
    },
  },
};
