module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Check if err exists and has properties before accessing them
      if (err && typeof err === 'object' && Object.keys(err).length > 0) {
        return next(err);
      }
      return next(err);
    });
  };
};