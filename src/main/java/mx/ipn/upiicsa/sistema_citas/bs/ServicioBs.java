package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.ServicioRepository;
import mx.ipn.upiicsa.sistema_citas.mv.Servicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServicioBs {

    @Autowired
    private ServicioRepository servicioRepository;

    public Servicio registrar(Servicio servicio) {
        // Validaciones sencillas
        if (servicio.getDuracion() == null || servicio.getDuracion() <= 0) {
            throw new RuntimeException("¡El servicio debe durar al menos 1 minuto!");
        }
        
        if (servicio.getPrecio() == null || servicio.getPrecio().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Ponle precio.");
        }

        if (servicio.getActivo() == null) {
            servicio.setActivo(1);
        }
        return servicioRepository.save(servicio);
    }

    // --- ACTUALIZAR ---
    public Servicio actualizar(Integer id, Servicio servicio) {
        Servicio existente = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("¡Servicio no encontrado!"));
        
        existente.setNombre(servicio.getNombre());
        existente.setDescripcion(servicio.getDescripcion());
        existente.setDuracion(servicio.getDuracion());

        if (servicio.getPrecio() != null) {
            existente.setPrecio(servicio.getPrecio());
        }
        
        return servicioRepository.save(existente);
    }

    // --- ELIMINAR  ---
    public void eliminar(Integer id) {
        Servicio existente = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("¡Servicio no encontrado!"));
        // No lo borramos de la BD, solo lo apagamos para que no salga en la agenda
        existente.setActivo(0); 
        servicioRepository.save(existente);
    }

    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }
}