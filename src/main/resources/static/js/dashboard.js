// Lógica del Dashboard

// 1. SEGURIDAD: Verificar sesión al inicio
const usuarioJson = localStorage.getItem('usuario');
if (!usuarioJson) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioJson);
    const nombreElement = document.getElementById('nombreUsuario');
    if (nombreElement) {
        nombreElement.textContent = `${usuario.persona.nombre} ${usuario.persona.primerApellido}`.toUpperCase();
    }
    
    // Si estamos logueados, cargamos las citas
    cargarCitas();
}

// 2. LÓGICA DE CARGA
async function cargarCitas() {
    try {
        const respuesta = await fetch('/api/citas');
        if (!respuesta.ok) throw new Error('Error al obtener citas');
        
        const citas = await respuesta.json();
        const tbody = document.getElementById('tablaCitas');
        
        if (!tbody) return; // Protección por si no existe la tabla
        
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" class="text-center py-5 text-muted">
                    <h4>📭 Agenda vacía</h4>
                    <p>No hay cortes programados.</p>
                </td></tr>`;
            return;
        }

        citas.forEach(cita => {
            // Aquí podrías procesar la fecha real si viene del backend
            let horarioTexto = `<div class="small" style="color: var(--barber-gold);">10:00 - 10:30 hrs</div>`;

            // Formatear IDs para que se vean cool (ej. #0003)
            const folio = cita.idCita.toString().padStart(4, '0');

            const fila = `
                <tr>
                    <td class="ps-4 fw-bold text-muted">#${folio}</td>
                    <td>
                        <div class="fw-bold text-white">${cita.cliente.nombre} ${cita.cliente.primerApellido}</div>
                        <small class="text-muted">ID Cliente: ${cita.cliente.idPersona}</small>
                    </td>
                    <td>
                        <span class="badge rounded-0 p-2" style="background: #333; color: var(--barber-gold); border: 1px solid var(--barber-gold);">
                            ✂️ ${cita.servicio.nombre}
                        </span>
                    </td>
                    <td class="text-white-50 small">${cita.sucursal.nombre}</td>
                    <td class="text-white small">
                        👤 ${cita.empleado.persona.nombre}
                    </td>
                    <td class="text-end pe-4">
                        <span class="text-white fw-bold">Hoy</span>
                        ${horarioTexto}
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    } catch (error) {
        console.error(error);
        const tbody = document.getElementById('tablaCitas');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger fw-bold">Error al sincronizar con el servidor 💀</td></tr>`;
        }
    }
}

// Función global para el botón de cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}