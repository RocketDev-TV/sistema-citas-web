package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.*;
import mx.ipn.upiicsa.sistema_citas.dto.CitaDto;
import mx.ipn.upiicsa.sistema_citas.mv.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        
        // Asignamos una lista de precio default (o validas si existe)
        cita.setIdListaPrecio(1); 

        return citaRepository.save(cita);
    }

    public List<Cita> listarTodas() {
        return citaRepository.findAll();
    }
}