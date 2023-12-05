const Usuario = require('../models/usuario');
const fs = require('fs');
const path = require('path'); 
const ImagenHelper = require('../helpers/ImagenHelper');

var imagenHelper = new ImagenHelper();

var controlador = {};

controlador.testGet = async function(request, response) {
    return response.status(200).send({
        mensaje: "SERVIDOR: Soy Test-Get del controlador Usuario" 
    });
}

controlador.testPost = async function(request, response) {
    return response.status(200).send({
        mensaje: "SERVIDOR: Soy Test-Post del controlador Usuario"
    });
}

controlador.saveUsuario = async function(request, response) {
    var body = request.body; //Cuando se reciben datos desde un formulario, se debe especificar que los datos llegan por "body".

    var usuario = new Usuario(); 
    
    usuario._id = body.rut;
    usuario.clave = body.clave;
    usuario.primerNombre = body.primerNombre;
    usuario.segundoNombre = body.segundoNombre;
    usuario.apellidoPaterno = body.apellidoPaterno;
    usuario.apellidoMaterno = body.apellidoMaterno;
    usuario.imagen = body.imagen;
    usuario.salas = body.salas;

    usuario.save(function(error, usuarioGuardado) {
        if (error) return response.status(500).send({mensaje: "SERVIDOR: No se a podido guardar el usuario"});
        if (!usuarioGuardado) return response.status(404).send({mensaje: "SERVIDOR: No se a podido guardar el usuario"});
      
        return response.status(200).send({
            usuarioGuardado
        });
    });
}

controlador.getUsuario = async function(request, response) {
    var body = request.body; //Cuando se reciben datos desde un formulario, se debe especificar que los datos llegan por "body".
        
    var rutUsuario = body.rut;
    var claveUsuario = body.clave;
    
    Usuario.findById(rutUsuario, function(error, usuarioObtenido) {
        if (error) return response.status(500).send({mensaje: "SERVIDOR: El usuario no existe"});
        if (!usuarioObtenido) return response.status(404).send({mensaje: "SERVIDOR: El usuario no existe"});
        
        if (usuarioObtenido._id == rutUsuario && usuarioObtenido.clave == claveUsuario) {
            return response.status(200).send({
                usuarioObtenido
            });
        }
        else {
            return response.status(404).send({mensaje: "SERVIDOR: El usuario no existe"});
        }
    });
}

controlador.updateUsuarioSalas = async function(request, response) {
    var params = request.params;

    var idUsuario = params.idUsuario;
    var idSala = params.idSala;
    var jsonUsuario;
    var existeUsuario = false;

    Usuario.findById(idUsuario, function(error, usuarioObtenido) {
        if (error) return response.status(500).send({mensaje: "SERVIDOR: El usuario no existe"});
        if (!usuarioObtenido) return response.status(404).send({mensaje: "SERVIDOR: El usuario no existe"});

        jsonUsuario = usuarioObtenido;
        existeUsuario = true;
            
        if (existeUsuario) {
            jsonUsuario.salas.push(idSala);
            Usuario.findByIdAndUpdate(idUsuario, jsonUsuario, {new: true}, function(error, usuarioActualizado) { 
                if (error) return response.status(500).send({mensaje: "SERVIDOR: No se pudo agregar la sala al Array del usuario"});
                if (!usuarioActualizado) return response.status(404).send({mensaje: "SERVIDOR: No se pudo agregar la sala al Array del usuario"});
        
                return response.status(200).send({
                    usuarioActualizado
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
        Usuario.findByIdAndUpdate(id, {imagen: nombreArchivo}, {new: true}, function(error, usuarioActualizado) { 
            if (error) return response.status(500).send({mensaje: "SERVIDOR: Error al subir la imagen"});
            if (!usuarioActualizado) return response.status(404).send({mensaje: "SERVIDOR: No existe el usuario al que deseas agregarle una imagen"});

            return response.status(200).send({
                usuarioActualizado
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
    var rutaArchivo = "./uploads/images/users/" + archivo; //Aquí se almacena la ruta donde se guardó la imagen.

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