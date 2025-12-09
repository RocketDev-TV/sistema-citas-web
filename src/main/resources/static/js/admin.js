// ==========================================
//  UTILERÍA: ALERTAS
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

// ==========================================
//  INICIO Y SEGURIDAD
// ==========================================
const usuarioJson = localStorage.getItem('usuario');
if (!usuarioJson) {
    window.location.href = 'index.html';
    throw new Error("Sin sesión");
} 

const usuario = JSON.parse(usuarioJson);

// Si no es Admin(1) ni Staff(2), va pa' fuera
if (usuario.idRol != 1 && usuario.idRol != 2) {
    window.location.href = 'cliente.html'; 
    throw new Error("Acceso denegado"); 
}

// Mostrar body
document.body.style.display = "block";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nombreUsuario').textContent = `${usuario.persona.nombre} ${usuario.persona.primerApellido}`.toUpperCase();
    document.getElementById('rolUsuario').textContent = usuario.idRol === 1 ? "Administrador" : "Staff";

    cargarCitas();
    cargarCatalogos();
    cargarClientes();
});

// ==========================================
//  CARGAR CITAS (CON BOTÓN BORRAR)
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
        mostrarNotificacion("Error al cargar citas", "error");
    }
}

// ... (Las funciones cargarClientes, cargarCatalogos, llenarSelect, seleccionarServicio, actualizarInfoTiempo y guardarCita SIGUEN IGUAL que antes, no las borres) ...
// (Pega aquí el bloque de esas funciones que ya tenías)

// ==========================================
//  LÓGICA DE CANCELACIÓN (NUEVO)
// ==========================================
function confirmarCancelacion(idCita) {
    Swal.fire({
        title: '¿Cancelar Cita?',
        text: "Esta acción liberará el horario.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        background: '#1e1e1e', 
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarCita(idCita);
        }
    });
}

async function eliminarCita(id) {
    try {
        const respuesta = await fetch(`/api/citas/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            mostrarNotificacion("Cita cancelada correctamente.", "success");
            cargarCitas(); // Recargar tabla
        } else {
            mostrarNotificacion("No se pudo cancelar la cita.", "error");
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion("Error de conexión.", "error");
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}