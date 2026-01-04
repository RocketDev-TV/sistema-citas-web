package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.*;
import mx.ipn.upiicsa.sistema_citas.dto.AsignacionHorarioDto;
import mx.ipn.upiicsa.sistema_citas.mv.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HorarioBs {

    @Autowired
    private HorarioRepository horarioRepository;
    @Autowired
    private EmpleadoRepository empleadoRepository;

    // 1. Obtener todos los horarios posibles de una sucursal
    public List<Horario> obtenerPlantillaHorarios(Integer idSucursal) {
        return horarioRepository.findByIdSucursalOrderByDiaLaboralIdDiaAscHoraInicioAsc(idSucursal);
    }

    // 2. Obtener los horarios que ya tiene un empleado
    public List<Horario> obtenerHorariosDeEmpleado(Integer idEmpleado) {
        Empleado emp = empleadoRepository.findById(idEmpleado).orElse(null);
        if(emp == null) return List.of();
        return emp.getHorariosAsignados();
    }

    // 3. Guardar la asignación 
    public void asignarHorarios(AsignacionHorarioDto dto) {
        Empleado emp = empleadoRepository.findById(dto.getIdEmpleado())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        List<Horario> nuevosHorarios = horarioRepository.findAllById(dto.getIdsHorarios());

        emp.setHorariosAsignados(nuevosHorarios);
        
        // Guardamos
        empleadoRepository.save(emp);
    }
}