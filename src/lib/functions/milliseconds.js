/* eslint-disable no-restricted-globals */
const getMilliseconds = (time) => {
  if (!time) return 0;
  // reverse so we can work with an easier way such as (seconds, minutes, hours)
  const times = time.split(':').reverse();

  const ms = 1000;
  let t = 1;

  // seconds
  if (times.length > 0 && !isNaN(times[0])) {
    t = parseInt(times[0], 10);
  }

  // minutes
  if (times.length > 1 && !isNaN(times[1])) {
    t += parseInt(times[1], 10) * 60;
  }

  // hours
  if (times.length > 2 && !isNaN(times[2])) {
    t += parseInt(times[2], 10) * 60 * 60;
  }

  return ms * t;
};

module.exports = {
  getMilliseconds,
};
