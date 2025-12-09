// ==========================================
//  UTILERÍA: ALERTAS MAMALONAS 🔔
// ==========================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    Swal.fire({
        title: tipo === 'success' ? '¡Éxito!' : (tipo === 'error' ? 'Error' : 'Atención'),
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Entendido',
        // Estilos definidos en global.css
    });
}

// ==========================================
//  LÓGICA INICIAL (CLIENTE)
// ==========================================

const usuarioJson = localStorage.getItem('usuario');
if (!usuarioJson) {
    window.location.href = 'index.html';
}
const usuario = JSON.parse(usuarioJson);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nombreCliente').textContent = usuario.persona.nombre.toUpperCase();
    
    cargarMisCitas();
    cargarCatalogos(); 
});

// ==========================================
//  CARGAR MIS CITAS (CARDS)
// ==========================================

async function cargarMisCitas() {
    try {
        const respuesta = await fetch('/api/citas');
        if (!respuesta.ok) throw new Error('Error al obtener citas');
        
        const todasLasCitas = await respuesta.json();
        
        // FILTRO: SOLO MIS CITAS
        const misCitas = todasLasCitas.filter(c => c.cliente.idPersona === usuario.persona.idPersona);
        
        const contenedor = document.getElementById('contenedorMisCitas');
        contenedor.innerHTML = '';

        if (misCitas.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-calendar-x display-1 text-muted opacity-25"></i>
                    <p class="text-muted mt-3">Aún no tienes cortes programados.</p>
                    <button class="btn btn-outline-warning btn-sm" onclick="new bootstrap.Modal('#modalNuevaCita').show()">¡Agenda el primero!</button>
                </div>`;
            return;
        }

        misCitas.forEach(cita => {
            const folio = cita.idCita.toString().padStart(4, '0');
            
            let fechaTexto = "Fecha Pendiente";
            let horaTexto = "--:--";
            
            if (cita.bloqueCita && cita.bloqueCita.fechaInicio) {
                const f = new Date(cita.bloqueCita.fechaInicio);
                fechaTexto = f.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
                horaTexto = f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            }

            const card = `
                <div class="col-md-6">
                    <div class="card bg-dark border-secondary h-100 shadow-sm service-card" style="cursor: default; padding: 0;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3 align-items-center">
                                <span class="badge bg-warning text-dark fw-bold">CONFIRMADA</span>
                                <small class="text-muted">FOLIO #${folio}</small>
                            </div>
                            
                            <h4 class="text-white mb-1">${cita.servicio.nombre}</h4>
                            <p class="text-white-50 small mb-3 fst-italic">
                                <i class="bi bi-geo-alt-fill text-warning me-1"></i> ${cita.sucursal.nombre}
                            </p>
                            
                            <div class="p-3 rounded-3 mb-3" style="background-color: #222;">
                                <div class="d-flex align-items-center text-white">
                                    <div class="me-3 display-6"><i class="bi bi-person-circle"></i></div>
                                    <div>
                                        <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem;">Tu Barbero</small>
                                        <span class="fw-bold">${cita.empleado.persona.nombre}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-end border-top border-secondary pt-3">
                                <div>
                                    <small class="text-muted d-block">Horario</small>
                                    <span class="text-white fw-bold">${horaTexto}</span>
                                    <div class="text-warning small text-capitalize">${fechaTexto}</div>
                                </div>
                                
                                <button class="btn btn-outline-danger btn-sm border-0" onclick="confirmarCancelacion(${cita.idCita})">
                                    <i class="bi bi-x-circle me-1"></i> Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedor.innerHTML += card;
        });

    } catch (error) {
        console.error(error);
        mostrarNotificacion('No se pudo cargar la agenda.', 'error');
    }
}

// ==========================================
//  LÓGICA DEL MODAL (REUTILIZADA)
// ==========================================

async function cargarCatalogos() {
    try {
        const respServicios = await fetch('/api/servicios');
        const servicios = await respServicios.json();
        
        const container = document.getElementById('containerServicios');
        if(container) {
            container.innerHTML = '';
            servicios.forEach(serv => {
                let precioSimulado = 200; 
                if (serv.idServicio === 2) precioSimulado = 180;
                if (serv.idServicio === 3) precioSimulado = 350;
                if (serv.idServicio === 4) precioSimulado = 600;
                if (serv.idServicio === 5) precioSimulado = 250;
                if (serv.idServicio === 6) precioSimulado = 150;

                let desc = serv.descripcion || "Servicio profesional.";

                const col = document.createElement('div');
                col.className = 'col-md-6'; 
                col.innerHTML = `
                    <div class="service-card" onclick="seleccionarServicio(this, ${serv.idServicio}, ${serv.duracion}, ${precioSimulado})">
                        <i class="bi bi-scissors service-icon-bg"></i>
                        <div class="service-header">
                            <div class="service-title">${serv.nombre}</div>
                            <div class="service-price">$${precioSimulado}</div>
                        </div>
                        <p class="service-desc">"${desc}"</p>
                        <div class="mt-3 text-end">
                            <span class="badge bg-dark border border-secondary text-white-50 rounded-pill fw-normal" style="font-size: 0.7rem;">
                                ⏱ ${serv.duracion} min
                            </span>
                        </div>
                    </div>
                `;
                container.appendChild(col);
            });
        }

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

    } catch (error) {
        console.error("Error catálogos:", error);
    }
}

function llenarSelect(id, datos, campoValor, campoTexto, textoDefault = 'Selecciona...') {
    const sel = document.getElementById(id);
    if(sel) {
        sel.innerHTML = `<option value="" selected disabled>${textoDefault}</option>`;
        datos.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d[campoValor];
            opt.textContent = d[campoTexto];
            sel.appendChild(opt);
        });
    }
}

function seleccionarServicio(card, id, duracion, precio) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('inputServicioId').value = id;
    document.getElementById('inputServicioDuracion').value = duracion;
    document.getElementById('txtTotal').textContent = `$${precio.toFixed(2)}`;
    actualizarInfoTiempo();
}

const inputFecha = document.getElementById('fechaInicio');
if(inputFecha) {
    inputFecha.addEventListener('change', actualizarInfoTiempo);
}

function actualizarInfoTiempo() {
    const inicioVal = document.getElementById('fechaInicio').value;
    const duracion = parseInt(document.getElementById('inputServicioDuracion').value);
    const txtHoraFin = document.getElementById('txtHoraFin');

    if (inicioVal && duracion) {
        const fechaInicio = new Date(inicioVal);
        const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
        const horaFinStr = fechaFin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        txtHoraFin.textContent = `${horaFinStr} hrs`;
        txtHoraFin.className = 'text-warning fw-bold';
    } else {
        txtHoraFin.textContent = "--:--";
        txtHoraFin.className = 'text-white fw-bold';
    }
}

// ==========================================
//  GUARDAR CITA (CON SWEETALERT)
// ==========================================

async function guardarCita() {
    const idServicio = document.getElementById('inputServicioId').value;
    const duracion = parseInt(document.getElementById('inputServicioDuracion').value);
    const idSucursal = document.getElementById('selectSucursal').value;
    const idEmpleado = document.getElementById('selectEmpleado').value;
    const fechaInicioVal = document.getElementById('fechaInicio').value; 

    if (!idServicio || !idSucursal || !idEmpleado || !fechaInicioVal) {
        Swal.fire({
            icon: 'warning',
            title: 'Faltan datos',
            text: 'Por favor selecciona servicio, sucursal, barbero y fecha.',
            confirmButtonText: 'OK'
        });
        return;
    }

    const fechaInicioObj = new Date(fechaInicioVal);
    const fechaFinObj = new Date(fechaInicioObj.getTime() + duracion * 60000);

    const toIsoString = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return date.getFullYear() + '-' +
               pad(date.getMonth() + 1) + '-' +
               pad(date.getDate()) + 'T' +
               pad(date.getHours()) + ':' +
               pad(date.getMinutes()) + ':00';
    };

    const nuevaCita = {
        idCliente: usuario.persona.idPersona,
        idServicio: parseInt(idServicio),
        idSucursal: parseInt(idSucursal),
        idEmpleado: parseInt(idEmpleado),
        fechaInicio: toIsoString(fechaInicioObj),
        fechaFin: toIsoString(fechaFinObj)
    };

    try {
        const btn = document.querySelector('button[onclick="guardarCita()"]');
        btn.innerText = "Agendando...";
        btn.disabled = true;

        const respuesta = await fetch('/api/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCita)
        });

        if (respuesta.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Cita Agendada!',
                text: 'Te esperamos para tu corte.',
                confirmButtonText: 'Genial'
            }).then(() => {
                const modalEl = document.getElementById('modalNuevaCita');
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.hide();
                cargarMisCitas();
            });
        } else {
            const error = await respuesta.json();
            Swal.fire({
                icon: 'error',
                title: 'Ups...',
                text: error.message || "Ese horario ya está ocupado.",
                confirmButtonText: 'Entendido'
            });
        }
    } catch (e) {
        console.error(e);
        mostrarNotificacion("No pudimos conectar con el servidor.", "error");
    } finally {
        const btn = document.querySelector('button[onclick="guardarCita()"]');
        if(btn) {
            btn.innerText = "Confirmar";
            btn.disabled = false;
        }
    }
}

// ==========================================
//  CANCELAR CITA (CLIENTE) 🗑️
// ==========================================
function confirmarCancelacion(idCita) {
    Swal.fire({
        title: '¿Cancelar tu corte?',
        text: "Perderás tu lugar en la agenda.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Conservar',
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
            Swal.fire({
                title: 'Cancelada',
                text: 'Tu cita ha sido eliminada.',
                icon: 'success',
                confirmButtonText: 'OK',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#cda45e'
            });
            cargarMisCitas(); // Recargar tarjetas
        } else {
            Swal.fire({icon:'error', title:'Error', text:'No se pudo cancelar', background:'#1e1e1e', color:'#fff'});
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