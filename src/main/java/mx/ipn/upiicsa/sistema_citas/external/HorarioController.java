package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.HorarioBs;
import mx.ipn.upiicsa.sistema_citas.dto.AsignacionHorarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.DiaDescanso;
import mx.ipn.upiicsa.sistema_citas.mv.Horario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    @Autowired
    private HorarioBs horarioBs;

    @GetMapping("/sucursal/{idSucursal}")
    public List<Horario> getPlantilla(@PathVariable Integer idSucursal) {
        return horarioBs.obtenerPlantillaHorarios(idSucursal);
    }

    @GetMapping("/empleado/{idEmpleado}")
    public List<Horario> getAsignados(@PathVariable Integer idEmpleado) {
        return horarioBs.obtenerHorariosDeEmpleado(idEmpleado);
    }

    // Guardar
    @PostMapping("/asignar")
    public ResponseEntity<?> asignar(@RequestBody AsignacionHorarioDto dto) {
        try {
            horarioBs.asignarHorarios(dto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    //Endpoints para descanso 
    @GetMapping("/descansos/{idEmpleado}")
    public List<DiaDescanso> getDescansos(@PathVariable Integer idEmpleado) {
        return horarioBs.obtenerDescansos(idEmpleado);
    }

    @PostMapping("/descansos/{idEmpleado}")
    public ResponseEntity<?> agregarDescanso(@PathVariable Integer idEmpleado, @RequestBody String fechaStr) {
        // Recibimos la fecha como string "2025-12-25"
        try {
            String limpia = fechaStr.replace("\"", ""); 
            LocalDate fecha = LocalDate.parse(limpia);
            horarioBs.agregarDescanso(idEmpleado, fecha);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Fecha inválida");
        }
    }

    @DeleteMapping("/descansos/{idDescanso}")
    public ResponseEntity<?> eliminarDescanso(@PathVariable Integer idDescanso) {
        horarioBs.eliminarDescanso(idDescanso);
        return ResponseEntity.ok().build();
    }
}