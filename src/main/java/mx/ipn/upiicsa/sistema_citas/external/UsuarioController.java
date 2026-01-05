package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.UsuarioBs;
import mx.ipn.upiicsa.sistema_citas.dto.LoginDto;
import mx.ipn.upiicsa.sistema_citas.dto.RegistroClienteDto;
import mx.ipn.upiicsa.sistema_citas.dto.UsuarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioBs usuarioBs;

    // 1. LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto) {
        try {
            Usuario usuario = usuarioBs.validarLogin(dto.getLogin(), dto.getPassword());
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 2. REGISTRO CLIENTE NUEVO
    @PostMapping("/nuevo-cliente")
    public Usuario registrarCliente(@RequestBody RegistroClienteDto dto) {
        return usuarioBs.registrarClienteNuevo(dto);
    }

    // 3. ACTUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Integer id, @RequestBody UsuarioDto dto) {
        Usuario actualizado = usuarioBs.actualizar(id, dto);
        return ResponseEntity.ok(actualizado);
    }
    
    // 4. ACTUALIZAR PERFIL (Endpoint específico para "Mi Perfil")
    @PutMapping("/perfil")
    public ResponseEntity<Usuario> actualizarPerfil(@RequestBody ActualizarPerfilDto dto) {
        Usuario u = usuarioBs.actualizarPerfilCompleto(
            dto.getIdUsuario(), 
            dto.getPersona().getNombre(), 
            dto.getPersona().getPrimerApellido(), 
            dto.getPersona().getSegundoApellido(),
            dto.getPersona().getFechaNacimiento(),
            dto.getPassword()
        );
        return ResponseEntity.ok(u);
    }

    // SOLO CLIENTES (ROL 3)
    @GetMapping("/clientes")
    public List<Usuario> listarSoloClientes() {
        // OPCIÓN RÁPIDA (Modifica tu UsuarioBs para tener este método):
        return usuarioBs.listarPorRol(3); 
    }

    @PostMapping("/recuperar")
    public ResponseEntity<?> recuperar(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        try {
            usuarioBs.recuperarContrasena(correo);
            // Respondemos éxito genérico por seguridad
            return ResponseEntity.ok(Collections.singletonMap("mensaje", "Si el correo existe, se enviaron las instrucciones."));
        } catch (RuntimeException e) {
            // Si quieres ser específico con el error (ej: "Correo no existe")
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/verificar")
    public ResponseEntity<?> verificar(@RequestBody Map<String, String> body) {
        String login = body.get("login");
        String codigo = body.get("codigo");
        
        try {
            usuarioBs.verificarCuenta(login, codigo);
            // Si no hay error, respondemos éxito
            return ResponseEntity.ok(Collections.singletonMap("mensaje", "¡Cuenta verificada! Ya puedes iniciar sesión."));
        } catch (RuntimeException e) {
            // Si el código está mal o expiró
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable("id") Integer id) {
        usuarioBs.eliminarUsuarioCompleto(id);
    }

    @GetMapping("/existe/{login}")
    public org.springframework.http.ResponseEntity<Boolean> verificarExistencia(@PathVariable String login) {
        boolean existe = usuarioBs.existeLogin(login);
        return org.springframework.http.ResponseEntity.ok(existe);
    }


}

class ActualizarPerfilDto {
    private Integer idUsuario;
    private PersonaDto persona;
    private String password;

    // Getters y Setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public PersonaDto getPersona() { return persona; }
    public void setPersona(PersonaDto persona) { this.persona = persona; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class PersonaDto {
    private String nombre;
    private String primerApellido;
    private String segundoApellido;
    private java.time.LocalDate fechaNacimiento;

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }
    
    public String getSegundoApellido() { return segundoApellido; }
    public void setSegundoApellido(String segundoApellido) { this.segundoApellido = segundoApellido; }
    
    public java.time.LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(java.time.LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
}