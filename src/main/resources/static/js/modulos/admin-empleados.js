// ==========================================
//  EMPLEADOS Y HORARIOS
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
    const loginInput = document.getElementById('empLogin'); // Referencia al input
    
    if (!id && !pass) return Swal.fire('Error', 'Contraseña requerida para nuevos', 'warning');
    
    const loginReal = loginInput.disabled ? null : loginInput.value; 
    // ----------------------------

    const payload = {
        nombre: document.getElementById('empNombre').value,
        primerApellido: document.getElementById('empPrimerApellido').value,
        segundoApellido: document.getElementById('empSegundoApellido').value,
        fechaNacimiento: document.getElementById('empFechaNacimiento').value,
        idSucursal: parseInt(document.getElementById('empSucursal').value),
        
        login: loginReal,
        
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
            const mensajeError = err.message || "No se pudo guardar el empleado.";
            
            Swal.fire('Atención', mensajeError, 'warning');
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

// --- HORARIOS ---
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

// --- STAFF VIEW (MI HORARIO) ---
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

// ==========================================
//  VALIDACIÓN EN TIEMPO REAL (Anti-Duplicados)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Identificamos el input de usuario y el botón de guardar
    const inputLogin = document.getElementById('empLogin');
    // Buscamos el botón "GUARDAR" dentro del modal de empleados
    const btnGuardar = document.querySelector('#modalEmpleado .modal-footer .btn-warning'); 

    if (inputLogin && btnGuardar) {
        
        // 2. Escuchamos cuando el usuario escribe
        inputLogin.addEventListener('input', async function() {
            const login = this.value.trim();

            // A. Si borró todo o es muy corto, reseteamos colores y soltamos botón
            if (login.length < 3) {
                this.classList.remove('is-invalid', 'is-valid');
                btnGuardar.disabled = false;
                return;
            }

            // B. Si el input está deshabilitado (Modo Edición), no validamos
            if (this.disabled) return;

            try {
                // C. Preguntamos al Backend: ¿Existe este login?
                const res = await fetch(`${API_URL}/usuarios/existe/${login}`);
                const existe = await res.json();

                if (existe) {
                    // ¡YA EXISTE! -> Rojo, Bloquear botón y mostrar mensaje
                    this.classList.add('is-invalid'); // Borde rojo
                    this.classList.remove('is-valid');
                    
                    // (Opcional) Si quieres ser muy explícito, usa un Tooltip o un pequeño texto abajo
                    // Pero con el borde rojo y botón bloqueado suele bastar.
                    
                    btnGuardar.disabled = true; // Bloqueamos el click
                } else {
                    // ¡DISPONIBLE! -> Verde y Activar botón
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid'); // Borde verde
                    btnGuardar.disabled = false; // Permitimos guardar
                }
            } catch (e) {
                console.error("Error validando login", e);
            }
        });
    }
});