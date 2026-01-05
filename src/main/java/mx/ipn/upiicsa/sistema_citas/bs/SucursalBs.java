package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.SucursalRepository;
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import mx.ipn.upiicsa.sistema_citas.dto.AltaSucursalDto;
import mx.ipn.upiicsa.sistema_citas.mv.Horario;
import mx.ipn.upiicsa.sistema_citas.mv.DiaLaboral;
import mx.ipn.upiicsa.sistema_citas.dao.HorarioRepository;
import mx.ipn.upiicsa.sistema_citas.dao.CitaRepository;
import mx.ipn.upiicsa.sistema_citas.dao.DiaLaboralRepository;
import mx.ipn.upiicsa.sistema_citas.dao.EmpleadoRepository;

import java.util.List;
import java.util.stream.Collectors;

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
    @Autowired
    private CitaRepository citaRepository;

    public List<Sucursal> listarTodas() {
        return sucursalRepository.findAll();
    }

    @Transactional
    public Sucursal guardar(AltaSucursalDto dto) {
        Sucursal sucursal = new Sucursal();
        sucursal.setNombre(dto.getNombre());
        sucursal.setActivo(true);
        
        sucursal.setIdEstablecimiento(1); 

        sucursal = sucursalRepository.save(sucursal);

        if (dto.getDiasLaborales() != null && !dto.getDiasLaborales().isEmpty()) {
            crearHorariosParaSucursal(sucursal, dto);
        }
        return sucursal;
    }
    
    private void crearHorariosParaSucursal(Sucursal suc, AltaSucursalDto dto) {
        for (Integer idDia : dto.getDiasLaborales()) {
            DiaLaboral dia = diaLaboralRepository.findById(idDia).orElse(null);
            if(dia == null) continue;

            if (dto.getTurno1Inicio() != null && dto.getTurno1Fin() != null) {
                Horario h1 = new Horario();
                h1.setDiaLaboral(dia);
                h1.setHoraInicio(dto.getTurno1Inicio());
                h1.setHoraFin(dto.getTurno1Fin());
                h1.setIdSucursal(suc.getIdSucursal());
                horarioRepository.save(h1);
            }

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
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        s.setActivo(s.getActivo() == null ? false : !s.getActivo());
        sucursalRepository.save(s);
    }
    
    @Transactional
    public Sucursal actualizar(Integer id, AltaSucursalDto dto) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        sucursal.setNombre(dto.getNombre());
        if (dto.getActivo() != null) sucursal.setActivo(dto.getActivo());

        if (dto.getDiasLaborales() != null && !dto.getDiasLaborales().isEmpty()) {
            eliminarSoloDependencias(id); 
            crearHorariosParaSucursal(sucursal, dto);
        }
        return sucursalRepository.save(sucursal);
    }

    @Transactional
    public void eliminar(Integer id) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        
        sucursal.setActivo(false); 
        
        sucursalRepository.save(sucursal);
    }

    public void eliminarDefinitivo(Integer id) {
        eliminar(id);
    }

    private void eliminarSoloDependencias(Integer idSucursal) {
        // A. Empleados
        empleadoRepository.desvincularSucursal(idSucursal);

        // B. Citas
        citaRepository.deleteBySucursalId(idSucursal);

        // C. Horarios (Lógica Manual segura)
        List<Horario> horarios = horarioRepository.findByIdSucursalOrderByDiaLaboralIdDiaAscHoraInicioAsc(idSucursal);
        
        if (!horarios.isEmpty()) {
            List<Integer> ids = horarios.stream().map(Horario::getIdHorario).collect(Collectors.toList());
            
            // Borramos relación en tce06
            horarioRepository.limpiarTablaIntermedia(ids);
            
            // Borramos horarios en tce08
            horarioRepository.eliminarPorSucursalJPQL(idSucursal);
        }
    }
}