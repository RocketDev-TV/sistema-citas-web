package mx.ipn.upiicsa.sistema_citas.bs;

import org.springframework.transaction.annotation.Transactional;

import mx.ipn.upiicsa.sistema_citas.dao.CitaRepository;
import mx.ipn.upiicsa.sistema_citas.dao.HorarioRepository;
import mx.ipn.upiicsa.sistema_citas.dao.PersonaRepository;
import mx.ipn.upiicsa.sistema_citas.dao.UsuarioRepository;
import mx.ipn.upiicsa.sistema_citas.dao.EmpleadoRepository; // <--- NUEVO
import mx.ipn.upiicsa.sistema_citas.dao.SucursalRepository; // <--- NUEVO
import mx.ipn.upiicsa.sistema_citas.dto.RegistroClienteDto;
import mx.ipn.upiicsa.sistema_citas.dto.UsuarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.Persona;
import mx.ipn.upiicsa.sistema_citas.mv.Usuario;
import mx.ipn.upiicsa.sistema_citas.mv.Empleado; // <--- NUEVO
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal; // <--- NUEVO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

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
    @Autowired
    private CitaRepository citaRepository;
    @Autowired
    private HorarioRepository horarioRepository;
    
    // --- INYECCIONES NUEVAS PARA EL PARCHE ---
    @Autowired
    private EmpleadoRepository empleadoRepository;
    @Autowired
    private SucursalRepository sucursalRepository;

    // --- 1. LOGIN SEGURO---
    @Transactional(noRollbackFor = RuntimeException.class)
    public Usuario validarLogin(String login, String password) {
        // Buscar el usuario
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas."));

        // Validar bloqueo
        if (usuario.getFechaDesbloqueo() != null) {
            if (LocalDateTime.now().isBefore(usuario.getFechaDesbloqueo())) {
                long segundosRestantes = ChronoUnit.SECONDS.between(LocalDateTime.now(), usuario.getFechaDesbloqueo());
                throw new RuntimeException("Cuenta bloqueada temporalmente. Intenta en " + segundosRestantes + " segundos.");
            } else {
                usuario.setFechaDesbloqueo(null);
            }
        }

        String hashInput = utileria.encriptar(password);

        if (!usuario.getPassword().equals(hashInput)) {
            int intentosActuales = (usuario.getIntentos() == null ? 0 : usuario.getIntentos()) + 1;
            usuario.setIntentos(intentosActuales);
            String mensajeError = "Contraseña incorrecta.";

            if (intentosActuales >= 3) {
                int segundosCastigo = 30;
                if (intentosActuales > 3) segundosCastigo = 60;
                usuario.setFechaDesbloqueo(LocalDateTime.now().plusSeconds(segundosCastigo));
                mensajeError = "¡Demasiados intentos! Cuenta bloqueada por " + segundosCastigo + " segundos.";
            } else {
                int restantes = 3 - intentosActuales;
                mensajeError += " Te quedan " + restantes + " intentos.";
            }
            usuarioRepository.save(usuario); 
            throw new RuntimeException(mensajeError);
        }

        if (!usuario.getActivo()) {
            throw new RuntimeException("Tu cuenta no ha sido activada. Revisa tu correo.");
        }

        usuario.setIntentos(0);
        usuario.setFechaDesbloqueo(null);
        usuarioRepository.save(usuario);

        return usuario;
    }

    // --- ESTE ES EL MÉTODO QUE MODIFICAMOS (EL PARCHE) ---
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
        
        String hash = utileria.encriptar(dto.getPassword());
        usuario.setPassword(hash);
        
        usuario.setIdRol(dto.getIdRol());
        usuario.setActivo(true);

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // =========================================================================
        // PARCHE DE SEGURIDAD: AUTO-CONTRATACIÓN
        // Si es Admin (1) o Staff (2), nos aseguramos de que exista en la tabla Empleado
        // =========================================================================
        if (dto.getIdRol() == 1 || dto.getIdRol() == 2) {
            if (!empleadoRepository.existsById(usuarioGuardado.getIdUsuario())) {
                Empleado nuevoEmpleado = new Empleado();
                nuevoEmpleado.setPersona(persona);
                nuevoEmpleado.setStActivo(1); 
                
                // Asignamos una sucursal por defecto (la primera que encuentre) para que no truene
                List<Sucursal> sucursales = sucursalRepository.findAll();
                if (!sucursales.isEmpty()) {
                    // Intenta buscar la sucursal 12 (la de tus logs), si no, agarra la primera
                    Sucursal sucDefault = sucursales.stream()
                        .filter(s -> s.getIdSucursal() == 12)
                        .findFirst()
                        .orElse(sucursales.get(0));
                    nuevoEmpleado.setSucursal(sucDefault);
                }
                empleadoRepository.save(nuevoEmpleado);
            }
        }
        // =========================================================================

        return usuarioGuardado;
    }

    // --- 3. REGISTRO PÚBLICO ---
    @Transactional 
    public Usuario registrarClienteNuevo(RegistroClienteDto dto) {
        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("¡Ese usuario ya está ocupado!");
        }

        Persona nuevaPersona = new Persona();
        nuevaPersona.setNombre(dto.getNombre());
        nuevaPersona.setPrimerApellido(dto.getPrimerApellido());
        nuevaPersona.setSegundoApellido(dto.getSegundoApellido());
        nuevaPersona.setFechaNacimiento(dto.getFechaNacimiento());
        nuevaPersona.setIdGenero(dto.getIdGenero());
        nuevaPersona.setCorreo(dto.getCorreo());
        Persona personaGuardada = personaRepository.save(nuevaPersona);

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setPersona(personaGuardada);
        nuevoUsuario.setLogin(dto.getLogin());
        String hash = utileria.encriptar(dto.getPassword());
        nuevoUsuario.setPassword(hash);
        nuevoUsuario.setIdRol(3);
        nuevoUsuario.setActivo(false); 

        String codigo = utileria.generarRandom(6);
        nuevoUsuario.setTokenVerificacion(codigo);
        
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        String asunto = "Verifica tu cuenta - Barber King";
        String mensaje = "¡Bienvenido " + dto.getNombre() + "!\n\n" +
                "Tu código de verificación es: " + codigo;
        
        emailService.enviarCorreo(dto.getCorreo(), asunto, mensaje);

        return usuarioGuardado;
    }

    // --- 4. ACTUALIZAR ---
    @Transactional
    public Usuario actualizar(Integer id, UsuarioDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (dto.getNombre() != null) usuario.getPersona().setNombre(dto.getNombre());
        if (dto.getPrimerApellido() != null) usuario.getPersona().setPrimerApellido(dto.getPrimerApellido());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            String nuevoHash = utileria.encriptar(dto.getPassword());
            usuario.setPassword(nuevoHash); 
        }

        if (dto.getIdRol() != null) usuario.setIdRol(dto.getIdRol());
        if (dto.getLogin() != null) usuario.setLogin(dto.getLogin());

        return usuarioRepository.save(usuario);
    }
    
    // --- 5. PERFIL ---
    @Transactional
    public Usuario actualizarPerfilCompleto(Integer idUsuario, String nombre, String primerApellido, String segundoApellido, LocalDate fechaNacimiento, String password) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.getPersona().setNombre(nombre);
        usuario.getPersona().setPrimerApellido(primerApellido);
        usuario.getPersona().setSegundoApellido(segundoApellido);
        usuario.getPersona().setFechaNacimiento(fechaNacimiento);

        if (password != null && !password.isEmpty()) {
            String nuevoHash = utileria.encriptar(password);
            usuario.setPassword(nuevoHash);
        }
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void recuperarContrasena(String correo) {
        Usuario usuario = usuarioRepository.findByPersona_Correo(correo)
                .orElseThrow(() -> new RuntimeException("Este correo no está registrado."));

        String passTemporal = utileria.generarRandom(8);
        String hash = utileria.encriptar(passTemporal);
        usuario.setPassword(hash);
        usuarioRepository.save(usuario);

        String asunto = "Recuperación de Contraseña - Barber King";
        String mensaje = "Tu nueva contraseña temporal es: " + passTemporal;
        emailService.enviarCorreo(correo, asunto, mensaje);
    }

    @Transactional
    public void verificarCuenta(String login, String codigo) {
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (usuario.getActivo()) {
            throw new RuntimeException("¡Esta cuenta ya está activa!");
        }

        if (usuario.getTokenVerificacion() == null || !usuario.getTokenVerificacion().equals(codigo)) {
            throw new RuntimeException("Código incorrecto.");
        }

        usuario.setActivo(true);
        usuario.setTokenVerificacion(null);
        usuarioRepository.save(usuario);
    }

    // --- BORRADO TOTAL (HARD DELETE) ---
    @Transactional 
    public void eliminarUsuarioCompleto(Integer idUsuario) {
        Usuario u = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Integer idPersona = u.getPersona().getIdPersona();

        if (u.getIdRol() == 3) { 

            citaRepository.deleteByClienteId(idPersona);
            
        } else if (u.getIdRol() == 2 || u.getIdRol() == 1) { 

            horarioRepository.desasignarEmpleadosPorIdEmpleado(u.getIdUsuario()); 

            if(empleadoRepository.existsById(idUsuario)) {
                 empleadoRepository.deleteById(idUsuario);
            }
        }

        usuarioRepository.deleteById(idUsuario);
        
        personaRepository.deleteById(idPersona); 
    }

    public void eliminar(Integer id) {
        usuarioRepository.deleteById(id);
    }

    public List<Usuario> listarPorRol(Integer idRol) {
        return usuarioRepository.findByIdRol(idRol);
    }
    
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public boolean existeLogin(String login) {
        return usuarioRepository.findByLogin(login).isPresent();
    }

}