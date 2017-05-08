exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://avram:izypizy@ds127101.mlab.com:27101/blog2';
exports.PORT = process.env.PORT || 3030;