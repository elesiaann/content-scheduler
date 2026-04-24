// Vercel serverless function entry point — exports the Express app
// All /api/* requests are routed here via vercel.json rewrites
module.exports = require('../backend/src/index.js');
