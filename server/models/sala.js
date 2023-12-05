const mongoose = require('mongoose');

var schema = mongoose.Schema;

var SalaSchema = schema({
    nombre: String,
    imagen: String,
    usuarios: [String]
}, {
    collection: "sala",
    versionKey: false
});

module.exports = mongoose.model("Sala", SalaSchema);