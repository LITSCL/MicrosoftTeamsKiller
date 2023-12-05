const Sala = require('../models/sala');
const fs = require('fs');
const path = require('path');
const ImagenHelper = require('../helpers/ImagenHelper');

var imagenHelper = new ImagenHelper();

var controlador = {};

controlador.testGet = async function(request, response) {
    return response.status(200).send({
        mensaje: "SERVIDOR: Soy Test-Get del controlador Sala" 
    });
}

controlador.testPost = async function(request, response) {
    return response.status(200).send({
        mensaje: "SERVIDOR: Soy Test-Post del controlador Sala"
    });
}

controlador.saveSala = async function(request, response) {
    var body = request.body;

    var nombre = body.nombre;
    var imagen = body.imagen;
    var creador = body.creador;

    var sala = new Sala(); 

    sala.nombre = nombre;
    sala.imagen = imagen;
    sala.usuarios = creador;

    sala.save(function(error, salaGuardada) {
        if (error) return response.status(500).send({mensaje: "SERVIDOR: No se ha podido crear la sala"});
        if (!salaGuardada) return response.status(404).send({mensaje: "SERVIDOR: No se ha podido crear la sala"});
      
        return response.status(200).send({
            salaGuardada
        });
    });
}

controlador.getSala = async function(request, response) {
    var body = request.body;

    var id = body.id;

    if (!id) return response.status(404).send({mensaje: "SERVIDOR: No se ha podido obtener la sala"});

    Sala.findById(id, function(error, salaObtenida) {
        if (error) return response.status(500).send({mensaje: "SERVIDOR: No se ha podido obtener la sala"});
        if (!salaObtenida) return response.status(404).send({mensaje: "SERVIDOR: No se ha podido obtener la sala"});

        return response.status(200).send({
            salaObtenida
        });
    });
}

controlador.updateSalaUsuarios = async function(request, response) {
    var params = request.params;
    
    var idSala = params.idSala;
    var idUsuario = params.idUsuario;
    var jsonSala;
    var existeSala = false;

    Sala.findById(idSala, function(error, salaObtenida) {
        if (error) return response.status(500).send({mensaje: "SERVIDOR: La sala no existe"});
        if (!salaObtenida) return response.status(404).send({mensaje: "SERVIDOR: La sala no existe"});

        jsonSala = salaObtenida;
        existeSala = true;
            
        if (existeSala) {
            jsonSala.usuarios.push(idUsuario);
            Sala.findByIdAndUpdate(idSala, jsonSala, {new: true}, function(error, salaActualizada) { 
                if (error) return response.status(500).send({mensaje: "SERVIDOR: No se pudo agregar el usuario al Array de la sala"});
                if (!salaActualizada) return response.status(404).send({mensaje: "SERVIDOR: No se pudo agregar el usuario al Array de la sala"});
        
                return response.status(200).send({
                    salaActualizada
                });
            });
        }
    });
}

controlador.uploadFileImagen = async function(request, response) {
    var params = request.params;
    var file = request.file;

    var id = params.id;
    var rutaArchivo = file.path; //Aquí se almacena la ruta donde se guardó la imagen.
    var nombreArchivo = file.filename; //Aquí se almacena el nombre de la imagen.
    var split = nombreArchivo.split(".");
    var extensionArchivo = split[1]; //Aquí se almacena el formato de la imagen.

    if (imagenHelper.validarExtension(extensionArchivo)) {
        Sala.findByIdAndUpdate(id, {imagen: nombreArchivo}, {new: true}, function(error, salaActualizada) { 
            if (error) return response.status(500).send({mensaje: "SERVIDOR: Error al subir la imagen"});
            if (!salaActualizada) return response.status(404).send({mensaje: "SERVIDOR: No existe el usuario al que deseas agregarle una imagen"});

            return response.status(200).send({
                salaActualizada
            });
        }); 
    }
    else {
        fs.unlink(rutaArchivo, function(error) {
            return response.status(500).send({mensaje: "SERVIDOR: La extensión no es válida"});
        });
    }
}

controlador.getFileImagen = async function(request, response) {
    var params = request.params;

    var archivo = params.imagen; //Aquí se almacena el nombre de la imagen con su extensión.
    var rutaArchivo = "./uploads/images/rooms/" + archivo; //Aquí se almacena la ruta donde se guardó la imagen.

    fs.exists(rutaArchivo, function(existe) { //El método "exists" consulta si la ruta entregada en el primer argumento existe, el segundo argumento es una función callback (El argumento de la función callback será true o false dependiendo si existe o no el fichero).
        if (existe) {
            return response.sendFile(path.resolve(rutaArchivo));
        }
        else {
            return response.status(500).send({mensaje: "SERVIDOR: No existe la imagen"});
        }
    });
}

module.exports = controlador;