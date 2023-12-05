const mongoose = require('mongoose');

var schema = mongoose.Schema;

var UsuarioSchema = schema({
    _id: String, //Hace referencia al RUT.
    clave: String,
    primerNombre: String,
    segundoNombre: String,
    apellidoPaterno: String,
    apellidoMaterno: String,
    imagen: String,
    salas: [String]
}, {
    collection: "usuario",
    versionKey: false
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
