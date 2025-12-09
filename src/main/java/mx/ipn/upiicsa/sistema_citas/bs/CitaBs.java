package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.*;
import mx.ipn.upiicsa.sistema_citas.dto.CitaDto;
import mx.ipn.upiicsa.sistema_citas.mv.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
public class CitaBs {

    @Autowired
    private CitaRepository citaRepository;
    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private ServicioRepository servicioRepository;
    @Autowired
    private SucursalRepository sucursalRepository;
    @Autowired
    private EmpleadoRepository empleadoRepository;
    @Autowired
    private BloqueCitaRepository bloqueCitaRepository;

    @Transactional
    public Cita agendar(CitaDto dto) {
        // 0. Validar Horario
        if (dto.getFechaInicio() != null && dto.getFechaFin() != null) {
            if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
                throw new RuntimeException("¡No inventes! La cita no puede terminar antes de empezar.");
            }
            boolean estaOcupado = bloqueCitaRepository.empleadoOcupado(
                    dto.getIdEmpleado(),
                    dto.getFechaInicio(),
                    dto.getFechaFin());
            if (estaOcupado) {
                throw new RuntimeException("¡Agenda llena! El empleado ya tiene chamba a esa hora.");
            }
        }

        // 1. Validar Entidades
        Persona cliente = personaRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        Servicio servicio = servicioRepository.findById(dto.getIdServicio())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        Empleado empleado = empleadoRepository.findById(dto.getIdEmpleado())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        // 2. Guardar Cita
        Cita cita = new Cita();
        cita.setCliente(cliente);
        cita.setServicio(servicio);
        cita.setSucursal(sucursal);
        cita.setEmpleado(empleado);
        cita.setIdListaPrecio(1);

        Cita citaGuardada = citaRepository.save(cita);

        // 3. Guardar Bloque de Tiempo
        if (dto.getFechaInicio() != null && dto.getFechaFin() != null) {
            BloqueCita bloque = new BloqueCita();
            bloque.setCita(citaGuardada);
            bloque.setIdSucursal(dto.getIdSucursal());
            bloque.setFechaInicio(dto.getFechaInicio());
            bloque.setFechaFin(dto.getFechaFin());
            bloqueCitaRepository.save(bloque);
        }

        return citaGuardada;
    }

    public List<Cita> listarTodas() {
        return citaRepository.findAll();
    }

    // --- NUEVO MÉTODO PARA BORRAR ---
    public void cancelar(Integer id) {
        if (!citaRepository.existsById(id)) {
            throw new RuntimeException("La cita no existe.");
        }
        citaRepository.deleteById(id);
    }
}