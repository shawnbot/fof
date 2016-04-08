module.exports = function accessor(index) {
  return function(d) {
    return d[index];
  };
};
