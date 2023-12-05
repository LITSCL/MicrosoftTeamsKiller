class ImagenHelper {

    validarExtension(extensionArchivo) {
        if (extensionArchivo == "png" || extensionArchivo == "jpg" || extensionArchivo == "jpeg" || extensionArchivo == "gif") {
            return true;
        }
        else {
            return false;
        }
    }

}

module.exports = ImagenHelper;