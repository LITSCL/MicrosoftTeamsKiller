const SalaControlador = require('../controllers/sala'); 

const express = require('express');
var router = express.Router();

const path = require('path');
const multer = require('multer');

var imagenStorage = multer.diskStorage({ //En esta variable se almacena la configuración de multer.
    destination: function(request, archivo, cb) {
        cb(null, "./uploads/images/rooms"); //Aquí se esta indicando donde se deben guardar los archivos.
    },
    filename: function(request, archivo, cb) {
        cb(null, archivo.fieldname + "-" + Date.now() + path.extname(archivo.originalname)); //Aquí se esta colocando al archivo subido (Para que no se repitan los nombres).
    }
});

var imagenStorageMiddleware = multer({storage: imagenStorage});

router.get("/test-get", SalaControlador.testGet);
router.post("/test-post", SalaControlador.testPost);
router.post("/save-sala", SalaControlador.saveSala);
router.post("/get-sala", SalaControlador.getSala);
router.put("/update-sala-usuarios/:idSala?/:idUsuario?", SalaControlador.updateSalaUsuarios);
router.put("/upload-file-imagen/:id", imagenStorageMiddleware.single("imagen"), SalaControlador.uploadFileImagen);  //Donde dice "imagenStorageMiddleware.single('imagen')", se hace referencia al nombre de la clave que llega de la petición asincrona.
router.get("/get-file-imagen/:imagen", SalaControlador.getFileImagen);

module.exports = router;