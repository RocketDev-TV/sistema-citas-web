package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.EmpleadoBs;
import mx.ipn.upiicsa.sistema_citas.dto.AltaEmpleadoDto;
import mx.ipn.upiicsa.sistema_citas.dto.EmpleadoDto;
import mx.ipn.upiicsa.sistema_citas.mv.Empleado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    @Autowired
    private EmpleadoBs empleadoBs;

    @GetMapping
    public List<Empleado> listar() {
        return empleadoBs.listarTodos();
    }

    //(Contratar persona existente)
    @PostMapping
    public Empleado contratar(@RequestBody EmpleadoDto dto) {
        return empleadoBs.contratar(dto);
    }

    @PostMapping("/nuevo")
    public Empleado contratarNuevo(@RequestBody AltaEmpleadoDto dto) {
        return empleadoBs.contratarNuevo(dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarEmpleado(@PathVariable Integer id) {
        try {
            empleadoBs.darDeBajaEmpleado(id); 
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}