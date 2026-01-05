// ==========================================
//  VARIABLES GLOBALES Y UTILERÍAS
// ==========================================
const API_URL = '/api';
let currentUser = null;
let todosLosEmpleados = [];

// --- ESTA ES LA PARTE QUE FALTABA ---
// Se ejecuta automáticamente al cargar el archivo para leer la sesión
(function init() {
    const usuarioGuardado = localStorage.getItem('usuario');
    
    // Si no hay sesión, va para afuera
    if (!usuarioGuardado) { 
        window.location.href = 'index.html'; 
        return;
    }

    // Cargamos el usuario en la variable global
    currentUser = JSON.parse(usuarioGuardado);

    // Validación de seguridad extra (Opcional)
    if (currentUser.idRol !== 1 && currentUser.idRol !== 2) {
        window.location.href = 'cliente.html';
    }
})();
// -------------------------------------

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// Helper ojo (Ver/Ocultar contraseña)
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

// Helper para llenar selects
function llenarSelect(id, datos, valor, texto) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
    datos.forEach(d => {
        // Truco para leer propiedades anidadas como "persona.nombre"
        const txt = texto.split('.').reduce((o, i) => o?.[i], d); 
        const opt = document.createElement('option');
        opt.value = d[valor];
        opt.textContent = txt;
        sel.appendChild(opt);
    });
}

// Helper para actualizar hora fin en los formularios
function actualizarInfoTiempo() {
    const fechaInput = document.getElementById('fechaInicio');
    const duracionInput = document.getElementById('inputServicioDuracion');
    const txtHoraFin = document.getElementById('txtHoraFin');

    if (fechaInput && duracionInput && txtHoraFin) {
        const ini = fechaInput.value;
        const dur = parseInt(duracionInput.value);
        
        if (ini && dur) {
            const fin = new Date(new Date(ini).getTime() + dur * 60000);
            txtHoraFin.textContent = fin.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        }
    }
}