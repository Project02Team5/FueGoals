module.exports = {
  format_date: (date) => {
      // Format date as MM/DD/YYYY
      return date.toLocaleDateString();
  },
  eq: function (a, b) {
    return a == b;
  },
  cap: function (string) {
 
    if (!string) {
      return string;
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  },
};