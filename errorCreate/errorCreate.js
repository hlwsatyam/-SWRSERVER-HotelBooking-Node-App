const errorCreate = (error, req, res, next) => {
    return res.status(error.status || 503).json({
      status: false,
      message: error.message || "Something Went Wrong.",
    });
  };
  module.exports = errorCreate;
  