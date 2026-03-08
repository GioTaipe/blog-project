const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

/**
 * Conecta a la base de datos en memoria
 */
module.exports.connect = async () => {
    // Evitamos conectar si ya hay una conexión activa
    if (mongoose.connection.readyState !== 0) return;

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
};

/**
 * Cierra la conexión y detiene el servidor
 */
module.exports.closeDatabase = async () => {
    if (mongod) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
    }
};

/**
 * Limpia todos los datos de las colecciones (se usa entre tests)
 */
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};