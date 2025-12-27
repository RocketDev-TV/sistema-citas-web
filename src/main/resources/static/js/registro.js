// ==========================================
//  CADENERO INVERSO
// ==========================================
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
    const u = JSON.parse(usuarioGuardado);
    window.location.href = (u.idRol === 1 || u.idRol === 2) ? 'admin.html' : 'cliente.html';
}

document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS DOM ---
    const passInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const btnSubmit = document.querySelector('button[type="submit"]');
    const msgCoincide = document.getElementById('msgCoincide');

    // Reglas UI
    const rules = {
        len: { regex: /.{8,}/, el: document.getElementById('ruleLen') },
        mayus: { regex: /[A-Z]/, el: document.getElementById('ruleMayus') },
        num: { regex: /[0-9]/, el: document.getElementById('ruleNum') },
        char: { regex: /[!@#$%^&*(),.?":{}|<>\-_]/, el: document.getElementById('ruleChar') }
    };

    // Deshabilitar botón al inicio
    btnSubmit.disabled = true;

    // --- FUNCIÓN DE VALIDACIÓN EN TIEMPO REAL ---
    function validarFormulario() {
        const val = passInput.value;
        const valConfirm = confirmInput.value;
        let todasLasReglasOk = true;

        // 1. Checar Reglas de Regex
        for (const key in rules) {
            const rule = rules[key];
            const icon = rule.el.querySelector('i');
            
            if (rule.regex.test(val)) {
                // Cumple la regla
                rule.el.classList.add('rule-valid');
                rule.el.classList.remove('text-secondary');
                icon.className = 'bi bi-check-circle-fill me-2'; // Check relleno
            } else {
                // No cumple
                rule.el.classList.remove('rule-valid');
                rule.el.classList.add('text-secondary');
                todasLasReglasOk = false;
                icon.className = 'bi bi-circle me-2'; // Circulo vacío
            }
        }

        // 2. Checar que coincidan
        const coinciden = (val === valConfirm && val.length > 0);
        if (valConfirm.length > 0 && !coinciden) {
            msgCoincide.classList.remove('d-none');
        } else {
            msgCoincide.classList.add('d-none');
        }

        // 3. Activar/Desactivar Botón
        if (todasLasReglasOk && coinciden) {
            btnSubmit.disabled = false;
            btnSubmit.classList.remove('opacity-50');
        } else {
            btnSubmit.disabled = true;
            btnSubmit.classList.add('opacity-50');
        }
    }

    // --- LISTENERS ---
    passInput.addEventListener('input', validarFormulario);
    confirmInput.addEventListener('input', validarFormulario);

    // --- TOGGLE PASSWORDS (OJITOS) ---
    setupToggle('togglePassword', 'password', 'iconEye');
    setupToggle('toggleConfirmPassword', 'confirmPassword', 'iconEyeConfirm');

    function setupToggle(btnId, inputId, iconId) {
        const btn = document.getElementById(btnId);
        if(btn){
            btn.addEventListener('click', () => {
                const input = document.getElementById(inputId);
                const icon = document.getElementById(iconId);
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            });
        }
    }

    // --- ENVÍO DEL FORMULARIO (POST) ---
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const passVal = passInput.value;
            const confirmVal = confirmInput.value;
            const correoVal = document.getElementById('correo').value;

            if(passVal !== confirmVal) {
                Swal.fire({icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.'});
                return;
            }

            if(!correoVal) {
                Swal.fire({icon: 'warning', title: 'Falta Correo', text: 'El correo es necesario para recuperar tu cuenta.'});
                return;
            }

            // Validacion de formato de correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(correoVal)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Correo Inválido',
                    text: 'Por favor escribe un correo real (ejemplo: usuario@gmail.com).',
                    background: '#1e1e1e', 
                    color: '#fff',
                    confirmButtonColor: '#d33'
                });
                return;
            }

            // Última validación de seguridad antes de enviar
            if(passInput.value !== confirmInput.value) {
                Swal.fire({icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.'});
                return;
            }

            const datos = {
                nombre: document.getElementById('nombre').value,
                primerApellido: document.getElementById('primerApellido').value,
                segundoApellido: null,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                idGenero: parseInt(document.getElementById('idGenero').value),
                login: document.getElementById('login').value,
                password: passInput.value,
                correo: correoVal,
                login: document.getElementById('login').value
            };

            const textoOriginal = btnSubmit.innerText;
            btnSubmit.innerText = "Creando...";
            btnSubmit.disabled = true;

            try {
                const respuesta = await fetch('/api/usuarios/nuevo-cliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (respuesta.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Tu cuenta ha sido creada. Inicia sesión.',
                        confirmButtonColor: '#cda45e',
                        background: '#1e1e1e', color: '#fff'
                    }).then(() => {
                        window.location.href = 'index.html'; 
                    });
                } else {
                    const error = await respuesta.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Ups',
                        text: error.message || "Error al crear cuenta.",
                        background: '#1e1e1e', color: '#fff'
                    });
                    btnSubmit.innerText = textoOriginal;
                    // Revalidar para ver si habilitamos el botón de nuevo
                    validarFormulario(); 
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error', title: 'Error', text: 'Fallo de conexión.', background: '#1e1e1e', color: '#fff'
                });
                btnSubmit.innerText = textoOriginal;
                validarFormulario();
            } 
        });
    }
});