module.exports = function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, details: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', details: err.keyValue });
  }
  return res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
};
