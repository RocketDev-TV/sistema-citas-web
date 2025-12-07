package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.ServicioBs;
import mx.ipn.upiicsa.sistema_citas.mv.Servicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioBs servicioBs;

    @GetMapping
    public List<Servicio> listar() {
        return servicioBs.listarTodos();
    }

    @PostMapping
    public Servicio guardar(@RequestBody Servicio servicio) {
        return servicioBs.registrar(servicio);
    }
}