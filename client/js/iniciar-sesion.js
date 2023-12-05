$(document).ready(function() {
    $.validate({
        lang: "es"
    });
    
    var div_contenedor = document.getElementById("contenedor");
    var div_crearCuenta = document.getElementById("crearCuenta");
    
    if (localStorage.getItem("Usuario")) { //Evaluando si existe una sesión activa.
        window.location.href = "perfil.html";
    }
    else {
        div_contenedor.style.display = "block";
        div_crearCuenta.style.display = "block";
    }
    
    $("#iniciarSesion").on("click", function(event) {
        var input_rut = document.getElementById("rut");
        var input_clave = document.getElementById("clave");
        var div_mensaje = document.getElementById("mensaje");
        var div_errorIniciarSesion = document.getElementById("errorIniciarSesion");
        div_errorIniciarSesion.style.display = "none";
    
        var usuario = {
            rut: input_rut.value,
            clave: input_clave.value
        }
    
        const patronClave = new RegExp("^([A-Z]+$)|([A-Z]+[0-9])|([[0-9])", "i");
        var errores = [];
    
        if (!validarRut(input_rut.value)) {
            errores.push("El rut no es válido");
        }
    
        if (!patronClave.test(input_clave.value)) { //Se verifica si el input tiene caracteres distintos a los permitidos.
            errores.push("La contraseña no es valida");
        }
    
        if (errores.length == 0) {
            fetch("http://localhost:2900/api/usuario/get-usuario", {
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
                    if (response.usuarioObtenido._id == input_rut.value) {
                        localStorage.setItem("Usuario", JSON.stringify(response));
                        window.location.href = "perfil.html";     
                }
            }   catch (error) {
                    console.log(response.mensaje);
                    div_mensaje.style.setProperty("display", "block");
                    div_mensaje.style.backgroundColor = "red";
                    div_mensaje.innerHTML = "¡Tus credenciales son incorrectas!"
                }   
            })
            .catch(function(error) {
                console.log(error);
                div_mensaje.style.setProperty("display", "block");
                div_mensaje.style.backgroundColor = "red";
                div_mensaje.innerHTML = "¡Tus credenciales son incorrectas!"
            });
        }
        else {
            div_errorIniciarSesion.textContent = "Hay errores en los campos";
            div_errorIniciarSesion.style.display = "block";
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