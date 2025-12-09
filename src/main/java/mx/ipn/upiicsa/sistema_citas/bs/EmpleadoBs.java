package mx.ipn.upiicsa.sistema_citas.bs;

import jakarta.transaction.Transactional;
import mx.ipn.upiicsa.sistema_citas.dao.*;
import mx.ipn.upiicsa.sistema_citas.dto.AltaEmpleadoDto;
import mx.ipn.upiicsa.sistema_citas.dto.EmpleadoDto;
import mx.ipn.upiicsa.sistema_citas.mv.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpleadoBs {

    @Autowired
    private EmpleadoRepository empleadoRepository;
    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private SucursalRepository sucursalRepository;
    @Autowired
    private UsuarioRepository usuarioRepository; 

    // --- MÉTODO 1: CONTRATAR (Viejito - Solo vincula) ---
    // Este faltaba y por eso te daba error en la línea 27 del Controller
    public Empleado contratar(EmpleadoDto dto) {
        Persona persona = personaRepository.findById(dto.getIdPersona())
                .orElseThrow(() -> new RuntimeException("¡Esa persona no existe!"));

        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new RuntimeException("¡Esa sucursal no existe!"));

        Empleado empleado = new Empleado();
        empleado.setPersona(persona);
        empleado.setSucursal(sucursal);

        return empleadoRepository.save(empleado);
    }

    // --- MÉTODO 2: CONTRATAR NUEVO (Full - Crea todo) ---
    @Transactional
    public Empleado contratarNuevo(AltaEmpleadoDto dto) {
        // 1. Validar que la sucursal exista
        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        // 2. Validar usuario duplicado
        if (usuarioRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("Ese login ya está ocupado.");
        }

        // 3. Crear Persona
        Persona persona = new Persona();
        persona.setNombre(dto.getNombre());
        persona.setPrimerApellido(dto.getPrimerApellido());
        persona.setSegundoApellido(dto.getSegundoApellido());
        persona.setFechaNacimiento(java.time.LocalDate.now()); 
        persona.setIdGenero(1); 
        
        persona = personaRepository.save(persona);

        // 4. Crear Usuario (Rol 2 = Empleado/Staff)
        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setLogin(dto.getLogin());
        usuario.setPassword(dto.getPassword());
        usuario.setIdRol(2); 
        usuario.setActivo(true);
        
        usuarioRepository.save(usuario);

        // 5. Crear Empleado (Vincular a Sucursal)
        Empleado empleado = new Empleado();
        empleado.setPersona(persona);
        empleado.setSucursal(sucursal);

        return empleadoRepository.save(empleado);
    }

    public List<Empleado> listarTodos() {
        return empleadoRepository.findAll();
    }
}