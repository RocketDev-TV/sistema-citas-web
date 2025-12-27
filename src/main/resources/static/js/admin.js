// ==========================================
//  GLOBALES Y SETUP
// ==========================================
const API_URL = '/api'; 
let currentUser = null;

(function init() {
    const u = localStorage.getItem('usuario');
    if (!u) window.location.href = 'index.html';
    currentUser = JSON.parse(u);
    if (currentUser.idRol !== 1 && currentUser.idRol !== 2) window.location.href = 'cliente.html';
})();

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.display = 'block';
    
    // UI NavBar
    document.getElementById('nombreUsuario').textContent = `${currentUser.persona.nombre} ${currentUser.persona.primerApellido}`.toUpperCase();
    document.getElementById('rolUsuario').textContent = currentUser.idRol === 1 ? 'ADMIN' : 'STAFF';

    // Staff Security
    if (currentUser.idRol === 2) {
        const tab = document.getElementById('pills-equipo-tab');
        if(tab) tab.remove();
    }
    cargarClientes();
    cargarCitas();
    cargarCatalogos(); // IMPORTANTE: Genera las cards de servicios
    if(currentUser.idRol === 1) cargarEmpleados();

    // ACTIVAR OJITOS (EMPLEADO Y PERFIL)
    setupToggle('toggleEmpPass', 'empPass', 'iconEmpPass');
    setupToggle('toggleEmpPassConfirm', 'empPassConfirm', 'iconEmpPassConfirm');
    
    setupToggle('togglePerfilPass', 'perfilPass', 'iconPerfilPass');
    setupToggle('togglePerfilPassConfirm', 'perfilPassConfirm', 'iconPerfilPassConfirm');

    setupToggle('toggleCliPass', 'cliPass', 'iconCliPass');
});

// ==========================================
//  CATÁLOGOS 
// ==========================================
async function cargarCatalogos() {
    try {
        // 1. Cargar Servicios
        const respServicios = await fetch(`${API_URL}/servicios`);
        const servicios = await respServicios.json();
        
        // 👇👇 EL FILTRO QUE FALTABA 👇👇
        // Solo mostramos los que tienen activo = 1
        const serviciosActivos = servicios.filter(s => s.activo === 1); 

        const container = document.getElementById('containerServicios');
        if(container) {
            container.innerHTML = '';
            
            // Usamos la lista filtrada 'serviciosActivos' en vez de 'servicios'
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

        // 2. Cargar Sucursales y Empleados (Esto se queda igual)
        const respSuc = await fetch(`${API_URL}/sucursales`);
        const sucursales = await respSuc.json();
        llenarSelect('selectSucursal', sucursales, 'idSucursal', 'nombre');
        
        const respEmp = await fetch(`${API_URL}/empleados`);
        const empleados = await respEmp.json();
        llenarSelect('selectEmpleado', empleados, 'idEmpleado', 'persona.nombre');

    } catch (error) {
        console.error("Error catálogos:", error);
    }
}

// Helpers Select
function llenarSelect(id, datos, campoValor, campoTexto) {
    const sel = document.getElementById(id);
    if(sel) {
        sel.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
        datos.forEach(d => {
            const texto = campoTexto.split('.').reduce((o,i)=>o[i], d); 
            const opt = document.createElement('option');
            opt.value = d[campoValor]; opt.textContent = texto;
            sel.appendChild(opt);
        });
    }
}

// Selección visual de servicio
function seleccionarServicio(card, id, dur, precio) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    document.getElementById('inputServicioId').value = id;
    document.getElementById('inputServicioDuracion').value = dur;
    document.getElementById('txtTotal').textContent = `$${precio}.00`;
    
    actualizarInfoTiempo(); // Recalcular hora fin
}

// ==========================================
//  AGENDA (TABLA CLÁSICA)
// ==========================================
async function cargarCitas() {
    const tbody = document.getElementById('tablaCitas');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Cargando...</td></tr>';
    
    try {
        const res = await fetch(`${API_URL}/citas`);
        const citas = await res.json();
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
            
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-muted">#${folio}</td>
                    <td>
                        <div class="fw-bold text-white">${cita.cliente.nombre} ${cita.cliente.primerApellido}</div>
                        <small class="text-muted">ID: ${cita.cliente.idPersona}</small>
                    </td>
                    <td><span class="badge rounded-0 p-2" style="background: #333; color: var(--barber-gold); border: 1px solid var(--barber-gold);">✂️ ${cita.servicio.nombre}</span></td>
                    <td class="text-white-50 small">${cita.sucursal.nombre}</td>
                    <td class="text-white small">👤 ${cita.empleado.persona.nombre}</td>
                    <td class="text-end pe-4">${horarioTexto}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="confirmarCancelacion(${cita.idCita})"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                </tr>`;
        });
    } catch(e) { console.error(e); }
}

// ==========================================
//  PERFIL & EMPLEADOS (LÓGICA PREMIUM)
// ==========================================

// ==========================================
//  3. MI PERFIL 
// ==========================================
function abrirMiPerfil() {
    // 1. Llenar Nombre (Este sí existe)
    document.getElementById('perfilNombreDisplay').textContent = currentUser.persona.nombre;

    // 3. Llenar el formulario
    document.getElementById('perfilNombre').value = currentUser.persona.nombre;
    document.getElementById('perfilApellido').value = currentUser.persona.primerApellido;
    document.getElementById('perfilPass').value = '';
    document.getElementById('perfilPassConfirm').value = '';
    
    // 4. Mostrar
    new bootstrap.Modal(document.getElementById('modalMiPerfil')).show();
}

async function actualizarMiPerfil() {
    const nombre = document.getElementById('perfilNombre').value;
    const apellido = document.getElementById('perfilApellido').value;
    const pass = document.getElementById('perfilPass').value;
    const passConfirm = document.getElementById('perfilPassConfirm').value;

    if(pass && pass !== passConfirm) return Swal.fire('Error', 'Contraseñas no coinciden', 'error');

    const payload = { idUsuario: currentUser.idUsuario, persona: { ...currentUser.persona, nombre: nombre, primerApellido: apellido } };
    if(pass) payload.password = pass;

    try {
        const resp = await fetch(`${API_URL}/usuarios/perfil`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        if(resp.ok) {
            const userActualizado = await resp.json();
            localStorage.setItem('usuario', JSON.stringify(userActualizado));
            currentUser = userActualizado;
            Swal.fire('¡Listo!', 'Perfil actualizado', 'success').then(() => location.reload());
        } else { Swal.fire('Error', 'Falló la actualización', 'error'); }
    } catch(e) { console.error(e); }
}

// EMPLEADOS
async function cargarEmpleados() {
    const contenedor = document.getElementById('listaEmpleados');
    if(!contenedor) return;
    try {
        const resp = await fetch(`${API_URL}/empleados`);
        const empleados = await resp.json();
        contenedor.innerHTML = '';
        empleados.forEach(emp => {
            const html = `
                <div class="col">
                    <div class="employee-card h-100 text-center p-4">
                        <div class="avatar-ring mb-3"><div class="avatar-img"><i class="bi bi-person-fill"></i></div></div>
                        <h5 class="text-white fw-bold mb-1">${emp.persona.nombre} ${emp.persona.primerApellido}</h5>
                        <div class="mb-3"><span class="card-role-badge">${emp.rol ? emp.rol.nombre : 'Staff'}</span></div>
                        <button class="btn btn-sm btn-outline-light rounded-pill px-3 opacity-75" onclick='prepararModalEmpleado(${JSON.stringify(emp)})'>
                            <i class="bi bi-pencil-square me-1"></i> Editar
                        </button>
                    </div>
                </div>`;
            contenedor.innerHTML += html;
        });
    } catch(e) { console.error(e); }
}

function prepararModalEmpleado(empleado) {
    const modalEl = document.getElementById('modalEmpleado');
    const form = document.getElementById('formEmpleado');
    const loginInput = document.getElementById('empLogin');
    const loginHelp = document.getElementById('loginHelp');
    
    form.reset();
    document.getElementById('empPass').value = '';
    document.getElementById('empPassConfirm').value = '';

    if (empleado) {
        // MODO EDICIÓN
        document.getElementById('tituloModalEmpleado').textContent = "Editar Empleado";
        document.getElementById('empId').value = empleado.idUsuario || empleado.idEmpleado; 
        document.getElementById('empNombre').value = empleado.persona.nombre;
        document.getElementById('empApellido').value = empleado.persona.primerApellido;
        
        // TRUCO VISUAL: Mostramos esto para que no se vea vacío
        loginInput.value = empleado.login || 'Usuario Registrado (No editable)';
        loginInput.disabled = true; 
        loginHelp.style.display = 'block'; // Mostramos el mensajito de ayuda
        
        document.getElementById('empRol').value = empleado.idRol || 2;
    } else {
        // MODO CREACIÓN
        document.getElementById('tituloModalEmpleado').textContent = "Contratar Nuevo Talento";
        document.getElementById('empId').value = "";
        
        loginInput.value = ""; 
        loginInput.disabled = false; // Aquí sí dejamos escribir
        loginHelp.style.display = 'none';
    }
    
    new bootstrap.Modal(modalEl).show();
}

async function guardarEmpleado() {
    const id = document.getElementById('empId').value;
    const nombre = document.getElementById('empNombre').value;
    const apellido = document.getElementById('empApellido').value;
    const login = document.getElementById('empLogin').value;
    const rol = document.getElementById('empRol').value;
    
    const pass = document.getElementById('empPass').value;
    const passConfirm = document.getElementById('empPassConfirm').value;
    
    if(!nombre || !apellido || !login) return Swal.fire('Error', 'Faltan datos obligatorios', 'warning');
    
    // Si es NUEVO, password obligatorio
    if(!id && !pass) return Swal.fire('Requerido', 'Asigna una contraseña inicial', 'warning');
    // Validar coincidencia
    if(pass && pass !== passConfirm) return Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
    let url, method, payload;

    if (id) {
        // MODO EDICIÓN (PUT a /api/usuarios/{id})
        url = `${API_URL}/usuarios/${id}`;
        method = 'PUT';
        payload = {
            // Mandamos estructura para UsuarioDto
            nombre: nombre,
            primerApellido: apellido,
            login: login,
            idRol: parseInt(rol),
            password: pass ? pass : null // Solo si hay pass nueva
        };
    } else {
        // MODO CREACIÓN (POST a /api/empleados/nuevo)
        url = `${API_URL}/empleados/nuevo`;
        method = 'POST';
        payload = {
            // Mandamos estructura PLANA para AltaEmpleadoDto
            nombre: nombre,
            primerApellido: apellido,
            segundoApellido: "", // Opcional
            idSucursal: 1, // Default (o toma el value de un select si lo tienes)
            login: login,
            password: pass
        };
    }

    try {
        const resp = await fetch(url, { 
            method: method, 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(payload) 
        });
        
        if(resp.ok) {
            Swal.fire('Éxito', 'Información guardada', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalEmpleado')).hide();
            cargarEmpleados();
        } else {
            const err = await resp.json();
            Swal.fire('Error', err.message || 'Error al guardar', 'error');
        }
    } catch(e) { console.error(e); Swal.fire('Error', 'Fallo de conexión', 'error'); }
}

// Auxiliares (Tiempo, Logout)
document.getElementById('fechaInicio')?.addEventListener('change', actualizarInfoTiempo);

function actualizarInfoTiempo() {
    const inicioVal = document.getElementById('fechaInicio').value;
    const duracion = parseInt(document.getElementById('inputServicioDuracion').value);
    const txtHoraFin = document.getElementById('txtHoraFin');
    if (inicioVal && duracion) {
        const f = new Date(inicioVal);
        const fFin = new Date(f.getTime() + duracion * 60000);
        txtHoraFin.textContent = `${fFin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
}
function cerrarSesion() { localStorage.removeItem('usuario'); window.location.href = 'index.html'; }

// HELPER OJO (pass)
function setupToggle(btnId, inputId, iconId) {
    const btn = document.getElementById(btnId);
    if(btn){
        btn.addEventListener('click', () => {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            
            // Si es pass, lo volvemos texto. Si es texto, pass.
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Cambiamos el icono
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }
}

async function cargarClientes() {
    try {
        const respuesta = await fetch('/api/usuarios/clientes'); 
        
        if (!respuesta.ok) {
            console.error("Error al llamar API Clientes:", respuesta.status);
            return;
        }

        const usuariosClientes = await respuesta.json();
        // console.log("Clientes filtrados:", usuariosClientes); 

        const select = document.getElementById('selectCliente');
        if (!select) return;

        select.innerHTML = '<option value="" selected disabled>Selecciona al Cliente...</option>';
        
        usuariosClientes.forEach(u => {
            const p = u.persona; 
            
            const opt = document.createElement('option');
            opt.value = p.idPersona; 
            opt.textContent = `${p.nombre} ${p.primerApellido} (ID: ${p.idPersona})`;
            select.appendChild(opt);
        });
    } catch (error) { 
        console.error("Error cargando clientes:", error); 
    }
}

// ==========================================
//  TAB 3: GESTIÓN DE SERVICIOS (CRUD)
// ==========================================

async function cargarAdminServicios() {
    const tbody = document.getElementById('tablaServiciosAdmin');
    if(!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando catálogo...</td></tr>';

    try {
        const resp = await fetch(`${API_URL}/servicios`);
        const servicios = await resp.json();
        tbody.innerHTML = '';

        // Filtramos solo los activos (activo === 1)
        const activos = servicios.filter(s => s.activo === 1);

        if (activos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay servicios activos.</td></tr>';
            return;
        }

        activos.forEach(s => {
            let precio = s.precio ? s.precio : 0;
            const fila = `
                <tr>
                    <td class="ps-4 fw-bold text-white">${s.nombre}</td>
                    <td class="text-muted small">${s.descripcion || '-'}</td>
                    <td><span class="badge bg-dark border border-secondary text-light">${s.duracion} min</span></td>
                    <td class="text-gold fw-bold">$${precio.toFixed(2)}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-light me-2 border-0" onclick='prepararModalServicio(${JSON.stringify(s)})'>
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="eliminarServicio(${s.idServicio})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    } catch (e) { console.error(e); }
}

function prepararModalServicio(servicio) {
    const modalEl = document.getElementById('modalServicio');
    const form = document.getElementById('formServicio');
    form.reset();

    if (servicio) {
        document.getElementById('tituloModalServicio').textContent = "Editar Servicio";
        document.getElementById('servId').value = servicio.idServicio;
        document.getElementById('servNombre').value = servicio.nombre;
        document.getElementById('servDesc').value = servicio.descripcion;
        document.getElementById('servPrecio').value = servicio.precio;
        document.getElementById('servDuracion').value = servicio.duracion;
    } else {
        document.getElementById('tituloModalServicio').textContent = "Nuevo Servicio";
        document.getElementById('servId').value = "";
    }
    new bootstrap.Modal(modalEl).show();
}

async function guardarServicio() {
    const id = document.getElementById('servId').value;
    const nombre = document.getElementById('servNombre').value;
    const desc = document.getElementById('servDesc').value;
    const precio = document.getElementById('servPrecio').value;
    const duracion = document.getElementById('servDuracion').value;

    if (!nombre || !precio || !duracion) return Swal.fire('Error', 'Faltan datos obligatorios', 'warning');

    const payload = {
        nombre: nombre,
        descripcion: desc,
        precio: parseFloat(precio),
        duracion: parseInt(duracion),
        activo: 1
    };

    let url = id ? `${API_URL}/servicios/${id}` : `${API_URL}/servicios`;
    let method = id ? 'PUT' : 'POST';

    try {
        const resp = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            Swal.fire('Éxito', 'Catálogo actualizado', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalServicio')).hide();
            cargarAdminServicios();
            cargarCatalogos(); // Actualizar también el modal de citas
        } else {
            Swal.fire('Error', 'No se pudo guardar', 'error');
        }
    } catch (e) { console.error(e); }
}

async function eliminarServicio(id) {
    Swal.fire({
        title: '¿Borrar servicio?',
        text: "Ya no aparecerá en la agenda.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/servicios/${id}`, { method: 'DELETE' });
                Swal.fire('Eliminado', '', 'success');
                cargarAdminServicios();
            } catch (e) { Swal.fire('Error', '', 'error'); }
        }
    });
}


// ==========================================
//  4. GUARDAR CITA (CORREGIDO - BUG TIMEZONE)
// ==========================================
async function guardarCita() {
    // 1. Obtener referencias
    const idServicio = document.getElementById('inputServicioId').value;
    const idCliente = document.getElementById('selectCliente').value;
    const idSucursal = document.getElementById('selectSucursal').value;
    const idEmpleado = document.getElementById('selectEmpleado').value;
    const fechaInicio = document.getElementById('fechaInicio').value; // Viene como "2025-12-24T10:00"
    const duracion = document.getElementById('inputServicioDuracion').value;

    // 2. Validaciones
    if (!idServicio) return Swal.fire('Falta Servicio', 'Selecciona un estilo.', 'warning');
    if (!idCliente) return Swal.fire('Falta Cliente', 'Selecciona al cliente.', 'warning');
    if (!idSucursal) return Swal.fire('Falta Sucursal', 'Selecciona la sucursal.', 'warning');
    if (!idEmpleado) return Swal.fire('Falta Barbero', 'Selecciona al barbero.', 'warning');
    if (!fechaInicio) return Swal.fire('Falta Fecha', 'Selecciona cuándo será la cita.', 'warning');

    // 3. Calcular Fecha Fin
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaInicioDate.getTime() + (parseInt(duracion) * 60000));
    
    // --- CORRECCIÓN AQUÍ 👇 ---
    // Ajustamos el desfase horario para que .toISOString() nos de la hora LOCAL, no la UTC.
    const tzOffset = fechaFinDate.getTimezoneOffset() * 60000;
    const fechaFinLocal = new Date(fechaFinDate.getTime() - tzOffset).toISOString().slice(0, 19);
    // --------------------------

    const payload = {
        idCliente: parseInt(idCliente),
        idServicio: parseInt(idServicio),
        idSucursal: parseInt(idSucursal),
        idEmpleado: parseInt(idEmpleado),
        fechaInicio: fechaInicio, // Mandamos "10:00"
        fechaFin: fechaFinLocal   // Mandamos "10:30" (Ya corregido)
    };

    try {
        const resp = await fetch(`${API_URL}/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            Swal.fire({
                title: '¡Cita Agendada!',
                text: 'El corte ha sido programado.',
                icon: 'success',
                confirmButtonColor: '#d4af37',
                background: '#1e1e1e', color: '#fff'
            });
            
            // Cerrar modal y recargar
            const modalEl = document.getElementById('modalNuevaCita');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            cargarCitas();
            
            // Actualizar dashboard si existe
            if (typeof actualizarDashboard === 'function') actualizarDashboard();

        } else {
            const errorData = await resp.json();
            // Mostramos el mensaje exacto que manda el backend (ej: Agenda llena)
            Swal.fire('Atención', errorData.message || 'Horario no disponible.', 'warning');
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    }
}

// ==========================================
//  5. CANCELACIÓN DE CITAS (FUNCIONES FALTANTES)
// ==========================================
function confirmarCancelacion(idCita) {
    Swal.fire({
        title: '¿Cancelar Cita?',
        text: "Esta acción liberará el horario.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Rojo peligro
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'No',
        background: '#1e1e1e', // Estilo dark
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarCita(idCita);
        }
    });
}

async function eliminarCita(id) {
    try {
        const resp = await fetch(`${API_URL}/citas/${id}`, {
            method: 'DELETE'
        });

        if (resp.ok) {
            Swal.fire({
                title: '¡Eliminada!',
                text: 'La cita ha sido borrada.',
                icon: 'success',
                confirmButtonColor: '#d4af37',
                background: '#1e1e1e',
                color: '#fff'
            });
            
            cargarCitas(); // Recargamos la tabla para que desaparezca
            
            // Actualizamos los contadores de arriba también
            if (typeof actualizarDashboard === 'function') {
                actualizarDashboard();
            }
        } else {
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Fallo de conexión.', 'error');
    }
}

// ==========================================
//  6. GESTIÓN DE CLIENTES (ACTUALIZADO CON EDITAR)
// ==========================================

async function cargarGestionClientes() {
    const tbody = document.getElementById('tablaClientesAdmin');
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Cargando cartera...</td></tr>';

    try {
        const resp = await fetch(`${API_URL}/usuarios/clientes`);
        if(!resp.ok) throw new Error("Error al obtener clientes");
        
        const clientes = await resp.json();
        tbody.innerHTML = '';

        if(clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No hay clientes registrados.</td></tr>';
            return;
        }

        clientes.forEach(c => {
            // Preparamos el objeto para pasarlo al modal (truco para no hacer otra petición)
            // Convertimos a string seguro para HTML
            const clienteString = encodeURIComponent(JSON.stringify(c));

            const row = `
                <tr>
                    <td class="ps-4 text-muted small">#${c.idUsuario}</td>
                    <td>
                        <div class="fw-bold text-white">${c.persona.nombre} ${c.persona.primerApellido}</div>
                        <small class="text-muted">ID Persona: ${c.persona.idPersona}</small>
                    </td>
                    <td class="text-gold font-monospace">${c.login}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-light me-2 border-0" onclick="prepararModalCliente('${clienteString}')" title="Editar datos">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="confirmarBanearCliente(${c.idUsuario})" title="Eliminar cuenta">
                            <i class="bi bi-person-x-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch(e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Error de conexión.</td></tr>';
    }
}

function confirmarBanearCliente(id) {
    Swal.fire({
        title: '¿Banear Cliente?',
        text: "Se eliminará su cuenta y su historial de citas.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, banear',
        background: '#1e1e1e', 
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // Endpoint estándar para borrar usuario (Asegúrate de que tu backend soporte DELETE /usuarios/{id})
                const resp = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
                
                if (resp.ok) {
                    Swal.fire({
                        title: 'Eliminado', 
                        text: 'El cliente ha sido dado de baja.', 
                        icon: 'success',
                        background: '#1e1e1e', color: '#fff',
                        confirmButtonColor: '#d4af37'
                    });
                    cargarGestionClientes(); // Recargar tabla
                    cargarClientes(); // Recargar el select de agendar cita también
                } else {
                    Swal.fire('Error', 'No se pudo eliminar (Tal vez tiene citas activas).', 'error');
                }
            } catch (e) {
                console.error(e);
                Swal.fire('Error', 'Fallo de conexión.', 'error');
            }
        }
    });
}

// ==========================================
//  EDITAR CLIENTE (ADMIN)
// ==========================================

function prepararModalCliente(clienteEncoded) {
    // Decodificamos el string que mandamos desde el HTML
    const cliente = JSON.parse(decodeURIComponent(clienteEncoded));
    
    // Referencias
    const modalEl = document.getElementById('modalClienteAdmin');
    document.getElementById('cliId').value = cliente.idUsuario;
    document.getElementById('cliNombre').value = cliente.persona.nombre;
    document.getElementById('cliApellido').value = cliente.persona.primerApellido;
    document.getElementById('cliLogin').value = cliente.login;
    document.getElementById('cliPass').value = ''; // Siempre limpia la pass

    // Mostrar Modal
    new bootstrap.Modal(modalEl).show();
}

async function guardarClienteAdmin() {
    const id = document.getElementById('cliId').value;
    const nombre = document.getElementById('cliNombre').value;
    const apellido = document.getElementById('cliApellido').value;
    const pass = document.getElementById('cliPass').value;
    const login = document.getElementById('cliLogin').value; // Solo para enviarlo de vuelta si se requiere

    if (!nombre || !apellido) return Swal.fire('Error', 'Nombre y apellido requeridos', 'warning');

    // Armamos el objeto UsuarioDto
    const payload = {
        nombre: nombre,
        primerApellido: apellido,
        login: login,
        idRol: 3, // IMPORTANTE: Mantenemos el rol de CLIENTE (3)
        password: pass ? pass : null // Si escribió algo, lo mandamos, si no, null
    };

    try {
        const resp = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            Swal.fire({
                title: 'Actualizado',
                text: 'Datos del cliente modificados correctamente.',
                icon: 'success',
                confirmButtonColor: '#d4af37',
                background: '#1e1e1e', color: '#fff'
            });
            
            // Cerrar modal y recargar tabla
            const modalEl = document.getElementById('modalClienteAdmin');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if(modalInstance) modalInstance.hide();
            
            cargarGestionClientes();

        } else {
            Swal.fire('Error', 'No se pudo actualizar.', 'error');
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Fallo de conexión.', 'error');
    }
}