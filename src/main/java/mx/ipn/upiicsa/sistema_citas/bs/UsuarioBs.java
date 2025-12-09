package mx.ipn.upiicsa.sistema_citas.bs;

import jakarta.transaction.Transactional; // <--- Importante para guardar 2 cosas a la vez
import mx.ipn.upiicsa.sistema_citas.dao.PersonaRepository;
import mx.ipn.upiicsa.sistema_citas.dao.UsuarioRepository;
import mx.ipn.upiicsa.sistema_citas.dto.RegistroClienteDto; // <--- Importante
import mx.ipn.upiicsa.sistema_citas.dto.UsuarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.Persona;
import mx.ipn.upiicsa.sistema_citas.mv.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioBs {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PersonaRepository personaRepository;

    // --- MÉTODO 1: REGISTRAR ADMIN/EMPLEADO (Existente) ---
    public Usuario registrar(UsuarioDto dto) {
        Persona persona = personaRepository.findById(dto.getIdPersona())
                .orElseThrow(() -> new RuntimeException("¡Esa persona no existe!"));

        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("¡Ese usuario ya está apartado, escoge otro!");
        }

        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setLogin(dto.getLogin());
        usuario.setPassword(dto.getPassword()); 
        usuario.setIdRol(dto.getIdRol());
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    // --- MÉTODO 2: LOGIN ---
    public Usuario login(String login, String password) {
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("¡Usuario no encontrado!"));

        if (!usuario.getPassword().equals(password)) {
            throw new RuntimeException("¡Contraseña incorrecta, perro!");
        }

        if (!usuario.getActivo()) {
            throw new RuntimeException("¡Tu cuenta está desactivada!");
        }

        return usuario;
    }

    // --- MÉTODO 3: REGISTRO PÚBLICO (NUEVO CLIENTE) ---
    @Transactional 
    public Usuario registrarClienteNuevo(RegistroClienteDto dto) {
        // 1. Validar usuario duplicado
        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("¡Ese usuario ya está ocupado! Escoge otro.");
        }

        // 2. Crear Persona
        Persona nuevaPersona = new Persona();
        nuevaPersona.setNombre(dto.getNombre());
        nuevaPersona.setPrimerApellido(dto.getPrimerApellido());
        nuevaPersona.setSegundoApellido(dto.getSegundoApellido());
        nuevaPersona.setFechaNacimiento(dto.getFechaNacimiento());
        nuevaPersona.setIdGenero(dto.getIdGenero());
        
        Persona personaGuardada = personaRepository.save(nuevaPersona);

        // 3. Crear Usuario (Rol 3 = Cliente)
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setPersona(personaGuardada);
        nuevoUsuario.setLogin(dto.getLogin());
        nuevoUsuario.setPassword(dto.getPassword());
        nuevoUsuario.setActivo(true);
        nuevoUsuario.setIdRol(3); 

        return usuarioRepository.save(nuevoUsuario);
    }

} 