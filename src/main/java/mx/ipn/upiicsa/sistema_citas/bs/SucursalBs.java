package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.SucursalRepository;
import mx.ipn.upiicsa.sistema_citas.dto.SucursalDto;
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import mx.ipn.upiicsa.sistema_citas.dto.AltaSucursalDto;
import mx.ipn.upiicsa.sistema_citas.mv.Horario;
import mx.ipn.upiicsa.sistema_citas.mv.DiaLaboral;
import mx.ipn.upiicsa.sistema_citas.mv.Empleado;
import mx.ipn.upiicsa.sistema_citas.dao.HorarioRepository;
import mx.ipn.upiicsa.sistema_citas.dao.DiaLaboralRepository;
import mx.ipn.upiicsa.sistema_citas.dao.EmpleadoRepository;

import java.util.List;

@Service
public class SucursalBs {

    @Autowired
    private SucursalRepository sucursalRepository;
    @Autowired
    private HorarioRepository horarioRepository;
    @Autowired
    private DiaLaboralRepository diaLaboralRepository;
    @Autowired
    private EmpleadoRepository empleadoRepository;

    public List<Sucursal> listarTodas() {
        return sucursalRepository.findAll();
    }

    @Transactional
    public Sucursal guardar(AltaSucursalDto dto) {
        // 1. Guardar la Sucursal
        Sucursal sucursal = new Sucursal();
        sucursal.setNombre(dto.getNombre());
        sucursal.setActivo(true);
        sucursal = sucursalRepository.save(sucursal);

        // 2. Generar Horarios Automáticos
        if (dto.getDiasLaborales() != null && !dto.getDiasLaborales().isEmpty()) {
            crearHorariosParaSucursal(sucursal, dto);
        }

        return sucursal;
    }
    
    // Método auxiliar privado
    private void crearHorariosParaSucursal(Sucursal suc, AltaSucursalDto dto) {
        for (Integer idDia : dto.getDiasLaborales()) {
            DiaLaboral dia = diaLaboralRepository.findById(idDia).orElse(null);
            if(dia == null) continue;

            // Turno 1 (Matutino)
            if (dto.getTurno1Inicio() != null && dto.getTurno1Fin() != null) {
                Horario h1 = new Horario();
                h1.setDiaLaboral(dia);
                h1.setHoraInicio(dto.getTurno1Inicio());
                h1.setHoraFin(dto.getTurno1Fin());
                h1.setIdSucursal(suc.getIdSucursal());
                horarioRepository.save(h1);
            }

            // Turno 2 (Vespertino) - opc
            if (dto.getTurno2Inicio() != null && dto.getTurno2Fin() != null) {
                Horario h2 = new Horario();
                h2.setDiaLaboral(dia);
                h2.setHoraInicio(dto.getTurno2Inicio());
                h2.setHoraFin(dto.getTurno2Fin());
                h2.setIdSucursal(suc.getIdSucursal());
                horarioRepository.save(h2);
            }
        }
    }

    @Transactional
    public void cambiarEstado(Integer id) {
        Sucursal s = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal fantasma 👻"));
        
        // Switch prender/Apagar
        s.setActivo(s.getActivo() == null ? false : !s.getActivo());
        
        sucursalRepository.save(s);
    }
    
    @Transactional
    public Sucursal actualizar(Integer id, AltaSucursalDto dto) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        sucursal.setNombre(dto.getNombre());
        
        if (dto.getActivo() != null) {
            sucursal.setActivo(dto.getActivo());
        }

        if (dto.getDiasLaborales() != null && !dto.getDiasLaborales().isEmpty()) {
            
            horarioRepository.desasignarEmpleadosPorSucursal(id);
            
            horarioRepository.deleteByIdSucursal(id);
            
            crearHorariosParaSucursal(sucursal, dto);
        }

        return sucursalRepository.save(sucursal);
    }

    public void eliminarDefinitivo(Integer id) {
        List<Empleado> empleados = empleadoRepository.findAll().stream()
            .filter(e -> e.getSucursal() != null && e.getSucursal().getIdSucursal().equals(id))
            .toList();

        if (!empleados.isEmpty()) {
            throw new RuntimeException("No se puede borrar: Hay empleados asignados aquí. Mejor desactívala.");
        }

        Sucursal suc = sucursalRepository.findById(id).orElseThrow();
        
        sucursalRepository.deleteById(id);
    }
}