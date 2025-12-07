package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.CitaBs;
import mx.ipn.upiicsa.sistema_citas.dto.CitaDto;
import mx.ipn.upiicsa.sistema_citas.mv.Cita;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaBs citaBs;

    @GetMapping
    public List<Cita> listar() {
        return citaBs.listarTodas();
    }

    @PostMapping
    public Cita agendar(@RequestBody CitaDto dto) {
        return citaBs.agendar(dto);
    }
}