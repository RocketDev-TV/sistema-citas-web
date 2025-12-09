package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.UsuarioBs;
import mx.ipn.upiicsa.sistema_citas.dto.UsuarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import mx.ipn.upiicsa.sistema_citas.dto.LoginDto;
import mx.ipn.upiicsa.sistema_citas.dto.RegistroClienteDto;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioBs usuarioBs;

    @PostMapping("/registro")
    public Usuario registrar(@RequestBody UsuarioDto dto) {
        return usuarioBs.registrar(dto);
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody LoginDto dto) {
        return usuarioBs.login(dto.getLogin(), dto.getPassword());
    }

    @PostMapping("/nuevo-cliente")
    public Usuario registrarCliente(@RequestBody RegistroClienteDto dto) {
        return usuarioBs.registrarClienteNuevo(dto);
    }
}