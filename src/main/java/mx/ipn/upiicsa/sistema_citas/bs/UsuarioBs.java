package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.PersonaRepository;
import mx.ipn.upiicsa.sistema_citas.dao.UsuarioRepository;
import mx.ipn.upiicsa.sistema_citas.dto.UsuarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.Persona;
import mx.ipn.upiicsa.sistema_citas.mv.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
//import java.util.Optional;

@Service
public class UsuarioBs {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PersonaRepository personaRepository;

    // --- MÉTODO 1: REGISTRAR (Este era el que faltaba) ---
    public Usuario registrar(UsuarioDto dto) {
        // 1. Validar que la persona exista
        Persona persona = personaRepository.findById(dto.getIdPersona())
                .orElseThrow(() -> new RuntimeException("¡Esa persona no existe!"));

        // 2. Validar que el login no esté repetido
        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("¡Ese usuario ya está apartado, escoge otro!");
        }

        // 3. Crear el usuario
        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setLogin(dto.getLogin());
        usuario.setPassword(dto.getPassword()); 
        usuario.setIdRol(dto.getIdRol());
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    // --- MÉTODO 2: LOGIN (Este ya lo tenías) ---
    public Usuario login(String login, String password) {
        // 1. Buscamos al usuario por su "nick"
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("¡Usuario no encontrado!"));

        // 2. Validamos la contraseña 
        if (!usuario.getPassword().equals(password)) {
            throw new RuntimeException("¡Contraseña incorrecta, perro!");
        }

        // 3. Validamos si está activo
        if (!usuario.getActivo()) {
            throw new RuntimeException("¡Tu cuenta está desactivada!");
        }

        return usuario;
    }
}