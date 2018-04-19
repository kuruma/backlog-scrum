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
  },
};
