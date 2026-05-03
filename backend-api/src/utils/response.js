/**
 * Standardize API responses
 */

const sendResponse = (res, statusCode, success, message, data = {}, error = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error
  });
};

const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, null);
};

const sendError = (res, message = 'Error', error = null, statusCode = 500) => {
  return sendResponse(res, statusCode, false, message, null, error);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError
};
