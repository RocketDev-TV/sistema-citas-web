// ==========================================
//  MI PERFIL
// ==========================================

function abrirMiPerfil() {
    document.getElementById('perfilNombre').value = currentUser.persona.nombre;
    document.getElementById('perfilPrimerApellido').value = currentUser.persona.primerApellido;
    document.getElementById('perfilSegundoApellido').value = currentUser.persona.segundoApellido || '';
    document.getElementById('perfilFechaNacimiento').value = currentUser.persona.fechaNacimiento ? currentUser.persona.fechaNacimiento.split('T')[0] : '';
    document.getElementById('perfilPass1').value = '';
    document.getElementById('perfilPass2').value = '';
    new bootstrap.Modal(document.getElementById('modalMiPerfil')).show();
}

async function actualizarMiPerfil() {
    const p1 = document.getElementById('perfilPass1').value;
    const p2 = document.getElementById('perfilPass2').value;
    if (p1 && p1 !== p2) return Swal.fire('Error', 'Passwords no coinciden', 'error');

    const payload = {
        idUsuario: currentUser.idUsuario,
        persona: {
            nombre: document.getElementById('perfilNombre').value,
            primerApellido: document.getElementById('perfilPrimerApellido').value,
            segundoApellido: document.getElementById('perfilSegundoApellido').value,
            fechaNacimiento: document.getElementById('perfilFechaNacimiento').value
        },
        password: p1 || null
    };

    const res = await fetch(`${API_URL}/usuarios/perfil`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    if(res.ok) {
        const nuevo = await res.json();
        localStorage.setItem('usuario', JSON.stringify(nuevo));
        currentUser = nuevo;
        Swal.fire('Perfil Actualizado', '', 'success').then(() => location.reload());
    }
}