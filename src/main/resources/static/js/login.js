// ==========================================
//  CADENERO INVERSO (SI YA ESTÁS DENTRO, NO VES LOGIN)
// ==========================================
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
    const u = JSON.parse(usuarioGuardado);
    // Si ya tienes sesión, te mando directo a tu panel
    if (u.idRol === 1 || u.idRol === 2) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'cliente.html';
    }
}

// ==========================================
//  LÓGICA DEL LOGIN
// ==========================================

const form = document.getElementById('loginForm');
const alertError = document.getElementById('alertError');

// LÓGICA DEL OJO
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const iconEye = document.getElementById('iconEye');

if (togglePassword) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        iconEye.classList.toggle('bi-eye');
        iconEye.classList.toggle('bi-eye-slash');
    });
}

// LÓGICA DE SUBMIT
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        alertError.classList.add('d-none');

        const btn = form.querySelector('button[type="submit"]');
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Entrando...';
        btn.disabled = true;

        const datos = {
            login: document.getElementById('login').value,
            password: document.getElementById('password').value
        };

        try {
            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                const usuario = await respuesta.json();
                
                // GUARDAR SESIÓN
                localStorage.setItem('usuario', JSON.stringify(usuario));
                
                // REDIRECCIÓN SEGÚN ROL
                if (usuario.idRol === 1 || usuario.idRol === 2) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'cliente.html';
                }
            } else {
                mostrarError("Credenciales incorrectas.");
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            mostrarError("Sin conexión al servidor.");
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
    });
}

// ==========================================
//  RECUPERACIÓN DE CONTRASEÑA
// ==========================================
async function pedirCorreoRecuperacion() {
    // 1. Pedimos el correo con un SweetAlert bonito
    const { value: correo } = await Swal.fire({
        title: 'Recuperar Cuenta',
        text: 'Ingresa tu correo electrónico registrado. Te enviaremos una contraseña temporal.',
        input: 'email',
        inputPlaceholder: 'ejemplo@gmail.com',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d4af37', // Gold
        background: '#1e1e1e',
        color: '#fff',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        customClass: {
            input: 'bg-dark text-white border-secondary' // Para que el input combine
        }
    });

    // 2. Si el usuario escribió algo y le dio "Enviar"
    if (correo) {
        Swal.fire({
            title: 'Enviando...',
            text: 'Estamos contactando al servidor de correos.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() },
            background: '#1e1e1e', color: '#fff'
        });

        try {
            // 3. Llamamos a tu Backend
            const resp = await fetch('/api/usuarios/recuperar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: correo })
            });

            const data = await resp.json();

            if (resp.ok) {
                Swal.fire({
                    title: '¡Correo Enviado!',
                    text: 'Revisa tu bandeja de entrada (y spam).',
                    icon: 'success',
                    confirmButtonColor: '#d4af37',
                    background: '#1e1e1e', color: '#fff'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.error || 'No pudimos procesar la solicitud.',
                    icon: 'error',
                    background: '#1e1e1e', color: '#fff'
                });
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error de Red',
                text: 'No pudimos conectar con el servidor.',
                icon: 'error',
                background: '#1e1e1e', color: '#fff'
            });
        }
    }
}

function mostrarError(msg) {
    alertError.textContent = msg;
    alertError.classList.remove('d-none');
}