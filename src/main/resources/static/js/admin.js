// ==========================================
//  UTILERÍA: ALERTAS Y HELPERS 🔔
// ==========================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    Swal.fire({
        title: tipo === 'success' ? '¡Éxito!' : (tipo === 'error' ? 'Error' : 'Atención'),
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Entendido',
        backdrop: `rgba(0,0,0,0.8)`
    });
}

// FUNCIÓN GLOBAL (AHORA SÍ ACCESIBLE PARA TODOS)
function llenarSelect(id, datos, campoValor, campoTexto, textoDefault) {
    const sel = document.getElementById(id);
    if (!sel) return; // Protección por si no existe el elemento
    
    sel.innerHTML = `<option value="" selected disabled>${textoDefault}</option>`;
    datos.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d[campoValor];
        opt.textContent = d[campoTexto];
        sel.appendChild(opt);
    });
}

// ==========================================
//  INICIO Y SEGURIDAD
// ==========================================
const usuarioJson = localStorage.getItem('usuario');
if (!usuarioJson) {
    window.location.href = 'index.html';
    throw new Error("Sin sesión");
} 

const usuario = JSON.parse(usuarioJson);

if (usuario.idRol != 1 && usuario.idRol != 2) {
    window.location.href = 'cliente.html'; 
    throw new Error("Acceso denegado"); 
}

document.body.style.display = "block";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nombreUsuario').textContent = `${usuario.persona.nombre} ${usuario.persona.primerApellido}`.toUpperCase();
    document.getElementById('rolUsuario').textContent = usuario.idRol === 1 ? "Administrador" : "Staff";

    // Cargas iniciales
    cargarCitas();
    cargarCatalogos();
    cargarClientes();
    cargarEmpleados(); // <--- Aquí cargamos la pestaña de equipo
});

// ==========================================
//  TAB 1: AGENDA (CITAS)
// ==========================================
async function cargarCitas() {
    try {
        const respuesta = await fetch('/api/citas');
        const citas = await respuesta.json();
        const tbody = document.getElementById('tablaCitas');
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted"><h4>📭 Agenda vacía</h4></td></tr>`;
            return;
        }

        citas.forEach(cita => {
            let horarioTexto = `<span class="badge bg-secondary">Pendiente</span>`;
            if (cita.bloqueCita && cita.bloqueCita.fechaInicio) {
                const f = new Date(cita.bloqueCita.fechaInicio);
                const hora = f.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dia = f.toLocaleDateString([], {day: '2-digit', month: 'short'});
                horarioTexto = `<div class="text-end"><div class="text-white fw-bold">${dia}</div><div class="small text-warning">${hora}</div></div>`;
            }

            const folio = cita.idCita.toString().padStart(4, '0');
            const fila = `
                <tr>
                    <td class="ps-4 fw-bold text-muted">#${folio}</td>
                    <td>
                        <div class="fw-bold text-white">${cita.cliente.nombre} ${cita.cliente.primerApellido}</div>
                        <small class="text-muted">ID: ${cita.cliente.idPersona}</small>
                    </td>
                    <td>
                        <span class="badge rounded-0 p-2" style="background: #333; color: var(--barber-gold); border: 1px solid var(--barber-gold);">
                            ✂️ ${cita.servicio.nombre}
                        </span>
                    </td>
                    <td class="text-white-50 small">${cita.sucursal.nombre}</td>
                    <td class="text-white small">👤 ${cita.empleado.persona.nombre}</td>
                    <td class="text-end pe-4">${horarioTexto}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="confirmarCancelacion(${cita.idCita})">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
//  TAB 2: EQUIPO (EMPLEADOS) 👥
// ==========================================
async function cargarEmpleados() {
    try {
        // 1. Cargar lista de empleados
        const respuesta = await fetch('/api/empleados');
        const empleados = await respuesta.json();
        
        const contenedor = document.getElementById('contenedorEmpleados');
        contenedor.innerHTML = '';

        if (empleados.length === 0) {
            contenedor.innerHTML = '<div class="text-center text-muted w-100 py-5">No hay empleados registrados.</div>';
        } else {
            empleados.forEach(emp => {
                const card = `
                    <div class="col-md-4 col-lg-3">
                        <div class="card bg-dark border-secondary h-100 text-center p-3 service-card" style="cursor: default;">
                            <div class="mb-3">
                                <div class="d-inline-block p-3 rounded-circle bg-secondary text-white mb-2">
                                    <i class="bi bi-person-badge display-6"></i>
                                </div>
                                <h5 class="text-white mb-0">${emp.persona.nombre} ${emp.persona.primerApellido}</h5>
                                <small class="text-warning">ID: ${emp.idEmpleado}</small>
                            </div>
                            <div class="text-muted small mb-3">
                                <i class="bi bi-geo-alt me-1"></i> ${emp.sucursal.nombre}
                            </div>
                        </div>
                    </div>
                `;
                contenedor.innerHTML += card;
            });
        }

        // 2. Cargar Sucursales para el Modal de Contratar
        // (Aquí es donde tronaba antes porque no encontraba llenarSelect)
        const respSuc = await fetch('/api/sucursales');
        const sucursales = await respSuc.json();
        llenarSelect('empSucursal', sucursales, 'idSucursal', 'nombre', 'Selecciona Sucursal...');

    } catch (error) {
        console.error("Error cargando empleados:", error);
    }
}

async function guardarEmpleado() {
    const nombre = document.getElementById('empNombre').value;
    const apellido = document.getElementById('empApellido').value;
    const idSucursal = document.getElementById('empSucursal').value;
    const login = document.getElementById('empLogin').value;
    const password = document.getElementById('empPassword').value;

    if (!nombre || !apellido || !idSucursal || !login || !password) {
        mostrarNotificacion("Por favor llena todos los datos del empleado.", "warning");
        return;
    }

    const nuevoEmpleado = {
        nombre: nombre,
        primerApellido: apellido,
        segundoApellido: null,
        idSucursal: parseInt(idSucursal),
        login: login,
        password: password
    };

    try {
        const respuesta = await fetch('/api/empleados/nuevo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoEmpleado)
        });

        if (respuesta.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Contratado!',
                text: 'El nuevo barbero ha sido registrado.',
                background: '#1e1e1e', color: '#fff', confirmButtonColor: '#cda45e'
            }).then(() => {
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNuevoEmpleado'));
                modal.hide();
                cargarEmpleados(); // Recargar la lista
            });
        } else {
            const error = await respuesta.json();
            mostrarNotificacion(error.message || "Error al registrar.", "error");
        }
    } catch (e) {
        mostrarNotificacion("Error de conexión.", "error");
    }
}


// ==========================================
//  MODAL: AGENDAR CITA (Catálogos)
// ==========================================
async function cargarClientes() {
    try {
        const respuesta = await fetch('/api/personas'); 
        const personas = await respuesta.json();
        const select = document.getElementById('selectCliente');
        // Aquí usamos la función global
        select.innerHTML = '<option value="" selected disabled>Selecciona al Cliente...</option>';
        personas.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.idPersona;
            opt.textContent = `${p.nombre} ${p.primerApellido} (ID: ${p.idPersona})`;
            select.appendChild(opt);
        });
    } catch (error) { console.error(error); }
}

async function cargarCatalogos() {
    try {
        const respServicios = await fetch('/api/servicios');
        const servicios = await respServicios.json();
        const container = document.getElementById('containerServicios');
        container.innerHTML = '';

        servicios.forEach(serv => {
            let precioSimulado = 200; 
            if (serv.idServicio === 2) precioSimulado = 180;
            if (serv.idServicio === 3) precioSimulado = 350; 
            if (serv.idServicio === 4) precioSimulado = 600; 
            if (serv.idServicio === 5) precioSimulado = 250; 
            if (serv.idServicio === 6) precioSimulado = 150; 

            const col = document.createElement('div');
            col.className = 'col-md-6'; 
            col.innerHTML = `
                <div class="service-card" onclick="seleccionarServicio(this, ${serv.idServicio}, ${serv.duracion}, ${precioSimulado})">
                    <i class="bi bi-scissors service-icon-bg"></i>
                    <div class="service-header">
                        <div class="service-title">${serv.nombre}</div>
                        <div class="service-price">$${precioSimulado}</div>
                    </div>
                    <p class="service-desc">"${serv.descripcion || 'Servicio Profesional'}"</p>
                    <div class="mt-3 text-end"><span class="badge bg-dark border border-secondary text-white-50 rounded-pill fw-normal">⏱ ${serv.duracion} min</span></div>
                </div>`;
            container.appendChild(col);
        });

        const respSucursales = await fetch('/api/sucursales');
        const sucursales = await respSucursales.json();
        llenarSelect('selectSucursal', sucursales, 'idSucursal', 'nombre', '📍 Elige una Sucursal');

        const respEmpleados = await fetch('/api/empleados');
        const empleados = await respEmpleados.json();
        const selectEmp = document.getElementById('selectEmpleado');
        selectEmp.innerHTML = '<option value="" selected disabled>✂️ Primero elige sucursal...</option>';
        empleados.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.idEmpleado;
            option.textContent = `${emp.persona.nombre} - ${emp.sucursal.nombre}`;
            selectEmp.appendChild(option);
        });
    } catch (error) { console.error("Error catálogos:", error); }
}

// ... (El resto de la lógica de selección, cálculo de tiempo, guardarCita y cancelar es idéntica) ...
// (Pega aquí las funciones: seleccionarServicio, actualizarInfoTiempo, guardarCita, confirmarCancelacion, eliminarCita, cerrarSesion)

function seleccionarServicio(card, id, duracion, precio) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('inputServicioId').value = id;
    document.getElementById('inputServicioDuracion').value = duracion;
    document.getElementById('txtTotal').textContent = `$${precio.toFixed(2)}`;
    actualizarInfoTiempo();
}

document.getElementById('fechaInicio').addEventListener('change', actualizarInfoTiempo);

function actualizarInfoTiempo() {
    const inicioVal = document.getElementById('fechaInicio').value;
    const duracion = parseInt(document.getElementById('inputServicioDuracion').value);
    const txtHoraFin = document.getElementById('txtHoraFin');
    if (inicioVal && duracion) {
        const fechaInicio = new Date(inicioVal);
        const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
        txtHoraFin.textContent = `${fechaFin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hrs`;
        txtHoraFin.className = 'text-warning fw-bold';
    } else {
        txtHoraFin.textContent = "--:--";
    }
}

async function guardarCita() {
    const idClienteSeleccionado = document.getElementById('selectCliente').value;
    const idServicio = document.getElementById('inputServicioId').value;
    const duracion = parseInt(document.getElementById('inputServicioDuracion').value);
    const idSucursal = document.getElementById('selectSucursal').value;
    const idEmpleado = document.getElementById('selectEmpleado').value;
    const fechaInicioVal = document.getElementById('fechaInicio').value; 

    if (!idClienteSeleccionado || !idServicio || !idSucursal || !idEmpleado || !fechaInicioVal) {
        Swal.fire({icon: 'warning', title: 'Faltan datos', text: 'Completa todos los campos.'});
        return;
    }

    const fechaInicioObj = new Date(fechaInicioVal);
    const fechaFinObj = new Date(fechaInicioObj.getTime() + duracion * 60000);
    const toIsoString = (date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') + 'T' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':00';

    const nuevaCita = {
        idCliente: parseInt(idClienteSeleccionado),
        idServicio: parseInt(idServicio),
        idSucursal: parseInt(idSucursal),
        idEmpleado: parseInt(idEmpleado),
        fechaInicio: toIsoString(fechaInicioObj),
        fechaFin: toIsoString(fechaFinObj)
    };

    try {
        const respuesta = await fetch('/api/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCita)
        });

        if (respuesta.ok) {
            Swal.fire({icon: 'success', title: '¡Listo!', text: 'Cita agendada.'}).then(() => {
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNuevaCita'));
                modal.hide();
                cargarCitas();
            });
        } else {
            const error = await respuesta.json();
            Swal.fire({icon: 'error', title: 'Error', text: error.message || "Horario ocupado."});
        }
    } catch (e) {
        mostrarNotificacion("Error de conexión.", "error");
    }
}

function confirmarCancelacion(idCita) {
    Swal.fire({
        title: '¿Cancelar Cita?',
        text: "No podrás deshacer esto.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar',
        background: '#1e1e1e',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) eliminarCita(idCita);
    });
}

async function eliminarCita(id) {
    try {
        const respuesta = await fetch(`/api/citas/${id}`, { method: 'DELETE' });
        if (respuesta.ok) {
            mostrarNotificacion("Eliminado correctamente.", "success");
            cargarCitas();
        } else {
            mostrarNotificacion("No se pudo eliminar.", "error");
        }
    } catch (error) {
        mostrarNotificacion("Error de conexión.", "error");
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}