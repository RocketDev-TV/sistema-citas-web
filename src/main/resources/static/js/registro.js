// ==========================================
//  CADENERO INVERSO (SI YA TIENES CUENTA, VETE A TU PERFIL)
// ==========================================
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
    const u = JSON.parse(usuarioGuardado);
    if (u.idRol === 1 || u.idRol === 2) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'cliente.html';
    }
}

// ==========================================
//  LÓGICA DE REGISTRO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // OJITO 👁️
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

    const form = document.getElementById('registroForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datos = {
                nombre: document.getElementById('nombre').value,
                primerApellido: document.getElementById('primerApellido').value,
                segundoApellido: null,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                idGenero: parseInt(document.getElementById('idGenero').value),
                login: document.getElementById('login').value,
                password: document.getElementById('password').value
            };

            const btn = e.target.querySelector('button[type="submit"]');
            const textoOriginal = btn.innerText;
            btn.innerText = "Creando...";
            btn.disabled = true;

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
                        text: 'Tu cuenta ha sido creada. Inicia sesión para continuar.',
                        confirmButtonColor: '#cda45e',
                        background: '#1e1e1e',
                        color: '#fff'
                    }).then(() => {
                        // Aquí sí mandamos al index para que se loguee
                        // (Opcional: podrías loguearlo automático, pero es mejor que pruebe su pass)
                        window.location.href = 'index.html'; 
                    });
                } else {
                    const error = await respuesta.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || "No se pudo crear la cuenta.",
                        background: '#1e1e1e', color: '#fff',
                        confirmButtonText: 'Revisar'
                    });
                    btn.innerText = textoOriginal;
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error', 
                    title: 'Error', 
                    text: 'Fallo de conexión con el servidor', 
                    background: '#1e1e1e', color: '#fff'
                });
                btn.innerText = textoOriginal;
                btn.disabled = false;
            } 
        });
    }
});