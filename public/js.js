
const API_URL = '/api/contactos';

const form = document.querySelector('#Agenda form');
const inputNombre = document.getElementById('nombre');
const inputTelefono = document.getElementById('telefono');
const inputGmail = document.getElementById('gmail');
const btnAgregar = document.getElementById('agregar');
const btnCancelar = document.getElementById('cancelar');
const listaContactos = document.getElementById('listaContactos');
const contador = document.getElementById('contador');
const mensajeExito = document.getElementById('mensajeExito');
const mensajevacio = document.getElementById('mensajevacio');
const inputBuscar = document.getElementById('inputBuscar');

let todoslosContactos = [];
let idEditando = null;


// funciones


function cargarContactos() {
  fetch(API_URL)
    .then(respuesta => respuesta.json())
    .then(contactos => {
      console.log('Contactos cargados:', contactos); // <-- Agregado para depurar
      todoslosContactos = contactos;
      dibujarContactos(contactos);
    })
    .catch(error => console.error('Error al cargar:', error));
}

function dibujarContactos(contactos) {
  listaContactos.innerHTML = '';
  contador.textContent = 'Tenes ' + contactos.length + ' contactos';

  if (contactos.length === 0) {
    mensajevacio.classList.remove('oculto');
  } else {
    mensajevacio.classList.add('oculto');
  }

  for (let i = 0; i < contactos.length; i++) {
    const contacto = contactos[i];
    const tarjeta = document.createElement('div');
    tarjeta.className = 'contacto-card';
    tarjeta.innerHTML = `
      <p class="contacto-nombre">${contacto.nombre}</p>
      <p class="contacto-telefono">${contacto.telefono}</p>
      <p class="contacto-email">${contacto.gmail || ''}</p>
      <div class="contacto-acciones">
        <button onclick="editarContacto(${contacto.id})">Editar</button>
        <button onclick="eliminarContacto(${contacto.id})">Eliminar</button>
      </div>
    `;
    listaContactos.appendChild(tarjeta);
  }
}

function mostrarMensajeExito(texto) {
  mensajeExito.textContent = texto;
  mensajeExito.classList.remove('oculto');
  setTimeout(() => mensajeExito.classList.add('oculto'), 2000);
}


// crud


function editarContacto(id) {
  fetch(API_URL + '/' + id)
    .then(respuesta => respuesta.json())
    .then(contacto => {
      inputNombre.value = contacto.nombre;
      inputTelefono.value = contacto.telefono;
      inputGmail.value = contacto.gmail;
      idEditando = id;
      btnAgregar.textContent = 'Guardar cambios';
    })
    .catch(error => console.error('Error al obtener contacto:', error));
}

function eliminarContacto(id) {
  if (!confirm('¿Seguro que querés eliminar este contacto?')) return;

  fetch(API_URL + '/' + id, { method: 'DELETE' })
    .then(() => {
      cargarContactos();
      mostrarMensajeExito('Contacto eliminado');
    })
    .catch(error => console.error('Error al eliminar:', error));
}

// eventos


form.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const gmail = inputGmail.value.trim();

  if (!nombre || !telefono) {
    alert('Nombre y teléfono son obligatorios');
    return;
  }

  const datosContacto = { nombre, telefono, gmail };
  console.log('Enviando datos:', datosContacto); // 

  if (idEditando === null) {
    // CREAR
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosContacto)
    })
      .then(respuesta => {
        if (!respuesta.ok) {
          throw new Error('Error en la respuesta del servidor: ' + respuesta.status);
        }
        return respuesta.json();
      })
      .then(data => {
        console.log('Contacto creado:', data);
        form.reset();
        cargarContactos();
        mostrarMensajeExito('Contacto agregado');
      })
      .catch(error => console.error('Error al crear:', error));
  } else {
    // EDITAR
    fetch(API_URL + '/' + idEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosContacto)
    })
      .then(respuesta => {
        if (!respuesta.ok) {
          throw new Error('Error en la respuesta del servidor: ' + respuesta.status);
        }
        return respuesta.json();
      })
      .then(data => {
        console.log('Contacto actualizado:', data);
        idEditando = null;
        btnAgregar.textContent = 'Agregar Contacto';
        form.reset();
        cargarContactos();
        mostrarMensajeExito('Contacto actualizado');
      })
      .catch(error => console.error('Error al editar:', error));
  }
});

btnCancelar.addEventListener('click', function () {
  idEditando = null;
  btnAgregar.textContent = 'Agregar Contacto';
  form.reset();
});

inputBuscar.addEventListener('input', function () {
  const texto = inputBuscar.value.trim().toLowerCase();
  const filtrados = todoslosContactos.filter(contacto =>
    contacto.nombre.toLowerCase().includes(texto)
  );
  dibujarContactos(filtrados);
});


// INICIALIZAR
document.addEventListener('DOMContentLoaded', cargarContactos);