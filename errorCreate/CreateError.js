 const CreateError = (message, status) => {
  const error = new Error();
  error.message = message || "Something Went Worng.";
  error.status = status || 503;
  return error;
};
module.exports = CreateError;