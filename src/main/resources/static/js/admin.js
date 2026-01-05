// ==========================================
//  MAIN 
// ==========================================

// js/admin.js (Completo)

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.display = 'block';

    // Si por alguna razón globales.js falló, detenemos aquí
    if (!currentUser) return; 

    // 1. UI Navbar
    document.getElementById('nombreUsuario').textContent = `${currentUser.persona.nombre} ${currentUser.persona.primerApellido}`.toUpperCase();
    document.getElementById('rolUsuario').textContent = currentUser.idRol === 1 ? 'ADMIN' : 'STAFF';
    
    // Sucursal en Navbar
    const lblSuc = document.getElementById('sucursalUsuario');
    if(lblSuc) {
        if (currentUser.sucursal) lblSuc.innerHTML = `<i class="bi bi-geo-alt-fill me-1"></i>${currentUser.sucursal.nombre}`;
        else if (currentUser.idRol === 1) lblSuc.textContent = "CORPORATIVO";
    }

    // 2. Seguridad Staff
    if (currentUser.idRol === 2) {
        ['pills-equipo-tab', 'pills-servicios-tab', 'pills-sucursales-tab', 'pills-clientes-tab'].forEach(id => {
            const tab = document.getElementById(id);
            if(tab) tab.remove();
        });
        // Botón Mi Horario
        const btnAgendar = document.querySelector('button[data-bs-target="#modalNuevaCita"]');
        if(btnAgendar) {
            const btnHorario = document.createElement('button');
            btnHorario.className = 'btn btn-outline-light me-2 fw-bold';
            btnHorario.innerHTML = '<i class="bi bi-calendar3 me-2"></i>Mi Horario';
            btnHorario.onclick = verMiHorario; // Viene de admin-empleados.js
            btnAgendar.parentNode.insertBefore(btnHorario, btnAgendar);
        }
    }

    // 3. CARGAS INICIALES (Esto es lo que carga la info automáticamente)
    cargarClientes();
    cargarCitas();
    cargarCatalogos();
    if(currentUser.idRol === 1) cargarEmpleados();

    // 4. Listeners
    setupToggle('toggleEmpPass', 'empPass', 'iconEmpPass');
    setupToggle('toggleEmpPassConfirm', 'empPassConfirm', 'iconEmpPassConfirm');
    setupToggle('togglePerfilPass', 'perfilPass1', 'iconPerfilPass');
    setupToggle('toggleCliPass', 'cliPass', 'iconCliPass');
    
    const fInput = document.getElementById('fechaInicio');
    if(fInput) fInput.addEventListener('change', actualizarInfoTiempo);
});