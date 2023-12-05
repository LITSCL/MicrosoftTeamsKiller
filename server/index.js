const socket = require('socket.io');

var app = require('./app.js');

var puerto = 2900;

//Iniciando el servidor.
var server = app.listen(puerto, function() {
    console.log(`Servidor levantado correctamente en el puerto ${puerto}`);
});

//Actualizando el servidor para aceptar websockets. 
var io = socket(server);

//Se ejecuta para cuando un cliente está conectado. 
io.on("connection", function(socket) {
    console.log("El usuario con ID: " + socket.id + " se ha conectado al socket");

    //Se activa cuando un compañero pulsa el botón para unirse a la sala.
    socket.on("usuario-conectado", function(idSala) {
        var salas = io.sockets.adapter.rooms;
        var sala = io.sockets.adapter.rooms.get(idSala); //Al principio no hay nadie en la sala, por lo tanto es "undefined". Como no hay nadie no se puede conseguir.
        socket.emit("enviar-socket-id", socket.id);

        if (sala == undefined) { //Se consulta si la sala no existe, se crea.
            socket.join(idSala); //Se agrega el usuario a la sala.
            socket.emit("sala-creada");
        }
        else if (sala.size == 1) { //Se consulta si la sala ya esta creada, si esta creada simplemente se agrega al usuario.
            socket.join(idSala); //Se agrega el usuario a la sala.
            socket.emit("usuario-ingresado");
            socket.emit("usuario-conectado", socket.id);
        }
        else {
            socket.emit("sala-llena");
        }    

        //Se ejecuta cuando es usuario se esta desconectado (Se ejecuta antes que el evento "disconnect"), es obligatorio que esté dentro del evento (connection).
        socket.on('disconnecting', function() { 
            let salasDelSocketArray = Array.from(socket.rooms); //Se obtienen todas los rooms a los cuales pertenece el socket (En este caso siempre pertenece a un solo room).
            let idSala = salasDelSocketArray[1];
            socket.broadcast.to(idSala).emit("salir", socket.id);
        }); 
    });

    //Se ejecuta cuando un usuario se conecta a la sala.
    socket.on("enviar-conectado", function(datos, idSala) {
        socket.broadcast.to(idSala).emit("recibir-conectado", datos); //Se le envía los datos a todos los demás, menos al que lo envió.
    });

    //Se ejecuta cuando se conecta un nuevo usuario (El último usuario en conectarse).
    socket.on("enviar-id-nuevo-conectado", function(datos, idSala) {
        socket.broadcast.to(idSala).emit("recibir-id-nuevo-conectado", datos);
    });

    //Se ejecuta cuando responden los peers con su imagen y nombre al último conectado.
    socket.on("enviar-imagen-y-nombre-al-nuevo-conectado", function(datos, idSocket) { 
        socket.to(idSocket).emit("recibir-imagen-y-nombre", datos);
    });

    //Se ejecuta cuando una persona conectada al socket envía un mensaje.
    socket.on("enviar-mensaje", function(datos, idSala) {
        socket.broadcast.to(idSala).emit("recibir-mensaje", datos); //Se le envía el mensaje a todos los demás, menos al que lo envió.
     });

    //Se Ejecuta cuando la persona que se unió a la sala y está listo para comunicarse. 
    socket.on("listo", function(idSala) {
        console.log("Listo");
        socket.broadcast.to(idSala).emit("listo");
    });

    //Se activa cuando el servidor obtiene un IceCandidate de un Peer en la sala. 
    socket.on("candidato", function(candidato, idSala) {
        console.log("Candidato");
        socket.broadcast.to(idSala).emit("candidato", candidato);
    });

    //Se activa cuando el servidor recibe una oferta de un Peer en la sala.
    socket.on("oferta", function(oferta, idSala) {
        console.log("Oferta");
        socket.broadcast.to(idSala).emit("oferta", oferta);
    });

    //Se activa cuando el servidor recibe una oferta de un Peer en la sala. 
    socket.on("respuesta", function(respuesta, idSala) {
        console.log("Respuesta");
        socket.broadcast.to(idSala).emit("respuesta", respuesta);
    });

    //Se activa cuando un usuario da click en el botón "Salir".
    socket.on("salir", function(idSala, idSocketDesconectado) {
        socket.leave(idSala);
        socket.broadcast.to(idSala).emit("salir", idSocketDesconectado);

    });

    socket.on("disconnect", function() {
        console.log("El usuario con ID: " + this.id + " se ha desconectado al socket");
    });
});
