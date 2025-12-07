package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.PersonaRepository;
import mx.ipn.upiicsa.sistema_citas.mv.Persona;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PersonaBs {

    @Autowired
    private PersonaRepository personaRepository;

    public Persona registrar(Persona persona) {
        // Validación rápida
        if(persona.getIdGenero() == null) {
            // Si no mandan género, asumimos uno por default o lanzamos error
            // Aquí lo dejamos pasar, pero ojo en el frontend
        }
        return personaRepository.save(persona);
    }

    public List<Persona> listarTodas() {
        return personaRepository.findAll();
    }
}