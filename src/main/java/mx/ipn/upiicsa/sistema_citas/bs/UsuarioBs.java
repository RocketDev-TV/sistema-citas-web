package mx.ipn.upiicsa.sistema_citas.bs;

import jakarta.transaction.Transactional;
import mx.ipn.upiicsa.sistema_citas.dao.PersonaRepository;
import mx.ipn.upiicsa.sistema_citas.dao.UsuarioRepository;
import mx.ipn.upiicsa.sistema_citas.dto.RegistroClienteDto;
import mx.ipn.upiicsa.sistema_citas.dto.UsuarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.Persona;
import mx.ipn.upiicsa.sistema_citas.mv.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioBs {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private Utileria utileria;

    // --- 1. LOGIN SEGURO---
    public Usuario validarLogin(String login, String password) {
        // 1. Generamos el hash
        String passHash = utileria.encriptar(password);
        
        // 2. Buscamos en la BD por login y hash exacto
        Optional<Usuario> op = usuarioRepository.findByLoginAndPassword(login, passHash);
        
        // 3. Validamos que exista y esté activo
        if (op.isPresent() && op.get().getActivo()) {
            return op.get();
        }
        
        // Si no coincide o está inactivo, lanzamos error genérico
        throw new RuntimeException("Usuario o contraseña incorrectos");
    }

    // --- 2. REGISTRAR ADMIN/STAFF (Desde el Panel) ---
    @Transactional
    public Usuario registrar(UsuarioDto dto) {
        Persona persona = personaRepository.findById(dto.getIdPersona())
                .orElseThrow(() -> new RuntimeException("¡Esa persona no existe!"));

        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("¡Ese usuario ya existe!");
        }

        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setLogin(dto.getLogin());
        
        // Encriptamos
        String hash = utileria.encriptar(dto.getPassword());
        usuario.setPassword(hash);
        
        usuario.setIdRol(dto.getIdRol());
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    // --- 3. REGISTRO PÚBLICO (Clientes Nuevos desde la web) ---
    @Transactional 
    public Usuario registrarClienteNuevo(RegistroClienteDto dto) {
        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("¡Ese usuario ya está ocupado!");
        }

        // Crear Persona
        Persona nuevaPersona = new Persona();
        nuevaPersona.setNombre(dto.getNombre());
        nuevaPersona.setPrimerApellido(dto.getPrimerApellido());
        nuevaPersona.setSegundoApellido(dto.getSegundoApellido());
        nuevaPersona.setFechaNacimiento(dto.getFechaNacimiento());
        nuevaPersona.setIdGenero(dto.getIdGenero());
        Persona personaGuardada = personaRepository.save(nuevaPersona);

        // Crear Usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setPersona(personaGuardada);
        nuevoUsuario.setLogin(dto.getLogin());
        
        // Encriptamos
        String hash = utileria.encriptar(dto.getPassword());
        nuevoUsuario.setPassword(hash);
        
        nuevoUsuario.setActivo(true);
        nuevoUsuario.setIdRol(3); // Rol 3 = Cliente

        return usuarioRepository.save(nuevoUsuario);
    }

    // --- 4. ACTUALIZAR (Para Admin/Staff y Perfil) ---
    @Transactional
    public Usuario actualizar(Integer id, UsuarioDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        // Actualizar datos de Persona
        if (dto.getNombre() != null) usuario.getPersona().setNombre(dto.getNombre());
        if (dto.getPrimerApellido() != null) usuario.getPersona().setPrimerApellido(dto.getPrimerApellido());

        // Actualizar Password (SOLO SI MANDÓ UNA NUEVA)
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            // Encriptamos
            String nuevoHash = utileria.encriptar(dto.getPassword());
            usuario.setPassword(nuevoHash); 
        }

        // Actualizar Rol
        if (dto.getIdRol() != null) usuario.setIdRol(dto.getIdRol());
        
        // Actualizar Login (si es necesario)
        if (dto.getLogin() != null) usuario.setLogin(dto.getLogin());

        return usuarioRepository.save(usuario);
    }
    
    // --- 5. ACTUALIZAR PERFIL (Método específico para "Mi Perfil") ---
    @Transactional
    public Usuario actualizarPerfilCompleto(Integer idUsuario, String nombre, String apellido, String password) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.getPersona().setNombre(nombre);
        usuario.getPersona().setPrimerApellido(apellido);
        
        if (password != null && !password.isEmpty()) {
            // Encriptamos
            String nuevoHash = utileria.encriptar(password);
            usuario.setPassword(nuevoHash);
        }
        
        return usuarioRepository.save(usuario);
    }

    // --- AUXILIARES ---
    public List<Usuario> listarPorRol(Integer idRol) {
        return usuarioRepository.findByIdRol(idRol);
    }
    
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
}