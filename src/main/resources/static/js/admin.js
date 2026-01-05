const API_URL = '/api';
let currentUser = null;
let todosLosEmpleados = [];

// --- INIT & AUTH ---
(function init() {
    const u = localStorage.getItem('usuario');
    if (!u) window.location.href = 'index.html';
    currentUser = JSON.parse(u);
    if (currentUser.idRol !== 1 && currentUser.idRol !== 2) window.location.href = 'cliente.html';
})();

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.display = 'block';

    // UI NavBar - Info Básica
    document.getElementById('nombreUsuario').textContent = `${currentUser.persona.nombre} ${currentUser.persona.primerApellido}`.toUpperCase();
    
    // UI NavBar - Rol y Sucursal
    const nombreRol = currentUser.idRol === 1 ? 'ADMIN MASTER' : 'BARBER STAFF';
    document.getElementById('rolUsuario').textContent = nombreRol;

    // Mostrar Sucursal si tiene
    if (currentUser.sucursal) {
        document.getElementById('sucursalUsuario').innerHTML = `<i class="bi bi-geo-alt-fill me-1"></i>${currentUser.sucursal.nombre}`;
    } else if (currentUser.idRol === 1) {
        document.getElementById('sucursalUsuario').textContent = "CORPORATIVO";
    }

    // Staff Security & Dashboard Personalizado
    if (currentUser.idRol === 2) {
        // Borrar tabs de admin
        ['pills-equipo-tab', 'pills-servicios-tab', 'pills-sucursales-tab', 'pills-clientes-tab'].forEach(id => {
            const tab = document.getElementById(id);
            if(tab) tab.remove();
        });

        const btnAgendar = document.querySelector('button[data-bs-target="#modalNuevaCita"]');
        if(btnAgendar) {
            const btnHorario = document.createElement('button');
            btnHorario.className = 'btn btn-outline-light me-2';
            btnHorario.innerHTML = '<i class="bi bi-calendar3 me-2"></i>Mi Horario';
            btnHorario.onclick = verMiHorario; // Función nueva
            btnAgendar.parentNode.insertBefore(btnHorario, btnAgendar);
        }
    }

    // Cargas iniciales
    cargarClientes();
    cargarCitas();
    cargarCatalogos();
    if (currentUser.idRol === 1) cargarEmpleados();

    setupToggle('toggleEmpPass', 'empPass', 'iconEmpPass');
    setupToggle('toggleEmpPassConfirm', 'empPassConfirm', 'iconEmpPassConfirm');
    setupToggle('togglePerfilPass', 'perfilPass1', 'iconPerfilPass');
    setupToggle('toggleCliPass', 'cliPass', 'iconCliPass');
    const fInput = document.getElementById('fechaInicio');
    if(fInput) fInput.addEventListener('change', actualizarInfoTiempo);
});

// ==========================================
//  CATÁLOGOS
// ==========================================
async function cargarCatalogos() {
    try {
        const respServicios = await fetch(`${API_URL}/servicios`);
        const servicios = await respServicios.json();
        const serviciosActivos = servicios.filter(s => s.activo === 1); 

        const container = document.getElementById('containerServicios');
        if(container) {
            container.innerHTML = '';
            serviciosActivos.forEach(serv => {
                 let precioReal = serv.precio ? serv.precio : 0;
                 let desc = serv.descripcion || "Servicio profesional.";
                 const col = document.createElement('div');
                 col.className = 'col-md-6';
                 col.innerHTML = `
                    <div class="service-card" onclick="seleccionarServicio(this, ${serv.idServicio}, ${serv.duracion}, ${precioReal})">
                        <i class="bi bi-scissors service-icon-bg"></i>
                        <div class="service-header">
                            <div class="service-title">${serv.nombre}</div>
                            <div class="service-price">$${precioReal.toFixed(2)}</div>
                        </div>
                        <p class="service-desc">"${desc}"</p>
                        <div class="mt-2 text-end">
                            <small style="font-size: 0.7rem; opacity: 0.6;">⏱ ${serv.duracion} min</small>
                        </div>
                    </div>
                 `;
                 container.appendChild(col);
            });
        }

        const respSuc = await fetch(`${API_URL}/sucursales`);
        const sucursales = await respSuc.json();
        const sucursalesActivas = sucursales.filter(s => s.activo === true);

        llenarSelect('selectSucursal', sucursalesActivas, 'idSucursal', 'nombre');
        
        llenarSelect('empSucursal', sucursales, 'idSucursal', 'nombre');

        const respEmp = await fetch(`${API_URL}/empleados`);
        todosLosEmpleados = await respEmp.json();

        const selectSucursal = document.getElementById('selectSucursal');
        if (selectSucursal) {

            selectSucursal.addEventListener('change', (e) => filtrarBarberosPorSucursal(e.target.value));
            
            const selectEmp = document.getElementById('selectEmpleado');
            if(selectEmp) selectEmp.innerHTML = '<option value="" selected disabled>← Elige Sucursal primero</option>';
        }

    } catch (error) { console.error("Error catálogos:", error); }
}

function llenarSelect(id, datos, valor, texto) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
    datos.forEach(d => {
        const txt = texto.split('.').reduce((o, i) => o[i], d);
        const opt = document.createElement('option');
        opt.value = d[valor];
        opt.textContent = txt;
        sel.appendChild(opt);
    });
}

function seleccionarServicio(card, id, dur, precio) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('inputServicioId').value = id;
    document.getElementById('inputServicioDuracion').value = dur;
    document.getElementById('txtTotal').textContent = `$${precio.toFixed(2)}`;
    actualizarInfoTiempo();
}

// ==========================================
//  AGENDA
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

// ==========================================
//  CLIENTES
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

// ==========================================
//  EMPLEADOS
// ==========================================
async function cargarEmpleados() {
    const container = document.getElementById('listaEmpleados');
    if (!container) return;
    
    try {
        const res = await fetch(`${API_URL}/empleados`);
        const emps = await res.json();
        container.innerHTML = '';
        
        emps.forEach(e => {
            const rol = e.idRol === 1 ? 'Admin' : 'Staff/Barbero';
            container.innerHTML += `
                <div class="col">
                    <div class="employee-card h-100 text-center p-4">
                        <div class="avatar-ring mb-3"><div class="avatar-img"><i class="bi bi-person-fill"></i></div></div>
                        <h5 class="text-white fw-bold mb-1">${e.persona.nombre} ${e.persona.primerApellido}</h5>
                        <div class="mb-3"><span class="card-role-badge">${rol}</span></div>
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-sm btn-outline-light rounded-pill px-2" onclick='prepararModalEmpleado(${JSON.stringify(e)})'><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-sm btn-outline-warning rounded-pill px-2" onclick="abrirGestionHorarios(${e.idEmpleado}, '${e.persona.nombre}', ${e.sucursal?.idSucursal || 0})"><i class="bi bi-calendar3"></i></button>
                            <button class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="confirmarBaja(${e.idEmpleado})"><i class="bi bi-trash3-fill"></i></button>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

function prepararModalEmpleado(e) {
    const form = document.getElementById('formEmpleado');
    const loginInput = document.getElementById('empLogin');
    form.reset();

    if (e) {
        document.getElementById('tituloModalEmpleado').textContent = "Editar Empleado";
        document.getElementById('empId').value = e.idUsuario || e.idEmpleado;
        document.getElementById('empNombre').value = e.persona.nombre;
        document.getElementById('empPrimerApellido').value = e.persona.primerApellido;
        document.getElementById('empSegundoApellido').value = e.persona.segundoApellido || '';
        document.getElementById('empFechaNacimiento').value = e.persona.fechaNacimiento ? e.persona.fechaNacimiento.split('T')[0] : '';
        document.getElementById('empSucursal').value = e.sucursal?.idSucursal || '';
        document.getElementById('empRol').value = e.idRol || 2;
        
        loginInput.value = e.login || 'No editable';
        loginInput.disabled = true;
    } else {
        document.getElementById('tituloModalEmpleado').textContent = "Contratar Nuevo";
        document.getElementById('empId').value = "";
        loginInput.disabled = false;
    }
    new bootstrap.Modal(document.getElementById('modalEmpleado')).show();
}

async function guardarEmpleado() {
    const id = document.getElementById('empId').value;
    const pass = document.getElementById('empPass').value;
    
    if (!id && !pass) return Swal.fire('Error', 'Contraseña requerida para nuevos', 'warning');
    
    const payload = {
        nombre: document.getElementById('empNombre').value,
        primerApellido: document.getElementById('empPrimerApellido').value,
        segundoApellido: document.getElementById('empSegundoApellido').value,
        fechaNacimiento: document.getElementById('empFechaNacimiento').value,
        idSucursal: parseInt(document.getElementById('empSucursal').value),
        login: document.getElementById('empLogin').value,
        idRol: parseInt(document.getElementById('empRol').value),
        password: pass || null
    };

    const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/empleados/nuevo`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { method: method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
        if (res.ok) {
            Swal.fire('Guardado', '', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalEmpleado')).hide();
            cargarEmpleados();
        } else {
            const err = await res.json();
            Swal.fire('Error', err.message, 'error');
        }
    } catch (e) { Swal.fire('Error', 'Fallo conexión', 'error'); }
}

function confirmarBaja(id) {
    Swal.fire({
        title: '¿Dar de baja?', text: "Perderá acceso al sistema.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', background: '#1e1e1e', color: '#fff'
    }).then(async (r) => {
        if (r.isConfirmed) {
            const res = await fetch(`${API_URL}/empleados/eliminar/${id}`, { method: 'DELETE' });
            if (res.ok) {
                Swal.fire('Baja Exitosa', '', 'success');
                cargarEmpleados();
            }
        }
    });
}

// ==========================================
//  SERVICIOS
// ==========================================
async function cargarAdminServicios() {
    const tbody = document.getElementById('tablaServiciosAdmin');
    if (!tbody) return;
    
    try {
        const res = await fetch(`${API_URL}/servicios`);
        const servs = await res.json();
        tbody.innerHTML = '';
        
        servs.filter(s => s.activo === 1).forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-white">${s.nombre}</td>
                    <td class="text-muted small">${s.descripcion || '-'}</td>
                    <td><span class="badge bg-dark border border-secondary">${s.duracion} min</span></td>
                    <td class="text-gold fw-bold">$${(s.precio||0).toFixed(2)}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-light me-2 border-0" onclick='prepararModalServicio(${JSON.stringify(s)})'><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="eliminarServicio(${s.idServicio})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

function prepararModalServicio(s) {
    const form = document.getElementById('formServicio');
    form.reset();
    if (s) {
        document.getElementById('tituloModalServicio').textContent = "Editar Servicio";
        document.getElementById('servId').value = s.idServicio;
        document.getElementById('servNombre').value = s.nombre;
        document.getElementById('servDesc').value = s.descripcion;
        document.getElementById('servPrecio').value = s.precio;
        document.getElementById('servDuracion').value = s.duracion;
    } else {
        document.getElementById('tituloModalServicio').textContent = "Nuevo Servicio";
        document.getElementById('servId').value = "";
    }
    new bootstrap.Modal(document.getElementById('modalServicio')).show();
}

async function guardarServicio() {
    const id = document.getElementById('servId').value;
    const payload = {
        nombre: document.getElementById('servNombre').value,
        descripcion: document.getElementById('servDesc').value,
        precio: parseFloat(document.getElementById('servPrecio').value),
        duracion: parseInt(document.getElementById('servDuracion').value),
        activo: 1
    };

    const url = id ? `${API_URL}/servicios/${id}` : `${API_URL}/servicios`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { method: method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
        if (res.ok) {
            Swal.fire('Guardado', '', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalServicio')).hide();
            cargarAdminServicios();
            cargarCatalogos();
        }
    } catch (e) { console.error(e); }
}

async function eliminarServicio(id) {
    Swal.fire({
        title: '¿Borrar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', background: '#1e1e1e', color: '#fff'
    }).then(async (r) => {
        if(r.isConfirmed) {
            await fetch(`${API_URL}/servicios/${id}`, { method: 'DELETE' });
            cargarAdminServicios();
        }
    });
}

// ==========================================
//  SUCURSALES
// ==========================================
async function cargarSucursalesAdmin() {
    const tbody = document.getElementById('tablaSucursalesAdmin');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Cargando...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/sucursales`);
        const sucs = await res.json();
        tbody.innerHTML = '';
        
        sucs.forEach(s => {
            const badge = s.activo 
                ? '<span class="badge bg-success bg-opacity-25 text-success border border-success">ACTIVA</span>' 
                : '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger">INACTIVA</span>';
            
            const btnToggle = s.activo
                ? `<button class="btn btn-sm btn-outline-danger border-0" onclick="cambiarEstadoSucursal(${s.idSucursal})" title="Cerrar"><i class="bi bi-eye-slash-fill"></i></button>`
                : `<button class="btn btn-sm btn-outline-success border-0" onclick="cambiarEstadoSucursal(${s.idSucursal})" title="Reactivar"><i class="bi bi-eye-fill"></i></button>`;

            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 text-muted">#${s.idSucursal}</td>
                    <td class="fw-bold text-white fs-5">${s.nombre}</td>
                    <td>${badge}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-light border-0 me-2" onclick="prepararModalSucursal('${encodeURIComponent(JSON.stringify(s))}')"><i class="bi bi-pencil-square"></i></button>
                        ${btnToggle}
                    </td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

function prepararModalSucursal(encoded) {
    const form = document.getElementById('formSucursal');
    const divActivo = document.getElementById('divSucActivo');

    const divConfig = document.getElementById('divConfigHorarios');
    const divToggle = document.getElementById('divToggleEditHorario'); 
    const checkToggle = document.getElementById('checkEditHorario');
    const btnEliminar = document.getElementById('btnEliminarSucursal');
    
    form.reset();

    if (encoded) {
        // --- MODO EDITAR ---
        const s = JSON.parse(decodeURIComponent(encoded));
        document.getElementById('tituloModalSucursal').textContent = "Editar Sucursal";
        document.getElementById('sucId').value = s.idSucursal;
        document.getElementById('sucNombre').value = s.nombre;
        
        if(divActivo) divActivo.classList.remove('d-none');
        document.getElementById('sucActivo').checked = s.activo;
        
        // MOSTRAR EL SWITCH DE RECONFIGURAR
        if(divToggle) divToggle.classList.remove('d-none');
        if(checkToggle) checkToggle.checked = false;

        // OCULTAR LA CONFIG POR DEFECTO (Hasta que activen el switch)
        if(divConfig) divConfig.classList.add('d-none');
        
        if(btnEliminar) btnEliminar.classList.remove('d-none');

    } else {
        // --- MODO CREAR ---
        document.getElementById('tituloModalSucursal').textContent = "Nueva Apertura";
        document.getElementById('sucId').value = "";
        
        if(divActivo) divActivo.classList.add('d-none');

        if(divToggle) divToggle.classList.add('d-none');

        if(divConfig) divConfig.classList.remove('d-none');
        
        if(btnEliminar) btnEliminar.classList.add('d-none');
        
        document.querySelectorAll('.check-dia-suc').forEach(c => c.checked = c.value !== "7");
    }
    new bootstrap.Modal(document.getElementById('modalSucursal')).show();
}

async function guardarSucursal() {
    const id = document.getElementById('sucId').value;
    const nombre = document.getElementById('sucNombre').value;
    if (!nombre) return Swal.fire('Error', 'Nombre requerido', 'warning');

    let payload = { nombre: nombre };
    let url = `${API_URL}/sucursales`;
    let method = 'POST';

    // Recolectamos datos de horario
    const leerHorarios = () => {
        const dias = Array.from(document.querySelectorAll('.check-dia-suc:checked')).map(c => parseInt(c.value));
        const t1i = document.getElementById('sucT1Inicio').value;
        const t1f = document.getElementById('sucT1Fin').value;
        const t2i = document.getElementById('sucT2Inicio').value;
        const t2f = document.getElementById('sucT2Fin').value;
        return {
            diasLaborales: dias,
            turno1Inicio: t1i ? t1i + ":00" : null, turno1Fin: t1f ? t1f + ":00" : null,
            turno2Inicio: t2i ? t2i + ":00" : null, turno2Fin: t2f ? t2f + ":00" : null
        };
    };

    if (id) {
        // --- EDITAR ---
        method = 'PUT';
        url = `${API_URL}/sucursales/${id}`;
        payload.activo = document.getElementById('sucActivo').checked;
        
        const quiereEditarHorario = document.getElementById('checkEditHorario').checked;
        if (quiereEditarHorario) {
            Object.assign(payload, leerHorarios());
        }

    } else {
        // --- CREAR ---
        Object.assign(payload, leerHorarios());
    }

    try {
        const res = await fetch(url, { method: method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
        if (res.ok) {
            Swal.fire('Guardado', 'La sucursal ha sido actualizada', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalSucursal')).hide();
            cargarSucursalesAdmin();
            cargarCatalogos();
        } else {
            Swal.fire('Error', 'No se pudo guardar', 'error');
        }
    } catch (e) { console.error(e); }
}

async function cambiarEstadoSucursal(id) {
    await fetch(`${API_URL}/sucursales/${id}`, { method: 'DELETE' });
    cargarSucursalesAdmin();
}

function confirmarBorrarSucursal() {
    const id = document.getElementById('sucId').value;
    Swal.fire({
        title: '¿Borrar Definitivamente?', text: "Esto eliminará la sucursal de la BD. Si tiene datos fallará.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', background: '#1e1e1e', color: '#fff'
    }).then(async (r) => {
        if (r.isConfirmed) {
            const res = await fetch(`${API_URL}/sucursales/borrar/${id}`, { method: 'DELETE' });
            if (res.ok) {
                Swal.fire('Eliminada', '', 'success');
                bootstrap.Modal.getInstance(document.getElementById('modalSucursal')).hide();
                cargarSucursalesAdmin();
            } else {
                Swal.fire('Error', 'No se puede borrar (posiblemente tiene empleados o citas). Desactívala mejor.', 'error');
            }
        }
    });
}

// ==========================================
//  HORARIOS & DESCANSOS
// ==========================================
let horariosAsignados = [];
let horariosPlantilla = [];

async function abrirGestionHorarios(idEmp, nombre, idSuc) {
    if (!idSuc) return Swal.fire('Error', 'Empleado sin sucursal', 'error');
    
    document.getElementById('lblNombreEmpleadoHorario').textContent = nombre;
    document.getElementById('inputIdEmpleadoHorario').value = idEmp;
    const container = document.getElementById('contenedorMatrizHorarios');
    container.innerHTML = '<div class="text-center py-5 text-warning">Cargando...</div>';
    document.getElementById('inputFechaDescanso').value = '';
    
    new bootstrap.Modal(document.getElementById('modalHorario')).show();

    try {
        const [p, a] = await Promise.all([
            fetch(`${API_URL}/horarios/sucursal/${idSuc}`).then(r=>r.json()),
            fetch(`${API_URL}/horarios/empleado/${idEmp}`).then(r=>r.json())
        ]);
        horariosPlantilla = p;
        horariosAsignados = a;
        
        renderizarMatriz();
        cargarDescansosUI(idEmp);
    } catch (e) { container.innerHTML = '<div class="text-danger">Error cargando datos</div>'; }
}

function renderizarMatriz() {
    const container = document.getElementById('contenedorMatrizHorarios');
    if (horariosPlantilla.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">Sin horarios base en sucursal</div>';
        return;
    }

    const dias = new Map();
    horariosPlantilla.forEach(h => {
        const n = h.diaLaboral.nombre;
        if (!dias.has(n)) dias.set(n, []);
        dias.get(n).push(h);
    });

    let html = '<table class="table table-dark table-hover align-middle"><thead><tr><th style="width:30%">Día</th><th>Turnos</th></tr></thead><tbody>';
    
    dias.forEach((lista, dia) => {
        const checks = lista.map(h => {
            const isChecked = horariosAsignados.some(ha => ha.idHorario === h.idHorario);
            const cls = isChecked ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary';
            const ini = h.horaInicio.substring(0,5);
            const fin = h.horaFin.substring(0,5);
            return `
                <input type="checkbox" class="btn-check check-horario" id="chk-${h.idHorario}" value="${h.idHorario}" ${isChecked?'checked':''}>
                <label class="btn btn-sm ${cls}" style="width:100px" for="chk-${h.idHorario}" onclick="toggleEstilo(this)">${ini} - ${fin}</label>
            `;
        }).join('');
        html += `<tr><td class="fw-bold text-gold">${dia}</td><td><div class="d-flex gap-2 flex-wrap">${checks}</div></td></tr>`;
    });
    
    container.innerHTML = html + '</tbody></table>';
}

function toggleEstilo(lbl) {
    if (lbl.classList.contains('btn-warning')) {
        lbl.classList.remove('btn-warning', 'text-dark', 'fw-bold');
        lbl.classList.add('btn-outline-secondary');
    } else {
        lbl.classList.remove('btn-outline-secondary');
        lbl.classList.add('btn-warning', 'text-dark', 'fw-bold');
    }
}

async function guardarAsignacionHorarios() {
    const id = parseInt(document.getElementById('inputIdEmpleadoHorario').value);
    const ids = Array.from(document.querySelectorAll('.check-horario:checked')).map(c => parseInt(c.value));
    
    const res = await fetch(`${API_URL}/horarios/asignar`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({idEmpleado: id, idsHorarios: ids})
    });
    
    if(res.ok) {
        Swal.fire('Horario Guardado', '', 'success');
        bootstrap.Modal.getInstance(document.getElementById('modalHorario')).hide();
    } else Swal.fire('Error', 'No se pudo guardar', 'error');
}

async function cargarDescansosUI(id) {
    const cont = document.getElementById('listaDescansos');
    cont.innerHTML = '...';
    const res = await fetch(`${API_URL}/horarios/descansos/${id}`);
    if (res.ok) {
        const lista = await res.json();
        cont.innerHTML = '';
        if (lista.length === 0) { cont.innerHTML = '<small class="text-muted">Sin descansos</small>'; return; }
        
        lista.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
        lista.forEach(d => {
            const f = new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'numeric'});
            cont.innerHTML += `<div class="badge bg-dark border border-secondary p-2 d-flex align-items-center">
                <span class="me-2">${f}</span>
                <i class="bi bi-x-circle-fill text-danger" style="cursor:pointer" onclick="eliminarDiaDescanso(${d.idDiaDescanso}, ${id})"></i>
            </div>`;
        });
    }
}

async function agregarDiaDescanso() {
    const id = document.getElementById('inputIdEmpleadoHorario').value;
    const f = document.getElementById('inputFechaDescanso').value;
    if(!f) return;
    
    const res = await fetch(`${API_URL}/horarios/descansos/${id}`, { method: 'POST', body: f });
    if(res.ok) {
        document.getElementById('inputFechaDescanso').value = '';
        cargarDescansosUI(id);
    }
}

async function eliminarDiaDescanso(idDescanso, idEmp) {
    await fetch(`${API_URL}/horarios/descansos/${idDescanso}`, { method: 'DELETE' });
    cargarDescansosUI(idEmp);
}

// ==========================================
//  PERFIL
// ==========================================
function abrirMiPerfil() {
    document.getElementById('perfilNombre').value = currentUser.persona.nombre;
    document.getElementById('perfilPrimerApellido').value = currentUser.persona.primerApellido;
    document.getElementById('perfilSegundoApellido').value = currentUser.persona.segundoApellido || '';
    document.getElementById('perfilFechaNacimiento').value = currentUser.persona.fechaNacimiento ? currentUser.persona.fechaNacimiento.split('T')[0] : '';
    document.getElementById('perfilPass1').value = '';
    document.getElementById('perfilPass2').value = '';
    new bootstrap.Modal(document.getElementById('modalMiPerfil')).show();
}

async function actualizarMiPerfil() {
    const p1 = document.getElementById('perfilPass1').value;
    const p2 = document.getElementById('perfilPass2').value;
    if (p1 && p1 !== p2) return Swal.fire('Error', 'Passwords no coinciden', 'error');

    const payload = {
        idUsuario: currentUser.idUsuario,
        persona: {
            nombre: document.getElementById('perfilNombre').value,
            primerApellido: document.getElementById('perfilPrimerApellido').value,
            segundoApellido: document.getElementById('perfilSegundoApellido').value,
            fechaNacimiento: document.getElementById('perfilFechaNacimiento').value
        },
        password: p1 || null
    };

    const res = await fetch(`${API_URL}/usuarios/perfil`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    if(res.ok) {
        const nuevo = await res.json();
        localStorage.setItem('usuario', JSON.stringify(nuevo));
        currentUser = nuevo;
        Swal.fire('Perfil Actualizado', '', 'success').then(() => location.reload());
    }
}

function cerrarSesion() { localStorage.removeItem('usuario'); window.location.href = 'index.html'; }

function setupToggle(btnId, inpId, iconId) {
    const btn = document.getElementById(btnId);
    if(btn) {
        btn.addEventListener('click', () => {
            const inp = document.getElementById(inpId);
            const ico = document.getElementById(iconId);
            const isPass = inp.type === 'password';
            inp.type = isPass ? 'text' : 'password';
            ico.className = isPass ? 'bi bi-eye-slash' : 'bi bi-eye';
        });
    }
}

function actualizarInfoTiempo() {
    const ini = document.getElementById('fechaInicio').value;
    const dur = parseInt(document.getElementById('inputServicioDuracion').value);
    const txt = document.getElementById('txtHoraFin');
    if (ini && dur) {
        const fin = new Date(new Date(ini).getTime() + dur * 60000);
        txt.textContent = fin.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }
}

function toggleEdicionHorarios() {
    const check = document.getElementById('checkEditHorario');
    const div = document.getElementById('divConfigHorarios');
    
    if (check.checked) {
        div.classList.remove('d-none'); // Mostrar panel
    } else {
        div.classList.add('d-none'); // Ocultar panel
    }
}

// ==========================================
//  MI HORARIO (STAFF VIEW)
// ==========================================
async function verMiHorario() {
    const modalEl = document.getElementById('modalMiHorario');
    const container = document.getElementById('contenedorMiHorario');
    const listaDescansos = document.getElementById('listaMisDescansos');
    
    new bootstrap.Modal(modalEl).show();
    
    try {
        const resH = await fetch(`${API_URL}/horarios/empleado/${currentUser.idUsuario}`); // idUsuario es idEmpleado
        const horarios = await resH.json();
        
        const resD = await fetch(`${API_URL}/horarios/descansos/${currentUser.idUsuario}`);
        const descansos = await resD.json();

        if (horarios.length === 0) {
            container.innerHTML = '<div class="alert alert-dark border-secondary text-muted">No tienes turnos asignados aún.</div>';
        } else {
            // Agrupar por día
            const diasMap = new Map();
            const ordenDias = { 'Lunes':1, 'Martes':2, 'Miércoles':3, 'Jueves':4, 'Viernes':5, 'Sábado':6, 'Domingo':7 };
            
            horarios.forEach(h => {
                const n = h.diaLaboral.nombre;
                if (!diasMap.has(n)) diasMap.set(n, []);
                diasMap.get(n).push(h);
            });

            // Ordenar días
            const diasOrdenados = Array.from(diasMap.keys()).sort((a,b) => ordenDias[a] - ordenDias[b]);

            let html = '<ul class="list-group list-group-flush text-start rounded">';
            
            diasOrdenados.forEach(dia => {
                const turnos = diasMap.get(dia);
                // Ordenar horas
                turnos.sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
                
                const turnosBadges = turnos.map(t => {
                    const ini = t.horaInicio.substring(0,5);
                    const fin = t.horaFin.substring(0,5);
                    return `<span class="badge bg-warning text-dark border border-warning me-1">${ini} - ${fin}</span>`;
                }).join('');

                html += `
                    <li class="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center px-0">
                        <span class="fw-bold text-gold" style="width: 100px;">${dia}</span>
                        <div>${turnosBadges}</div>
                    </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        }

        listaDescansos.innerHTML = '';
        if (descansos.length === 0) {
            listaDescansos.innerHTML = '<span class="text-muted small fst-italic">No hay días libres próximos.</span>';
        } else {
            descansos.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
            descansos.forEach(d => {
                const f = new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-ES', {weekday: 'short', day:'numeric', month:'short'});
                listaDescansos.innerHTML += `<span class="badge bg-dark border border-secondary text-white py-2 px-3">${f}</span>`;
            });
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-danger">Error al cargar horario.</div>';
    }
}

function filtrarBarberosPorSucursal(idSucursal) {
    const selectEmp = document.getElementById('selectEmpleado');
    if (!selectEmp) return;

    // Filtramos la lista global buscando coincidencias
    // Convertimos idSucursal a número porque del value viene como string
    const id = parseInt(idSucursal);
    
    const barberosDisponibles = todosLosEmpleados.filter(emp => 
        emp.sucursal && emp.sucursal.idSucursal === id
    );

    if (barberosDisponibles.length > 0) {
        llenarSelect('selectEmpleado', barberosDisponibles, 'idEmpleado', 'persona.nombre');
    } else {
        selectEmp.innerHTML = '<option value="" selected disabled>Sin barberos en esta sede</option>';
    }
}