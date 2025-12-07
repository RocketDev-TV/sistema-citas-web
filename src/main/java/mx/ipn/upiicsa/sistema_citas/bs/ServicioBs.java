package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.ServicioRepository;
import mx.ipn.upiicsa.sistema_citas.mv.Servicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        // Por defecto lo activamos si no mandan nada
        if (servicio.getActivo() == null) {
            servicio.setActivo(1);
        }
        return servicioRepository.save(servicio);
    }

    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }
}