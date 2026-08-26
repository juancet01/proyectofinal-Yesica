
var API_URL = '/api/contactos';

var form = document.querySelector('#Agenda form');
var inputNombre = document.getElementById('nombre');
var inputTelefono = document.getElementById('telefono');
var inputGmail = document.getElementById('gmail');
var btnAgregar = document.getElementById('agregar');
var btnCancelar = document.getElementById('cancelar');
var listaContactos = document.getElementById('listaContactos');
var contador = document.getElementById('contador');
var mensajeExito= document.getElementById('mensajeExito');
var mensajevacio = document.getElementById('mensajevacio');
var inputBuscar = document.getElementById('inputBuscar');
var todoslosContactos=[];
var idEditando = null; 

function cargarContactos() {
  fetch(API_URL)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (contactos) {
      todoslosContactos = contactos;
      dibujarContactos(contactos);
    });
}

function dibujarContactos(contactos) {
  listaContactos.innerHTML = '';
  contador.textContent ='tenes ' + contactos.length + ' contactos';
  if (contactos.length ===0){
    mensajevacio.classList.remove('oculto');
  }else{
    mensajevacio.classList.add('oculto');
  }

  for (var i = 0; i < contactos.length; i++) {
    var contacto = contactos[i];

    var tarjeta = document.createElement('div');
    tarjeta.className = 'contacto-card';

    tarjeta.innerHTML =
      '<p class="contacto-nombre">' + contacto.nombre + '</p>' +
      '<p class="contacto-telefono">' + contacto.telefono + '</p>' +
      '<p class="contacto-email">' + (contacto.gmail || '') + '</p>' +
      '<div class="contacto-acciones">' +
        '<button class="btn-editar" onclick="editarContacto(' + contacto.id + ')">Editar</button>' +
        '<button class="btn-eliminar" onclick="eliminarContacto(' + contacto.id + ')">Eliminar</button>' +
      '</div>';

    listaContactos.appendChild(tarjeta);
  }
}

function mostrarMensajeExito(texto) {
  mensajeExito.textContent = texto;
  mensajeExito.classList.remove('oculto');
  setTimeout(function () {
    mensajeExito.classList.add('oculto');
  }, 2000);
}

document.addEventListener('DOMContentLoaded', cargarContactos);

//crear o editar (idEditand
form.addEventListener('submit', function (evento) {
  evento.preventDefault();

  var nombre = inputNombre.value.trim();
  var telefono = inputTelefono.value.trim();
  var gmail = inputGmail.value.trim();

  if (!nombre || !telefono) {
    alert('Nombre y teléfono son obligatorios');
    return;
  }

  var datosContacto = {
    nombre: nombre,
    telefono: telefono,
    gmail: gmail
  };

  if (idEditando === null) {
    // CREAR
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosContacto)
    }).then(function () {
      form.reset();
      cargarContactos();
    });

  } else {
    // EDITAR
    fetch(API_URL + '/' + idEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosContacto)
    }).then(function () {
      idEditando = null;
      btnAgregar.textContent = 'Agregar Contacto';
      form.reset();
      cargarContactos();
    });
  }
});

function editarContacto(id) {
  fetch(API_URL + '/' + id)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (contacto) {
      inputNombre.value = contacto.nombre;
      inputTelefono.value = contacto.telefono;
      inputGmail.value = contacto.gmail;

      idEditando = id;
      btnAgregar.textContent = 'Guardar cambios';
    });
}


function eliminarContacto(id) {
  var confirmar = confirm('¿Seguro que querés eliminar este contacto?');
  if (!confirmar) return;

  fetch(API_URL + '/' + id, { method: 'DELETE' })
    .then(function () {
      cargarContactos();
    });
}


btnCancelar.addEventListener('click', function () {
  idEditando = null;
  btnAgregar.textContent = 'Agregar Contacto';
  form.reset();
});
inputBuscar.addEventListener('input', function () {
  var texto = inputBuscar.value.trim().toLowerCase();
  var  filtrados = todoslosContactos.filter(function (contacto) {
    return contacto.nombre.toLowerCase().includes(texto);
  });
  dibujarContactos(filtrados);
});