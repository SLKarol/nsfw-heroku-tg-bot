const getListBashOrg = require("@stanislavkarol/get-bash-im-rss");

module.exports = function (req, res, next) {
  getListBashOrg()
    .then((list) => {
      res.json(list);
      return next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
