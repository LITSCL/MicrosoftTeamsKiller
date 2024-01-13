$(document).ready(function() {
    var div_sesionNoValida = document.getElementsByClassName("sesion-no-valida")[0];
    var div_contenedor = document.getElementById("contenedor");
    
    if (localStorage.getItem("Usuario")) { //Evaluando si existe una sesión activa.
        var socket = io.connect("", {"forceNew": true});
    
        socket.on("connect", function() {
            const idSocketLocal = socket.id;
    
            div_contenedor.style.display = "block";
    
            var video_videoLocal = document.getElementById("videoLocal");
            var video_videoPeer = document.getElementById("videoPeer");
    
            var div_menuBoton = document.getElementById("menuBoton");
            var button_botonMicrofono = document.getElementById("botonMicrofono");
            var button_botonCamara = document.getElementById("botonCamara");
            var button_botonSalir = document.getElementById("botonSalir");
            var i_microfono = document.getElementById("microfono");
            var i_camara = document.getElementById("camara");
            var i_salir = document.getElementById("salir");
    
            var microfonoApagado = false;
            var camaraApagada = false;
            var idSala = localStorage.getItem("SalaSeleccionada");
            var creador = false;
            var rtcPeerConnection;
            var streamUsuario;
    
            if (idSala == null) {
                window.location.href = "perfil.html";
            }
            else {
                //Contiene la URL del servidor de aturdimiento que se usará mas adelante. 
                var iceServers = {
                    iceServers: [
                        {urls: "stun:stun.services.mozilla.com"},
                        {urls: "stun:stun.l.google.com:19302"},
                    ]
                };
    
                socket.emit("usuario-conectado", idSala);
    
                //Se ejecuta cuando se crea una sala con éxito. 
                socket.on("sala-creada", function() {
                    creador = true;

                    console.log("Eres el creador de la sala: " + idSocketLocal);
    
                    navigator.mediaDevices.getUserMedia({
                        audio: true, 
                        video: {width: 500, height: 280},
                    })
                    .then(function(stream) {
                        div_menuBoton.style.setProperty("display", "block");
                        streamUsuario = stream; 
                        video_videoLocal.srcObject = stream;
                        video_videoLocal.onloadedmetadata = function(e) {
                        video_videoLocal.play();
                        }
                    })
                    .catch(function(error) {
                        alert("Error al acceder al hardware");
                        console.log(error);
                        window.location.href = "perfil.html";
                    });
                });
    
                //Se ejecuta cuando un Peer se une correctamente a la sala. 
                socket.on("usuario-ingresado", function() {
                    creador = false;

                    console.log("Eres el segundo conectado de la sala: " + idSocketLocal);
                    
                    navigator.mediaDevices.getUserMedia({
                        audio: true, 
                        video: {width: 500, height: 280},
                    })
                    .then(function(stream) {
                        div_menuBoton.style.setProperty("display", "block");
                        streamUsuario = stream; 
                        video_videoLocal.srcObject = stream;
                        video_videoLocal.onloadedmetadata = function(e) {
                            video_videoLocal.play();
                        }
                        socket.emit("listo", idSala);
                    })
                    .catch(function(error) {
                        alert("Error al acceder al hardware");
                        console.log(error);
                        window.location.href = "perfil.html";
                    });
                });
    
                //Se ejecuta cuando una sala está llena (Es decir, tiene 2 personas). 
                socket.on("sala-llena", function() {
                    alert("La sala esta llena, no puedes entrar");
                });
    
                //Se ejecuta cuando un Peer se ha unido a la sala y está listo para comunicarse. 
                socket.on("listo", function() {
                    if (creador == true) {
                        console.log("Ofertando...");
                        rtcPeerConnection = new RTCPeerConnection(iceServers); //La interfaz RTCPeerConnection, representa la conexión entre el usuario remoto (Necesitamos entregarle el servidor de hielo del otro usuario).
                        rtcPeerConnection.onicecandidate = onIceCandidate;
                        rtcPeerConnection.ontrack = onTrack;
                        rtcPeerConnection.addTrack(streamUsuario.getTracks()[0], streamUsuario); //Esta instrucción representa la pista de audio.
                        rtcPeerConnection.addTrack(streamUsuario.getTracks()[1], streamUsuario); //Esta instrucción representa la pista de video.
                        rtcPeerConnection.createOffer(function(oferta) {
                            rtcPeerConnection.setLocalDescription(oferta);
                            socket.emit("oferta", oferta, idSala);
                        }, function(error) {
                            console.log(error);
                        });
                    }
                });
    
                //Se ejecuta al recibir un IceCandidate de un Peer. 
                socket.on("candidato", function(candidato) {
                    let iceCandidate = new RTCIceCandidate(candidato);
                    rtcPeerConnection.addIceCandidate(iceCandidate);
                });
    
                //Se ejecuta al recibir una oferta de la persona que creó la sala. 
                socket.on("oferta", function(oferta) {
                    if (creador == false) {
                        console.log("Respondiendo...");
                        rtcPeerConnection = new RTCPeerConnection(iceServers);
                        rtcPeerConnection.onicecandidate = onIceCandidate;
                        rtcPeerConnection.ontrack = onTrack;
                        rtcPeerConnection.addTrack(streamUsuario.getTracks()[0], streamUsuario); //Esta instrucción representa la pista de audio.
                        rtcPeerConnection.addTrack(streamUsuario.getTracks()[1], streamUsuario); //Esta instrucción representa la pista de video.
                        rtcPeerConnection.setRemoteDescription(oferta);
                        rtcPeerConnection.createAnswer(function(respuesta) {
                            rtcPeerConnection.setLocalDescription(respuesta);
                            socket.emit("respuesta", respuesta, idSala);
                        }, function(error) {
                            console.log(error);
                        });
                    }
                });
    
                //Se activa al recibir una respuesta del usuario que se unió a la sala. 
                socket.on("respuesta", function(respuesta) {
                    rtcPeerConnection.setRemoteDescription(respuesta);
                });
    
                //Implementación de OnIceCandidateFunction, que es parte de la interfaz RTCPeerConnection. 
                function onIceCandidate(evento) {
                    if (evento.candidate) {
                        socket.emit("candidato", evento.candidate, idSala);
                    }
                }
    
                //Implementación de OnTrackFunction, que es parte de la interfaz RTCPeerConnection. 
                function onTrack(evento) {
                    video_videoPeer.style.setProperty("display", "block"); //Aquí se debe hacer visible el contenedor del Peer que se acaba de conectar (En caso de que no sea visible por que se conecta por segunda vez).
                    video_videoPeer.srcObject = evento.streams[0];
                    video_videoPeer.onloadedmetadata = function(e) {
                        video_videoPeer.play();
                    }
                }
    
                button_botonMicrofono.addEventListener("click", function() {
                    microfonoApagado = !microfonoApagado;
                    if (microfonoApagado) {
                        streamUsuario.getTracks()[0].enabled = false; //Desactivando audio.
                        i_microfono.setAttribute("class", "fas fa-microphone-slash");
                    }
                    else {
                        streamUsuario.getTracks()[0].enabled = true;
                        i_microfono.setAttribute("class", "fas fa-microphone");
                    }
                });
    
                button_botonCamara.addEventListener("click", function() {
                    camaraApagada = !camaraApagada;
                    if (camaraApagada) {
                        streamUsuario.getTracks()[1].enabled = false; //Desactivando video.
                        i_camara.setAttribute("class", "fas fa-video-slash");
                    }
                    else {
                        streamUsuario.getTracks()[1].enabled = true;
                        i_camara.setAttribute("class", "fas fa-video");
                    }
                });
    
                button_botonSalir.addEventListener("click", function() {
                    socket.emit("salir", idSala, idSocketLocal);
                    localStorage.removeItem("SalaSeleccionada");
                    window.location.href = "perfil.html";
                    
                    if (video_videoLocal.srcObject) {
                        video_videoLocal.srcObject.getTracks()[0].stop(); //Aquí se deja de recibir la pista de audio del usuario.
                        video_videoLocal.srcObject.getTracks()[1].stop(); //Aquí se deja de recibir la pista de video del usuario.
                    }
    
                    if (video_videoPeer.srcObject) {
                        video_videoPeer.srcObject.getTracks()[0].stop(); //Aquí se deja de recibir la pista de audio del Peer.
                        video_videoPeer.srcObject.getTracks()[1].stop(); //Aquí se deja de recibir la pista de video del Peer.
                    }
    
                    //Comprueba si hay un Peer en el otro lado y cierra de forma segura la conexión existente establecida con el Peer. 
                    if (rtcPeerConnection) {
                        rtcPeerConnection.onTrack = null;
                        rtcPeerConnection.onicecandidate = null;
                        rtcPeerConnection.close();
                        rtcPeerConnection = null;
                    }
                });
    
                //Se ejecuta cuando el otro Peer de la sala ha abandonado la sala. 
                socket.on("salir", function(datos) { //Aquí llega el ID del desconectado.
                    let idDesconectado = datos;
    
                    video_videoPeer.style.setProperty("display", "none");
                    document.getElementById(idDesconectado).style.setProperty("display", "none");
    
                    creador = true; //Este usuario ahora es creador porque es el único en la sala.
                    
                    //Cierra de forma segura la conexión existente establecida con el Peer que se fue. 
                    if (rtcPeerConnection) {
                        rtcPeerConnection.onTrack = null;
                        rtcPeerConnection.onicecandidate = null;
                        rtcPeerConnection.close();
                        rtcPeerConnection = null;
                    }
    
                    if (video_videoPeer.srcObject) {
                        video_videoPeer.srcObject.getTracks()[0].stop();
                        video_videoPeer.srcObject.getTracks()[1].stop();
                    }
                });
    
                var usuarioLocalStorage = localStorage.getItem("Usuario");
                var usuarioJSON = JSON.parse(usuarioLocalStorage);
                var usuario = usuarioJSON.usuarioObtenido;
    
                var nombreCompletoUsuario = usuario.primerNombre + " " + usuario.segundoNombre + " " + usuario.apellidoPaterno + " " + usuario.apellidoMaterno;
                var urlImagenUsuario = "http://localhost:2900/api/usuario/get-file-imagen/" + usuario.imagen;
    
                //Todo el código de acá abajo corresponde a los conectados.
                crearConectado(urlImagenUsuario, nombreCompletoUsuario, "Local"); //1. Aquí se crea el conectado con los datos propios y de forma local.
    
                socket.on("usuario-conectado", function(datos) { //2. Aquí se recibe el ID del socket del último conectado (Solo lo recibe el último conectado).
                    socket.emit("enviar-conectado", { //3. Aquí se envian los datos del último conectado a todos los miembros de la sala.
                        imagen: urlImagenUsuario,
                        nombre: nombreCompletoUsuario,
                        idSocket: datos
                    }, idSala);
                    socket.emit("enviar-id-nuevo-conectado", datos, idSala); //4. Aquí se envía el ID del socket del último conectado (Necesario para que todos los peers les respondan con sus datos solamente al último conectado).
                });
    
                socket.on("recibir-conectado", function(datos) { //5. Aquí todos los demás Peers reciben los datos del último conectado.
                    crearConectado(datos.imagen, datos.nombre, datos.idSocket);
                });
    
                socket.on("recibir-id-nuevo-conectado", function(datos) { //6. Aquí se recibe el ID del socket del último conectado (Lo reciben todos menos el último conectado). Esto es necesario para que todos les envién sus datos solamente al último conectado.
                    socket.emit("enviar-imagen-y-nombre-al-nuevo-conectado", {
                        imagen: urlImagenUsuario,
                        nombre: nombreCompletoUsuario,
                        idSocket: idSocketLocal
                    }, datos);
                });
    
                socket.on("recibir-imagen-y-nombre", function(datos) {
                    crearConectado(datos.imagen, datos.nombre, datos.idSocket);
                });
    
                //Todo el código de acá abajo corresponde al chat.
                var textarea_mensaje = document.getElementById("mensaje");
                var button_enviarMensaje = document.getElementById("enviarMensaje");
                
                //Listener para enviar mensaje mediante tecla "Enter".
                textarea_mensaje.addEventListener("keyup", function(e) { 
                    var codigoTecla = e.keyCode || e.which; 
                    if (codigoTecla == 13) { 
                        var mensajeEscrito = textarea_mensaje.value;
    
                        crearMensaje(urlImagenUsuario, nombreCompletoUsuario, mensajeEscrito);
        
                        socket.emit("enviar-mensaje", {
                            imagen: urlImagenUsuario,
                            nombre: nombreCompletoUsuario,
                            mensaje: mensajeEscrito
                        }, idSala);
                        textarea_mensaje.value = ""; //Aquí se limpia el TextArea cuando se envía un mensaje.
                    }
                });

                //Listener para enviar mensaje mediante el botón.
                button_enviarMensaje.addEventListener("click", function() {
                    var mensajeEscrito = textarea_mensaje.value;
    
                    crearMensaje(urlImagenUsuario, nombreCompletoUsuario, mensajeEscrito);
    
                    socket.emit("enviar-mensaje", {
                        imagen: urlImagenUsuario,
                        nombre: nombreCompletoUsuario,
                        mensaje: mensajeEscrito
                    }, idSala);
                    textarea_mensaje.value = ""; //Aquí se limpia el TextArea cuando se envía un mensaje.
                });
    
                socket.on("recibir-mensaje", function(datos) {
                    crearMensaje(datos.imagen, datos.nombre, datos.mensaje);
                });
            }
        });
    }
    else {
        div_sesionNoValida.style.display = "block";
    }
    
    function crearConectado(urlImagenUsuario, nombreCompletoUsuario, idSocket) {
        var div_conectados = document.getElementById("usuariosConectados");

        var div_usuarioConectado = document.createElement("div");
        var img_usuarioConectado = document.createElement("img");
        var strong_nombreCompletoUsuarioConectado = document.createElement("strong");

        div_usuarioConectado.setAttribute("id", idSocket);
        img_usuarioConectado.setAttribute("src", urlImagenUsuario);
        strong_nombreCompletoUsuarioConectado.innerHTML = nombreCompletoUsuario;

        div_conectados.appendChild(div_usuarioConectado);
        div_usuarioConectado.appendChild(img_usuarioConectado);
        div_usuarioConectado.appendChild(strong_nombreCompletoUsuarioConectado);
    }

    function crearMensaje(urlImagenUsuario, nombreCompletoUsuario, mensajeEscrito) {
        var div_mensajes = document.getElementById("mensajes");

        var div_mensajeEscrito = document.createElement("div");
        var div_imagenUsuario = document.createElement("div");
        var img_imagenUsuario = document.createElement("img");
        var div_nombreUsuario = document.createElement("div");
        var strong_nombreUsuario = document.createElement("strong");
        var div_clearfix = document.createElement("div");
        var div_contenidoMensaje = document.createElement("div");

        div_mensajeEscrito.setAttribute("class", "mensaje-escrito");
        div_imagenUsuario.setAttribute("class", "imagen-usuario");
        img_imagenUsuario.setAttribute("src", urlImagenUsuario);
        div_nombreUsuario.setAttribute("class", "nombre-usuario");
        strong_nombreUsuario.innerHTML = nombreCompletoUsuario;
        div_clearfix.setAttribute("class", "clearfix");
        div_contenidoMensaje.setAttribute("class", "contenido-mensaje");

        div_mensajes.appendChild(div_mensajeEscrito);
        div_mensajeEscrito.appendChild(div_imagenUsuario);
        div_imagenUsuario.appendChild(img_imagenUsuario);
        div_mensajeEscrito.appendChild(div_nombreUsuario);
        div_nombreUsuario.appendChild(strong_nombreUsuario);
        div_mensajeEscrito.appendChild(div_clearfix);
        div_mensajeEscrito.appendChild(div_contenidoMensaje);

        //Verificando si el mensaje es un link.
        if (mensajeEscrito.includes("https://")) {
            mensajeEscrito = "<a href=" + mensajeEscrito + ">" + mensajeEscrito + "</a>"
        }
        
        //Verificando si el mensaje es un link.
        if (mensajeEscrito.includes("http://")) {
            mensajeEscrito = "<a href=" + mensajeEscrito + ">" + mensajeEscrito + "</a>"
        }

        div_contenidoMensaje.innerHTML = mensajeEscrito; 

        div_mensajes.scrollTop = document.getElementById("mensajes").scrollHeight; //Esta instrucción permite que el foco del chat siempre se quede abajo.
    }
});