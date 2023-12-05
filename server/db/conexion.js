const mongoose = require('mongoose'); //En eta variable se carga el módulo de la librería (Mongoose Mongoose es una librería ORM que permite trabajar con MongoDB, esta librería tiene una gran variedad de métodos que facilitan el uso de MongoDB, se puede conectar a la base de datos, crear modelos, crear entidades, entre muchas otras cosas que permiten los métodos de la librería).

const db = {
    conectarDB: async function conectarDB() {
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/dbmicrosoftteamskiller");
            console.log("Conexion a la base de datos realizada con exito");
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = db;