// Lógica del Login y el Ojito

const form = document.getElementById('loginForm');
const alertError = document.getElementById('alertError');

// LÓGICA DEL OJITO 👁️
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const iconEye = document.getElementById('iconEye');

if (togglePassword) {
    togglePassword.addEventListener('click', function () {
        // Cambiar el tipo de input
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar el ícono (Ojo abierto / Ojo tachado)
        iconEye.classList.toggle('bi-eye');
        iconEye.classList.toggle('bi-eye-slash');
    });
}

// LÓGICA DE LOGIN
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
                localStorage.setItem('usuario', JSON.stringify(usuario));
                // Redirigir
                window.location.href = 'dashboard.html';
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

function mostrarError(msg) {
    alertError.textContent = msg;
    alertError.classList.remove('d-none');
    alertError.innerText = msg; // Asegura que se actualice el texto
}