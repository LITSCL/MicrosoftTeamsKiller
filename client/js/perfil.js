$(document).ready(function() {
    $.validate({
        lang: "es"
    });

    $(document).tooltip(); //Esto permite que se muestre el "ToolTip" para cerrar sesión.
    var div_contenedor = document.getElementById("contenedor");
    var div_sesionNoValida = document.getElementsByClassName("sesion-no-valida")[0];
    var sesionAntigua;
    var sesionNueva;
    var salaRecienCreada;
    var salaRecienVinculada;
    
    if (localStorage.getItem("Usuario")) { //Evaluando si existe una sesión activa.
        div_contenedor.style.display = "grid";
    
        var usuario = JSON.parse(localStorage.getItem("Usuario"));
        var img_imagenUsuario = document.getElementById("imagenUsuario");
        var div_nombresYApellidos = document.getElementById("nombresYApellidos");
    
        img_imagenUsuario.setAttribute("src", "http://localhost:2900/api/usuario/get-file-imagen/" + usuario.usuarioObtenido.imagen);
        div_nombresYApellidos.append(
            usuario.usuarioObtenido.primerNombre
            + " " + usuario.usuarioObtenido.segundoNombre
            + " " + usuario.usuarioObtenido.apellidoPaterno
            + " " + usuario.usuarioObtenido.apellidoMaterno
        );
    
        i_salir = $("#salir");
    
        i_salir.click(function() {
            localStorage.removeItem("Usuario"); //Eliminando la sesión activa.
            window.location.href = "index.html";
        });
    
        var div_salas = document.getElementById("salas");
        var salas = usuario.usuarioObtenido.salas;
        for (var i = 0; i < salas.length; i++) {
    
            var sala = {
                id: salas[i]
            };
    
            fetch("http://localhost:2900/api/sala/get-sala", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(sala)
            })
            .then(function(response) {
                    return response.json();
            })
            .then(function(response) {
                var div = document.createElement("div");
                var imagen = document.createElement("img");
                var nombre = document.createElement("h3")
    
                div.setAttribute("id", response.salaObtenida._id);
                div.setAttribute("class", "sala");
                div.addEventListener("click", function() { //Aquí se le añade el evento click a todos los elementos.
                    localStorage.setItem("SalaSeleccionada", response.salaObtenida._id);
                    window.location.href = "sala.html";
                });
                
                var menuContextual = CtxMenu("#" + response.salaObtenida._id); //Aquí se le añade el menú al div de la sala.
                menuContextual.addItem("Obtener ID", obtenerIdSala, Icon = "img/clipboard.svg"); //Aquí se le añade un ítem al menú contextual de la sala. 
    
                function obtenerIdSala(elemento) { //NOTA: El elemento DOM que esta por parámetro es el que se le pasa a "CtxMenu()".
                    //Crea un campo de texto "oculto".
                    var aux = document.createElement("input");
    
                    //Asigna el contenido del elemento especificado al valor del campo.
                    aux.setAttribute("value", elemento.getAttribute("id"));
    
                    //Añade el campo a la página.
                    document.body.appendChild(aux);
    
                    //Selecciona el contenido del campo.
                    aux.select();
    
                    //Copia el texto seleccionado.
                    document.execCommand("copy");
    
                    //Elimina el campo de la página.
                    document.body.removeChild(aux);
                }
    
                imagen.src = "http://localhost:2900/api/sala/get-file-imagen/" + response.salaObtenida.imagen;
                nombre.append(response.salaObtenida.nombre);
    
                div.appendChild(imagen);
                div.appendChild(nombre);
                div_salas.appendChild(div);     
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    
        var div_crear = $("#crear");
        var div_ventanaCrearSala = $("#ventanaCrearSala");
        var img_botonCerrarCrear = $("#botonCerrarCrear");
        var button_crearSala = $("#crearSala");
    
        div_crear.click(function() {
            div_ventanaCrearSala.toggle("fade"); //Esto realiza un "display = block" con un efecto.
        });
    
        img_botonCerrarCrear.click(function() {
            div_ventanaCrearSala.css("display", "none");  
        });
    
        button_crearSala.click(function() {
            var input_nombreSala = document.getElementById("nombreSala");
            var archivo = document.getElementById("imagenSala");
            var div_errorCrearSala = document.getElementById("errorCrearSala");
            div_errorCrearSala.style.display = "none";
    
            const patronTexto = new RegExp('^[A-Z]+$', 'i');
            var errores = [];
    
            if (!patronTexto.test(input_nombreSala.value)) {
                errores.push("El nombre de la sala no es válido");
            }
    
            var rutaImagenSplit = archivo.value.split(".");
            formatoImagen = rutaImagenSplit[rutaImagenSplit.length - 1];
    
            if (formatoImagen == "png" || formatoImagen == "jpg" || formatoImagen == "jpeg" || formatoImagen == "gif") {
                
            }
            else {
                errores.push("El formato de la imagen no es válido");
            }
    
            if (errores.length == 0) {
                var sala = {
                    nombre: input_nombreSala.value,
                    imagen: "imagen.png",
                    creador: [usuario.usuarioObtenido._id]
                }
    
                fetch("http://localhost:2900/api/sala/save-sala", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(sala)
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    salaRecienCreada = response.salaGuardada._id;
    
                    var formData = new FormData();
                    formData.append("imagen", archivo.files[0]); //El servidor buscará la clave "imagen", obtendrá el valor (La imagen) y la guardará en la carpeta "imagenes".
                   
                    fetch("http://localhost:2900/api/sala/upload-file-imagen" + "/" + response.salaGuardada._id, {
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
    
                        fetch("http://localhost:2900/api/usuario/update-usuario-salas" + "/" + usuario.usuarioObtenido._id + "/" + response.salaActualizada._id, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(response) {
                            sesionAntigua = JSON.parse(localStorage.getItem("Usuario"));
                            sesionAntigua.usuarioObtenido.salas.push(salaRecienCreada);
    
                            sesionNueva = sesionAntigua;
    
                            localStorage.removeItem("Usuario");
    
                            localStorage.setItem("Usuario", JSON.stringify(sesionNueva));
                            
                            window.location.href = "perfil.html";                        
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
            }
            else {  
                div_errorCrearSala.textContent = "Hay errores en los campos";
                div_errorCrearSala.style.display = "block";
            }
        });
    
        var div_unirse = $("#unirse");
        var div_ventanaUnirseSala = $("#ventanaUnirseSala");
        var img_botonCerrarUnirse = $("#botonCerrarUnirse");
        var button_unirseSala = $("#unirseSala");
        var div_errorSala = document.getElementById("errorSala");
        div_errorSala.style.display = "none";
    
        div_unirse.click(function() {
            div_ventanaUnirseSala.toggle("fade"); //Esto realiza un "display = block" con un efecto.
        });
    
        img_botonCerrarUnirse.click(function() {
            div_ventanaUnirseSala.css("display", "none");  
            div_errorSala.style.display = "none";
        });
    
        button_unirseSala.click(function() {
            var input_idSala = document.getElementById("idSala");
            var div_errorUnirseSala = document.getElementById("errorUnirseSala");
            div_errorUnirseSala.style.display = "none";
    
            const patronIdSala = new RegExp('^[a-zA-Z0-9_]*$', 'i');
            var error = false;
    
            if (!patronIdSala.test(input_idSala.value)) {
                error = true;
            }
    
            if (error) {
                div_errorUnirseSala.textContent = "Hay errores en los campos";
                div_errorUnirseSala.style.display = "block";
            }
            else {
                //1. Verificar que la sala existe.
                var idSala = {
                    id: input_idSala.value
                }
    
                fetch("http://localhost:2900/api/sala/get-sala", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(idSala)
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    if (response.mensaje) { //Esto es necesario porque podría llegar un JSON llamado mensaje.
                        div_errorSala.innerHTML = "La sala que ingresaste no existe en el sistema";
                        div_errorSala.style.display = "block";
                    }
                    else {
                        var existe = false;
                        usuario.usuarioObtenido.salas.forEach(function(sala) { //En este bucle se verifica que la sesión no tenga la sala en el array.
                            if (sala == input_idSala.value) {
                                existe = true;
                            }
                        });
                        
                        if (existe) {
                            div_errorSala.innerHTML = "Ya perteneces a la sala que ingresaste";
                            div_errorSala.style.display = "block";
                        }
                        else {
                            if (response.salaObtenida._id == input_idSala.value) {
                                //2. A la sala agregarle el usuario.
                                fetch("http://localhost:2900/api/sala/update-sala-usuarios" + "/" + response.salaObtenida._id + "/" + usuario.usuarioObtenido._id, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                })
                                .then(function(response) {
                                    return response.json();
                                })
                                .then(function(response) {
                                    salaRecienVinculada = response.salaActualizada._id;
                                    //3. Al usuario agregarle la sala.
                                    fetch("http://localhost:2900/api/usuario/update-usuario-salas" + "/" + usuario.usuarioObtenido._id + "/" + response.salaActualizada._id, {
                                        method: "PUT",
                                        headers: {
                                        "Content-Type": "application/json"
                                        }
                                    })
                                    .then(function(response) {
                                        return response.json();
                                    })
                                    .then(function(response) {
                                        //4. Modificar la sesión del LocalStorage.
                                        sesionAntigua = JSON.parse(localStorage.getItem("Usuario"));
                                        sesionAntigua.usuarioObtenido.salas.push(salaRecienVinculada);
    
                                        sesionNueva = sesionAntigua;
    
                                        localStorage.removeItem("Usuario");
    
                                        localStorage.setItem("Usuario", JSON.stringify(sesionNueva));
                                    
                                        window.location.href = "perfil.html";
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                    });   
                                })
                                .catch(function(error) {
                                    console.log(error);
                                });   
                            }
                        } 
                    }
                })
                .catch(function(error) {
                    console.log(error);
                });
            }
        });
    }
    else {
        div_sesionNoValida.style.display = "block";
    } 
});