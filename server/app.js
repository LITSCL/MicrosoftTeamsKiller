const express = require('express');
const bodyParser = require('body-parser');

const db = require('./db/conexion');

db.conectarDB();

var app = express();

app.use(express.static("../client"));

app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json()); 
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method");
    response.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    response.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

var usuarioRutas = require('./routes/usuario');
var salaRutas = require('./routes/sala');

app.use("/api/usuario", usuarioRutas);
app.use("/api/sala", salaRutas);

module.exports = app;