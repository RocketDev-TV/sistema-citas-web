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
import java.time.LocalDate;

@Service
public class UsuarioBs {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private Utileria utileria;
    @Autowired
    private EmailService emailService;

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

        // 1. Crear Persona (Igual que antes)
        Persona nuevaPersona = new Persona();
        nuevaPersona.setNombre(dto.getNombre());
        nuevaPersona.setPrimerApellido(dto.getPrimerApellido());
        nuevaPersona.setSegundoApellido(dto.getSegundoApellido());
        nuevaPersona.setFechaNacimiento(dto.getFechaNacimiento());
        nuevaPersona.setIdGenero(dto.getIdGenero());
        nuevaPersona.setCorreo(dto.getCorreo());
        Persona personaGuardada = personaRepository.save(nuevaPersona);

        // 2. Crear Usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setPersona(personaGuardada);
        nuevoUsuario.setLogin(dto.getLogin());
        String hash = utileria.encriptar(dto.getPassword());
        nuevoUsuario.setPassword(hash);
        nuevoUsuario.setIdRol(3);

        nuevoUsuario.setActivo(false); 

        String codigo = utileria.generarRandom(6); // Usamos tu función random
        nuevoUsuario.setTokenVerificacion(codigo);
        
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        String asunto = "Verifica tu cuenta - Barber King";
        String mensaje = "¡Bienvenido " + dto.getNombre() + "!\n\n" +
                "Tu cuenta ha sido creada, pero necesitas activarla.\n" +
                "Tu código de verificación es: " + codigo + "\n\n" +
                "Ingrésalo en la página para comenzar a agendar citas.";
        
        emailService.enviarCorreo(dto.getCorreo(), asunto, mensaje);

        return usuarioGuardado;
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
    public Usuario actualizarPerfilCompleto(Integer idUsuario, String nombre, String primerApellido, String segundoApellido, LocalDate fechaNacimiento, String password) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.getPersona().setNombre(nombre);
        usuario.getPersona().setPrimerApellido(primerApellido);
        usuario.getPersona().setSegundoApellido(segundoApellido);
        usuario.getPersona().setFechaNacimiento(fechaNacimiento);

        if (password != null && !password.isEmpty()) {
            // Encriptamos
            String nuevoHash = utileria.encriptar(password);
            usuario.setPassword(nuevoHash);
        }
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void recuperarContrasena(String correo) {
        // 1. Buscamos al usuario por su correo
        Usuario usuario = usuarioRepository.findByPersona_Correo(correo)
                .orElseThrow(() -> new RuntimeException("Este correo no está registrado."));

        // 2. Generamos una contraseña temporal de 8 caracteres
        String passTemporal = utileria.generarRandom(8);

        // 3. Actualizamos la contraseña en la BD (Encriptada)
        String hash = utileria.encriptar(passTemporal);
        usuario.setPassword(hash);
        usuarioRepository.save(usuario);

        // 4. Preparamos el correo bonito
        String asunto = "Recuperación de Contraseña - Barber King";
        String mensaje = "Hola " + usuario.getPersona().getNombre() + ",\n\n" +
                "Hemos recibido una solicitud para recuperar tu cuenta.\n" +
                "Tu nueva contraseña temporal es: " + passTemporal + "\n\n" +
                "Por favor inicia sesión y cámbiala en 'Mi Perfil' lo antes posible.\n\n" +
                "Saludos,\nEl equipo de Barber King 💈";

        // 5. Enviamos el correo (Sin encriptar, para que la lea)
        emailService.enviarCorreo(correo, asunto, mensaje);
    }

    // --- 6. VERIFICAR CUENTA (NUEVO) ---
    @Transactional
    public void verificarCuenta(String login, String codigo) {
        // Buscamos al usuario por su Login
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        // Validamos si ya está activo
        if (usuario.getActivo()) {
            throw new RuntimeException("¡Esta cuenta ya está activa! Inicia sesión.");
        }

        // Validamos el código (Cuidamos que no sea null)
        if (usuario.getTokenVerificacion() == null || !usuario.getTokenVerificacion().equals(codigo)) {
            throw new RuntimeException("Código incorrecto. Verifica tu correo.");
        }

        usuario.setActivo(true);
        usuario.setTokenVerificacion(null); // Limpiamos el token para que no se use 2 veces
        usuarioRepository.save(usuario);
    }

    // --- AUXILIARES ---
    public List<Usuario> listarPorRol(Integer idRol) {
        return usuarioRepository.findByIdRol(idRol);
    }
    
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
}