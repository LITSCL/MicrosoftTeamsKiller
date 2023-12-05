const UsuarioControlador = require('../controllers/usuario'); 

const express = require('express');
var router = express.Router();

const path = require('path');
const multer = require('multer');

var imagenStorage = multer.diskStorage({ //En esta variable se almacena la configuración de multer.
    destination: function(request, archivo, cb) {
        cb(null, "./uploads/images/users"); //Aquí se esta indicando donde se deben guardar los archivos.
    },
    filename: function(request, archivo, cb) {
        cb(null, archivo.fieldname + "-" + Date.now() + path.extname(archivo.originalname)); //Aquí se esta colocando al archivo subido (Para que no se repitan los nombres).
    }
});

var imagenStorageMiddleware = multer({storage: imagenStorage});

router.get("/test-get", UsuarioControlador.testGet);
router.post("/test-post", UsuarioControlador.testPost);
router.post("/save-usuario", UsuarioControlador.saveUsuario);
router.post("/get-usuario", UsuarioControlador.getUsuario); //Esta ruta no puede ser GET, ya que no se pueden enviar datos por body con GET.
router.put("/update-usuario-salas/:idUsuario?/:idSala?", UsuarioControlador.updateUsuarioSalas);
router.put("/upload-file-imagen/:id", imagenStorageMiddleware.single("imagen"), UsuarioControlador.uploadFileImagen); //Donde dice "imagenStorageMiddleware.single('imagen')", se hace referencia al nombre de la clave que llega de la petición asincrona.
router.get("/get-file-imagen/:imagen", UsuarioControlador.getFileImagen);

module.exports = router;