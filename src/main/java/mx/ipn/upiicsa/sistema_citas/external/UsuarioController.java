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
    public Usuario login(@RequestBody LoginDto dto) {
        return usuarioBs.validarLogin(dto.getLogin(), dto.getPassword());
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
}

class ActualizarPerfilDto {
    private Integer idUsuario;
    private PersonaDto persona;
    private String password;

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

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }
}