package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.EmpleadoBs;
import mx.ipn.upiicsa.sistema_citas.dto.EmpleadoDto;
import mx.ipn.upiicsa.sistema_citas.mv.Empleado;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    public Empleado contratar(@RequestBody EmpleadoDto dto) {
        return empleadoBs.contratar(dto);
    }
}