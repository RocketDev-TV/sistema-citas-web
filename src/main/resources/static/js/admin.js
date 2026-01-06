// ==========================================
//  MAIN (Lógica Principal)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    document.body.style.display = 'block';

    if (!currentUser) return; 

    document.getElementById('nombreUsuario').textContent = `${currentUser.persona.nombre} ${currentUser.persona.primerApellido}`.toUpperCase();
    document.getElementById('rolUsuario').textContent = currentUser.idRol === 1 ? 'ADMIN' : 'STAFF';
    
    await actualizarSucursalNavbar();

    if (currentUser.idRol === 2) {
        ['pills-equipo-tab', 'pills-servicios-tab', 'pills-sucursales-tab', 'pills-clientes-tab'].forEach(id => {
            const tab = document.getElementById(id);
            if(tab) tab.remove();
        });
        
        const btnAgendar = document.querySelector('button[data-bs-target="#modalNuevaCita"]');
        if(btnAgendar) {
            const btnHorario = document.createElement('button');
            btnHorario.className = 'btn btn-outline-light me-2 fw-bold';
            btnHorario.innerHTML = '<i class="bi bi-calendar3 me-2"></i>Mi Horario';
            btnHorario.onclick = () => { if(window.verMiHorario) window.verMiHorario(); }; 
            btnAgendar.parentNode.insertBefore(btnHorario, btnAgendar);
        }
    }

    cargarClientes();
    cargarCitas();
    cargarCatalogos();
    if(currentUser.idRol === 1) cargarEmpleados();

    setupToggle('toggleEmpPass', 'empPass', 'iconEmpPass');
    setupToggle('toggleEmpPassConfirm', 'empPassConfirm', 'iconEmpPassConfirm');
    setupToggle('togglePerfilPass', 'perfilPass1', 'iconPerfilPass');
    setupToggle('toggleCliPass', 'cliPass', 'iconCliPass');
    
    const fInput = document.getElementById('fechaInicio');
    if(fInput) fInput.addEventListener('change', actualizarInfoTiempo);
});

// --- FUNCIÓN NUEVA PARA EL NAVBAR ---
async function actualizarSucursalNavbar() {
    const lblSuc = document.getElementById('sucursalUsuario');
    if (!lblSuc) return;

    try {
        if (currentUser.sucursal) {
            pintarSucursal(lblSuc, currentUser.sucursal.nombre);
            return;
        }

        const res = await fetch(`${API_URL}/empleados`);
        const empleados = await res.json();

        const miEmpleado = empleados.find(e => e.persona.idPersona === currentUser.persona.idPersona);

        if (miEmpleado && miEmpleado.sucursal) {

            pintarSucursal(lblSuc, miEmpleado.sucursal.nombre);

            currentUser.sucursal = miEmpleado.sucursal; 
            currentUser.idEmpleado = miEmpleado.idEmpleado;
        } else if (currentUser.idRol === 1) {
            lblSuc.textContent = "CORPORATIVO";
        } else {
            lblSuc.innerHTML = '<span class="text-danger small">Sin Sucursal Asignada</span>';
        }

    } catch (e) {
        console.error("Error buscando sucursal para el navbar:", e);
    }
}

function pintarSucursal(elemento, nombre) {
    elemento.innerHTML = `<i class="bi bi-geo-alt-fill me-1 text-warning"></i><span class="text-warning fw-bold" style="letter-spacing: 1px;">${nombre}</span>`;
}