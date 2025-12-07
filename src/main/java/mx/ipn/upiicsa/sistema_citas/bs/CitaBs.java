package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.*;
import mx.ipn.upiicsa.sistema_citas.dto.CitaDto;
import mx.ipn.upiicsa.sistema_citas.mv.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional; // Import correcto
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

    @Transactional // <--- ¡AGREGA ESTO! Para que todo sea una sola operación atómica
    public Cita agendar(CitaDto dto) {
        // 1. Validar Cliente
        Persona cliente = personaRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 2. Validar Servicio
        Servicio servicio = servicioRepository.findById(dto.getIdServicio())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        // 3. Validar Sucursal
        Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        // 4. Validar Empleado
        Empleado empleado = empleadoRepository.findById(dto.getIdEmpleado())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        // 5. Armar la Cita
        Cita cita = new Cita();
        cita.setCliente(cliente);
        cita.setServicio(servicio);
        cita.setSucursal(sucursal);
        cita.setEmpleado(empleado);
        cita.setIdListaPrecio(1); // Default

        // 6. Guardamos la Cita PRIMERO (para tener su ID)
        // BORRÉ EL RETURN QUE TENÍAS AQUÍ
        Cita citaGuardada = citaRepository.save(cita);

        // 7. Guardamos el Tiempo (BloqueCita) AHORA SÍ
        if (dto.getFechaInicio() != null && dto.getFechaFin() != null) {
            BloqueCita bloque = new BloqueCita();
            bloque.setCita(citaGuardada); // Enlazamos con la cita recién creada
            bloque.setIdSucursal(dto.getIdSucursal());
            bloque.setFechaInicio(dto.getFechaInicio());
            bloque.setFechaFin(dto.getFechaFin());

            bloqueCitaRepository.save(bloque); // ¡Guardamos el tiempo!
        }

        // 8. Retornamos al final de todo
        return citaGuardada;
    }

    public List<Cita> listarTodas() {
        return citaRepository.findAll();
    }
}