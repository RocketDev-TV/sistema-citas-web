// ==========================================
//  GESTIÓN DE CLIENTES
// ==========================================

async function cargarClientes() {
    // Select para agendar
    try {
        const res = await fetch(`${API_URL}/usuarios/clientes`);
        const clientes = await res.json();
        const sel = document.getElementById('selectCliente');
        if (sel) {
            sel.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
            clientes.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.persona.idPersona;
                opt.textContent = `${u.persona.nombre} ${u.persona.primerApellido}`;
                sel.appendChild(opt);
            });
        }
    } catch (e) { console.error(e); }
}

async function cargarGestionClientes() {
    const tbody = document.getElementById('tablaClientesAdmin');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Cargando...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/usuarios/clientes`);
        const clientes = await res.json();
        tbody.innerHTML = '';
        
        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Sin clientes</td></tr>'; return;
        }

        clientes.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 text-muted small">#${c.idUsuario}</td>
                    <td>
                        <div class="fw-bold text-white">${c.persona.nombre} ${c.persona.primerApellido}</div>
                        <small class="text-muted">ID: ${c.persona.idPersona}</small>
                    </td>
                    <td class="text-gold font-monospace">${c.login}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-light me-2 border-0" onclick="prepararModalCliente('${encodeURIComponent(JSON.stringify(c))}')"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="confirmarBanearCliente(${c.idUsuario})"><i class="bi bi-person-x-fill"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

function prepararModalCliente(encoded) {
    const c = JSON.parse(decodeURIComponent(encoded));
    document.getElementById('cliId').value = c.idUsuario;
    document.getElementById('cliNombre').value = c.persona.nombre;
    document.getElementById('cliPrimerApellido').value = c.persona.primerApellido;
    document.getElementById('cliSegundoApellido').value = c.persona.segundoApellido || '';
    document.getElementById('cliFechaNacimiento').value = c.persona.fechaNacimiento ? c.persona.fechaNacimiento.split('T')[0] : '';
    document.getElementById('cliLogin').value = c.login;
    document.getElementById('cliPass').value = '';
    new bootstrap.Modal(document.getElementById('modalClienteAdmin')).show();
}

async function guardarClienteAdmin() {
    const id = document.getElementById('cliId').value;
    const payload = {
        nombre: document.getElementById('cliNombre').value,
        primerApellido: document.getElementById('cliPrimerApellido').value,
        segundoApellido: document.getElementById('cliSegundoApellido').value,
        fechaNacimiento: document.getElementById('cliFechaNacimiento').value,
        login: document.getElementById('cliLogin').value,
        idRol: 3,
        password: document.getElementById('cliPass').value || null
    };

    try {
        const res = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        if (res.ok) {
            Swal.fire('Actualizado', '', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalClienteAdmin')).hide();
            cargarGestionClientes();
        } else Swal.fire('Error', 'No se pudo actualizar', 'error');
    } catch (e) { console.error(e); }
}

function confirmarBanearCliente(id) {
    Swal.fire({
        title: '¿Banear Cliente?', text: "Se eliminará la cuenta.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', background: '#1e1e1e', color: '#fff'
    }).then(async (r) => {
        if (r.isConfirmed) {
            const res = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
            if (res.ok) {
                Swal.fire('Baneado', '', 'success');
                cargarGestionClientes();
            } else Swal.fire('Error', 'Tal vez tiene citas activas', 'error');
        }
    });
}