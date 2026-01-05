// ==========================================
//  CATÁLOGOS (SERVICIOS Y SUCURSALES)
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
                    </div>`;
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

function filtrarBarberosPorSucursal(idSucursal) {
    const selectEmp = document.getElementById('selectEmpleado');
    if (!selectEmp) return;
    const id = parseInt(idSucursal);
    const barberosDisponibles = todosLosEmpleados.filter(emp => emp.sucursal && emp.sucursal.idSucursal === id);

    if (barberosDisponibles.length > 0) {
        llenarSelect('selectEmpleado', barberosDisponibles, 'idEmpleado', 'persona.nombre');
    } else {
        selectEmp.innerHTML = '<option value="" selected disabled>Sin barberos en esta sede</option>';
    }
}

function seleccionarServicio(card, id, dur, precio) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('inputServicioId').value = id;
    document.getElementById('inputServicioDuracion').value = dur;
    document.getElementById('txtTotal').textContent = `$${precio.toFixed(2)}`;
    actualizarInfoTiempo();
}

// --- CRUD SERVICIOS ---
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

// --- CRUD SUCURSALES ---
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
function toggleEdicionHorarios() {
    const check = document.getElementById('checkEditHorario');
    const div = document.getElementById('divConfigHorarios');
    
    if (check.checked) {
        div.classList.remove('d-none'); // Mostrar panel
    } else {
        div.classList.add('d-none'); // Ocultar panel
    }
}