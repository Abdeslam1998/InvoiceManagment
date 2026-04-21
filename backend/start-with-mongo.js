const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;
    console.log('🌱 In-memory MongoDB started at', uri);
    // Require the server after setting MONGO_URI so mongoose connects correctly
    require('./server');
  } catch (err) {
    console.error('Failed to start in-memory MongoDB', err);
    process.exit(1);
  }
})();
