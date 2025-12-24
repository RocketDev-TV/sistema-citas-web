// ==========================================
//  GLOBALES
// ==========================================
const API_URL = '/api';
const usuarioJson = localStorage.getItem('usuario');

if (!usuarioJson) { window.location.href = 'index.html'; throw new Error("Sin sesión"); }

let currentUser = JSON.parse(usuarioJson);

// Redirección si es admin
if (currentUser.idRol == 1 || currentUser.idRol == 2) {
    window.location.href = 'admin.html';
}

document.body.style.display = "block";

document.addEventListener('DOMContentLoaded', () => {
    // Info Usuario
    const nombreCompleto = `${currentUser.persona.nombre} ${currentUser.persona.primerApellido}`.toUpperCase();
    document.getElementById('nombreCliente').textContent = nombreCompleto;
    document.getElementById('saludoGigante').textContent = currentUser.persona.nombre.toUpperCase();

    cargarMisCitas();
    cargarCatalogos();
    
    // SETUP OJITOS PERFIL 👁️
    setupToggle('togglePerfilPass', 'perfilPass', 'iconPerfilPass');
    setupToggle('togglePerfilPassConfirm', 'perfilPassConfirm', 'iconPerfilPassConfirm');
});

// ==========================================
//  MI PERFIL (LÓGICA CLIENTE)
// ==========================================
function abrirMiPerfil() {
    document.getElementById('perfilNombreDisplay').textContent = currentUser.persona.nombre;
    document.getElementById('perfilNombre').value = currentUser.persona.nombre;
    document.getElementById('perfilApellido').value = currentUser.persona.primerApellido;
    document.getElementById('perfilPass').value = '';
    document.getElementById('perfilPassConfirm').value = '';
    
    new bootstrap.Modal(document.getElementById('modalMiPerfil')).show();
}

async function actualizarMiPerfil() {
    const nombre = document.getElementById('perfilNombre').value;
    const apellido = document.getElementById('perfilApellido').value;
    const pass = document.getElementById('perfilPass').value;
    const passConfirm = document.getElementById('perfilPassConfirm').value;

    if (!nombre || !apellido) return Swal.fire('Error', 'Nombre requerido', 'warning');
    if (pass && pass !== passConfirm) return Swal.fire('Error', 'Contraseñas no coinciden', 'error');

    const payload = {
        nombre: nombre,
        primerApellido: apellido,
        idRol: 3, // IMPORTANTE: Mantenemos rol CLIENTE (3)
        password: pass ? pass : null
    };

    try {
        const resp = await fetch(`${API_URL}/usuarios/${currentUser.idUsuario}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            const userActualizado = await resp.json();
            // Mantenemos el login original si el backend no lo devuelve (a veces pasa)
            if(!userActualizado.login) userActualizado.login = currentUser.login;
            
            localStorage.setItem('usuario', JSON.stringify(userActualizado));
            currentUser = userActualizado;

            Swal.fire('¡Listo!', 'Datos actualizados.', 'success').then(() => location.reload());
        } else {
            Swal.fire('Error', 'No se pudo actualizar.', 'error');
        }
    } catch (e) { console.error(e); }
}

// Helper Ojito
function setupToggle(btnId, inpId, iconId) {
    const btn = document.getElementById(btnId);
    if(btn) {
        btn.addEventListener('click', () => {
            const inp = document.getElementById(inpId);
            const ico = document.getElementById(iconId);
            inp.type = inp.type === 'password' ? 'text' : 'password';
            ico.classList.toggle('bi-eye');
            ico.classList.toggle('bi-eye-slash');
        });
    }
}


// ==========================================
//  AGENDA Y CITAS (LO QUE YA FUNCIONABA)
// ==========================================
async function cargarMisCitas() {
    try {
        const res = await fetch(`${API_URL}/citas`);
        if(!res.ok) return;
        const todas = await res.json();
        const misCitas = todas.filter(c => c.cliente.idPersona === currentUser.persona.idPersona);
        
        const div = document.getElementById('contenedorMisCitas');
        div.innerHTML = '';
        
        if(misCitas.length === 0) {
            div.innerHTML = `<div class="col-12 text-center py-5 text-muted"><p>No tienes citas próximas.</p></div>`;
            return;
        }

        misCitas.forEach(c => {
            // ... (Tu renderizado de tarjeta original) ...
            const f = new Date(c.bloqueCita.fechaInicio);
            const fecha = f.toLocaleDateString('es-MX', {weekday:'long', day:'numeric', month:'long'});
            const hora = f.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'});

            const html = `
                <div class="col-md-6">
                    <div class="service-card p-4 h-100" style="cursor: default;">
                        <div class="d-flex justify-content-between mb-3">
                             <span class="badge bg-warning text-dark">CONFIRMADA</span>
                             <small class="text-muted">#${c.idCita}</small>
                        </div>
                        <h4 class="text-white mb-1">${c.servicio.nombre}</h4>
                        <p class="text-secondary small mb-3"><i class="bi bi-geo-alt me-1"></i> ${c.sucursal.nombre}</p>
                        
                        <div class="p-3 bg-black bg-opacity-25 rounded mb-3">
                            <div class="d-flex align-items-center gap-3">
                                <i class="bi bi-person-circle fs-2 text-muted"></i>
                                <div><small class="text-muted d-block">Barbero</small><strong>${c.empleado.persona.nombre}</strong></div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-end pt-3 border-top border-secondary">
                            <div><div class="text-white fw-bold">${hora}</div><small class="text-warning text-capitalize">${fecha}</small></div>
                            <button class="btn btn-outline-danger btn-sm border-0" onclick="confirmarCancelacion(${c.idCita})">Cancelar</button>
                        </div>
                    </div>
                </div>`;
            div.innerHTML += html;
        });
    } catch(e) { console.error(e); }
}


// ==========================================
//  CATÁLOGOS (PRECIO REAL + SIN ERRORES)
// ==========================================
async function cargarCatalogos() {
    try {
        // 1. Cargar Servicios
        const respServicios = await fetch(`${API_URL}/servicios`);
        const servicios = await respServicios.json();
        
        const container = document.getElementById('containerServicios');
        if(container) {
            container.innerHTML = '';
            servicios.forEach(serv => {
                // OBTENER PRECIO REAL (Si es null, pone 0)
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

        // 2. Cargar Sucursales
        const respSuc = await fetch(`${API_URL}/sucursales`);
        const sucursales = await respSuc.json();
        llenarSelect('selectSucursal', sucursales, 'idSucursal', 'nombre');
        
        // 3. Cargar Empleados
        const respEmp = await fetch(`${API_URL}/empleados`);
        const empleados = await respEmp.json();
        llenarSelect('selectEmpleado', empleados, 'idEmpleado', 'persona.nombre');

    } catch (error) {
        console.error("Error catálogos:", error);
    }
}

// Helpers globales (Mismos que admin.js pero locales aquí)
function llenarSelect(id, data, val, txt) {
    const s = document.getElementById(id);
    if(s) {
        s.innerHTML = '<option value="" disabled selected>Selecciona...</option>';
        data.forEach(d => {
             const t = txt.split('.').reduce((o,i)=>o?.[i], d);
             s.innerHTML += `<option value="${d[val]}">${t}</option>`;
        });
    }
}
function seleccionarServicio(card, id, dur, price) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('inputServicioId').value = id;
    document.getElementById('inputServicioDuracion').value = dur;
    document.getElementById('txtTotal').textContent = `$${price}.00`;
    actualizarInfoTiempo();
}

document.getElementById('fechaInicio')?.addEventListener('change', actualizarInfoTiempo);
function actualizarInfoTiempo() {
    const ini = document.getElementById('fechaInicio').value;
    const dur = document.getElementById('inputServicioDuracion').value;
    const out = document.getElementById('txtHoraFin');
    if(ini && dur) {
        const d = new Date(new Date(ini).getTime() + dur*60000);
        out.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }
}

async function guardarCita() {
    const cli = currentUser.persona.idPersona;
    const ser = document.getElementById('inputServicioId').value;
    const suc = document.getElementById('selectSucursal').value;
    const emp = document.getElementById('selectEmpleado').value;
    const ini = document.getElementById('fechaInicio').value;
    
    if(!ser || !suc || !emp || !ini) return Swal.fire('Faltan datos', '', 'warning');
    
    // Calcular fin
    const dIni = new Date(ini);
    const dur = document.getElementById('inputServicioDuracion').value;
    const dFin = new Date(dIni.getTime() + dur*60000);
    
    const body = {
        idCliente: cli, idServicio: ser, idSucursal: suc, idEmpleado: emp,
        fechaInicio: dIni.toISOString().slice(0,19),
        fechaFin: dFin.toISOString().slice(0,19)
    };
    
    try {
        const r = await fetch(`${API_URL}/citas`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
        if(r.ok) {
            Swal.fire('Cita Agendada', '', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalNuevaCita')).hide();
            cargarMisCitas();
        } else { Swal.fire('Error', 'Horario ocupado', 'error'); }
    } catch(e) { console.error(e); }
}

function confirmarCancelacion(id) {
    Swal.fire({title:'¿Cancelar?', showCancelButton:true, confirmButtonText:'Sí', confirmButtonColor:'#d33'}).then(r=>{
        if(r.isConfirmed) eliminarCita(id);
    });
}
async function eliminarCita(id){
    await fetch(`${API_URL}/citas/${id}`, {method:'DELETE'});
    cargarMisCitas();
}

function cerrarSesion() { localStorage.clear(); location.href='index.html'; }