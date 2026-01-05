// ==========================================
//  AGENDA Y CITAS
// ==========================================

async function cargarCitas() {
    const tbody = document.getElementById('tablaCitas');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Cargando...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/citas`);
        const citas = await res.json();
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted"><h4>📭 Agenda vacía</h4></td></tr>';
            return;
        }

        citas.forEach(c => {
            let horario = '<span class="badge bg-secondary">Pendiente</span>';
            if (c.bloqueCita?.fechaInicio) {
                const f = new Date(c.bloqueCita.fechaInicio);
                horario = `<div class="text-end">
                    <div class="text-white fw-bold">${f.toLocaleDateString([], {day:'2-digit', month:'short'})}</div>
                    <div class="small text-warning">${f.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>`;
            }
            
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-muted">#${c.idCita.toString().padStart(4,'0')}</td>
                    <td>
                        <div class="fw-bold text-white">${c.cliente.nombre} ${c.cliente.primerApellido}</div>
                        <small class="text-muted">ID: ${c.cliente.idPersona}</small>
                    </td>
                    <td><span class="badge rounded-0 p-2" style="border:1px solid gold; color:gold">✂️ ${c.servicio.nombre}</span></td>
                    <td class="text-white-50 small">${c.sucursal.nombre}</td>
                    <td class="text-white small">👤 ${c.empleado.persona.nombre}</td>
                    <td class="text-end pe-4">${horario}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="confirmarCancelacion(${c.idCita})"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

async function guardarCita() {
    const payload = {
        idCliente: parseInt(document.getElementById('selectCliente').value),
        idServicio: parseInt(document.getElementById('inputServicioId').value),
        idSucursal: parseInt(document.getElementById('selectSucursal').value),
        idEmpleado: parseInt(document.getElementById('selectEmpleado').value),
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFin: null 
    };

    // Calculo fecha fin
    if(payload.fechaInicio) {
        const dur = parseInt(document.getElementById('inputServicioDuracion').value) || 30;
        const d = new Date(payload.fechaInicio);
        const fin = new Date(d.getTime() + dur * 60000);
        const offset = fin.getTimezoneOffset() * 60000;
        payload.fechaFin = new Date(fin.getTime() - offset).toISOString().slice(0, 19);
    }

    if (!payload.idCliente || !payload.idServicio || !payload.idSucursal || !payload.idEmpleado || !payload.fechaInicio) {
        return Swal.fire('Faltan datos', 'Verifica el formulario', 'warning');
    }

    try {
        const res = await fetch(`${API_URL}/citas`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        if (res.ok) {
            Swal.fire('¡Agendada!', '', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalNuevaCita')).hide();
            cargarCitas();
        } else {
            const err = await res.json();
            Swal.fire('Atención', err.message || 'Horario no disponible', 'warning');
        }
    } catch (e) { Swal.fire('Error', 'Fallo de conexión', 'error'); }
}

function confirmarCancelacion(id) {
    Swal.fire({
        title: '¿Cancelar Cita?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, cancelar', background: '#1e1e1e', color: '#fff'
    }).then(async (r) => {
        if (r.isConfirmed) {
            await fetch(`${API_URL}/citas/${id}`, { method: 'DELETE' });
            cargarCitas();
            Swal.fire('Cancelada', '', 'success');
        }
    });
}