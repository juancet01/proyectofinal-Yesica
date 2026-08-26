// js.js
// Conecta el formulario con el servidor (server.js), que a su vez habla con MySQL.

var API_URL = '/api/contactos';

var form = document.querySelector('#Agenda form');
var inputNombre = document.getElementById('nombre');
var inputTelefono = document.getElementById('telefono');
var inputGmail = document.getElementById('gmail');
var btnAgregar = document.getElementById('agregar');
var btnCancelar = document.getElementById('cancelar');
var listaContactos = document.getElementById('listaContactos');

var idEditando = null; // null = creando uno nuevo, número = editando ese id

// --- Traer y mostrar todos los contactos guardados en MySQL ---
function cargarContactos() {
  fetch(API_URL)
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (contactos) {
      dibujarContactos(contactos);
    });
}

function dibujarContactos(contactos) {
  listaContactos.innerHTML = '';

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

// Cargar los contactos apenas se abre la página
document.addEventListener('DOMContentLoaded', cargarContactos);

// --- Crear o editar (según idEditando) ---
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

// --- Preparar el formulario para editar un contacto ---
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

// --- Eliminar un contacto ---
function eliminarContacto(id) {
  var confirmar = confirm('¿Seguro que querés eliminar este contacto?');
  if (!confirmar) return;

  fetch(API_URL + '/' + id, { method: 'DELETE' })
    .then(function () {
      cargarContactos();
    });
}

// --- Botón Cancelar ---
btnCancelar.addEventListener('click', function () {
  idEditando = null;
  btnAgregar.textContent = 'Agregar Contacto';
  form.reset();
});