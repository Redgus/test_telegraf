const { MongoClient } = require('mongodb');

async function connect_db(url) {
    const db = (await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, dbName : 'telegram' }));
    
    return db;
}

module.exports = {
    connect_db
}