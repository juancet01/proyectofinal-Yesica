// js.js
// Conecta el formulario con el servidor (server.js), que a su vez habla con MySQL.

const API_URL = '/api/contactos';

const form = document.querySelector('#Agenda form');
const inputNombre = document.getElementById('nombre');
const inputTelefono = document.getElementById('telefono');
const inputGmail = document.getElementById('gmail');
const btnAgregar = document.getElementById('agregar');
const btnCancelar = document.getElementById('cancelar');
const listaContactos = document.getElementById('listaContactos');

let idEditando = null; // null = creando uno nuevo, número = editando ese id

// --- Traer y mostrar todos los contactos guardados en MySQL ---
async function cargarContactos() {
  const respuesta = await fetch(API_URL);
  const contactos = await respuesta.json();

  listaContactos.innerHTML = '';

  contactos.forEach(contacto => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'contacto-card';

    tarjeta.innerHTML = `
      <p class="contacto-nombre">${contacto.nombre}</p>
      <p class="contacto-telefono">${contacto.telefono}</p>
      <p class="contacto-email">${contacto.gmail || ''}</p>
      <div class="contacto-acciones">
        <button class="btn-editar" onclick="editarContacto(${contacto.id})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarContacto(${contacto.id})">Eliminar</button>
      </div>
    `;

    listaContactos.appendChild(tarjeta);
  });
}

// Cargar los contactos apenas se abre la página
document.addEventListener('DOMContentLoaded', cargarContactos);

// --- Crear o editar (según idEditando) ---
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const gmail = inputGmail.value.trim();

  if (!nombre || !telefono) {
    alert('Nombre y teléfono son obligatorios');
    return;
  }

  if (idEditando === null) {
    // CREAR
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, gmail })
    });
  } else {
    // EDITAR
    await fetch(`${API_URL}/${idEditando}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, gmail })
    });
    idEditando = null;
    btnAgregar.textContent = 'Agregar Contacto';
  }

  form.reset();
  cargarContactos();
});

// --- Preparar el formulario para editar un contacto ---
async function editarContacto(id) {
  const respuesta = await fetch(`${API_URL}/${id}`);
  const contacto = await respuesta.json();

  inputNombre.value = contacto.nombre;
  inputTelefono.value = contacto.telefono;
  inputGmail.value = contacto.gmail;

  idEditando = id;
  btnAgregar.textContent = 'Guardar cambios';
}

// --- Eliminar un contacto ---
async function eliminarContacto(id) {
  const confirmar = confirm('¿Seguro que querés eliminar este contacto?');
  if (!confirmar) return;

  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  cargarContactos();
}

// --- Botón Cancelar ---
btnCancelar.addEventListener('click', () => {
  idEditando = null;
  btnAgregar.textContent = 'Agregar Contacto';
  form.reset();
});