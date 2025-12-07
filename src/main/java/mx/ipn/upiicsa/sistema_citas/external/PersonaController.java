package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.PersonaBs;
import mx.ipn.upiicsa.sistema_citas.mv.Persona;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    @Autowired
    private PersonaBs personaBs;

    @GetMapping
    public List<Persona> listar() {
        return personaBs.listarTodas();
    }

    @PostMapping
    public Persona guardar(@RequestBody Persona persona) {
        return personaBs.registrar(persona);
    }
}