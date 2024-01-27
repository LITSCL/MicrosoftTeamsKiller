$(document).ready(function() {
    $.validate({
        lang: "es"
    });
    
    var div_contenedor = document.getElementById("contenedor");
    var div_tienesCuenta = document.getElementById("tienesCuenta");
    
    if (localStorage.getItem("Usuario")) { //Evaluando si existe una sesión activa.
        window.location.href = "perfil.html";
    }
    else {
        div_contenedor.style.display = "block";
        div_tienesCuenta.style.display = "block";
    }
    
    $("#crearCuenta").on("click", function(event) {
        event.preventDefault();
        var input_rut = document.getElementById("rut");
        var input_clave = document.getElementById("clave");
        var input_primerNombre = document.getElementById("primerNombre");
        var input_segundoNombre = document.getElementById("segundoNombre");
        var input_apellidoPaterno = document.getElementById("apellidoPaterno");
        var input_apellidoMaterno = document.getElementById("apellidoMaterno");
        var input_imagen = document.getElementById("imagen");
        var div_mensaje = document.getElementById("mensaje");
        var div_errorCrearCuenta = document.getElementById("errorCrearCuenta");
        div_errorCrearCuenta.style.display = "none";
    
        const patronTexto = new RegExp('^[A-Z]+$', 'i');
        const patronClave = new RegExp('^([A-Z]+$)|([A-Z]+[0-9])|([[0-9])', 'i');
        var errores = [];
    
        if (validarRut(input_rut.value) == false) {
            errores.push("El rut no es válido");
        }
    
        if (!patronClave.test(input_clave.value)) { //Se verifica si el input tiene caracteres distintos a los permitidos.
            errores.push("La contraseña no es valida");
        }
    
        if (!patronTexto.test(input_primerNombre.value)) { 
            errores.push("El primer nombre no es válido");
        }
    
        if (!patronTexto.test(input_segundoNombre.value)) { 
            errores.push("El segundo nombre no es válido");
        }
    
        if (!patronTexto.test(input_apellidoPaterno.value)) { 
            errores.push("El apellido paterno no es válido");
        }
    
        if (!patronTexto.test(input_apellidoMaterno.value)) { 
            errores.push("El apellido materno no es válido");
        }
    
        var rutaImagenSplit = input_imagen.value.split(".");
        formatoImagen = rutaImagenSplit[rutaImagenSplit.length - 1];
    
        if (formatoImagen == "png" || formatoImagen == "jpg" || formatoImagen == "jpeg" || formatoImagen == "gif") {
            
        }
        else {
            errores.push("El formato de la imagen no es válido");
        }
    
        if (errores.length == 0) {
            div_errorCrearCuenta.style.display = "none";
    
            var usuario = {
                rut: input_rut.value,
                clave: input_clave.value,
                primerNombre: input_primerNombre.value,
                segundoNombre: input_segundoNombre.value,
                apellidoPaterno: input_apellidoPaterno.value,
                apellidoMaterno: input_apellidoMaterno.value,
                imagen: "imagen.png",
                salas: []
            }
    
            fetch("http://localhost:2900/api/usuario/save-usuario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                try { //Es necesario capturar el error porque podría llegar un json llamado mensaje.
                    if (response.usuarioGuardado._id == input_rut.value) {
                        div_mensaje.style.setProperty("display", "block");
                        div_mensaje.style.backgroundColor = "green";
                        div_mensaje.innerHTML = "¡Cuenta creada con éxito!"
                        
                        let archivo = document.getElementById("imagen");
                        var formData = new FormData();
                        formData.append("imagen", archivo.files[0]); //El servidor buscará la clave "imagen", obtendrá el valor (La imagen) y la guardará en la carpeta "imagenes".
    
                        fetch("http://localhost:2900/api/usuario/upload-file-imagen" + "/" + response.usuarioGuardado._id, {
                            method: "PUT",
                            headers: {
                                //Para subir un archivo no es necesario especificar las cabeceras.
                            },
                            body: formData
                        })
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(response) {
                            try { //Es necesario capturar el error porque podría llegar un json llamado mensaje.
                                if (response.usuarioActualizado._id) {
                                    
                                }
                            } catch (error) {
                                console.log(response.mensaje);
                            }              
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    }
                } catch (error) {
                    console.log(response.mensaje);
                    div_mensaje.style.setProperty("display", "block");
                    div_mensaje.style.backgroundColor = "red";
                    div_mensaje.innerHTML = "¡Error al crear la cuenta!"
                }              
            })
            .catch(function(error) {
                console.log(error);
                div_mensaje.style.setProperty("display", "block");
                div_mensaje.style.backgroundColor = "red";
                div_mensaje.innerHTML = "¡Error al crear la cuenta!"
            });
        }
        else {
            div_errorCrearCuenta.textContent = "Hay errores en los campos";
            div_errorCrearCuenta.style.display = "block";
        }
    });

    function validarRut(rut) {
        const arrayDV = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "k"];
        var formatoRut = rut.split("-");
        var validado = false;
        
        if (formatoRut.length == 2) {
            var numero = formatoRut[0];
            var digitoVerificador = formatoRut[1];
        
            if (!isNaN(numero)) {
                if (numero.length == 8 || numero.length == 7) {
                    for (var i = 0; i < arrayDV.length; i++) {
                        if (digitoVerificador == arrayDV[i]) {
                            validado = true;
                            break;
                        }
                    }
                }
            }
        }
        return validado;
    }
});