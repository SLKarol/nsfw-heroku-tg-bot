const getListBashOrg = require("../lib/bashOrg");

module.exports = function (req, res, next) {
  Promise.all([getListBashOrg(), getListBashOrg("https://ithappens.me/rss/")])
    .then(([bashOrg, itHappens]) => {
      res.json({
        bashOrg,
        itHappens,
      });
      return next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
