package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.SucursalRepository;
import mx.ipn.upiicsa.sistema_citas.dto.SucursalDto;
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SucursalBs {

    @Autowired
    private SucursalRepository sucursalRepository;

    public List<Sucursal> listarTodas() {
        return sucursalRepository.findAll();
    }

    @Transactional
    public Sucursal guardar(SucursalDto dto) {
        Sucursal sucursal;
        
        // 1. DETECTAR SI ES EDICIÓN O CREACIÓN
        if (dto.getIdSucursal() != null && dto.getIdSucursal() > 0) {
            sucursal = sucursalRepository.findById(dto.getIdSucursal())
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        } else {
            sucursal = new Sucursal();
            sucursal.setActivo(true);
            sucursal.setIdEstablecimiento(1);
        }
        
        // 2. ACTUALIZAR DATOS BÁSICOS
        sucursal.setNombre(dto.getNombre());
        
        if (dto.getActivo() != null) {
            sucursal.setActivo(dto.getActivo());
        }
        
        // 3. GEOMETRÍA (Tu código original, lo dejamos preparado)
        if (dto.getLatitud() != null && dto.getLongitud() != null) {
            org.locationtech.jts.geom.GeometryFactory factory = new org.locationtech.jts.geom.GeometryFactory();
            org.locationtech.jts.geom.Point punto = factory.createPoint(
                new org.locationtech.jts.geom.Coordinate(dto.getLongitud(), dto.getLatitud())
            );
            sucursal.setUbicacion(punto);
        }
        
        return sucursalRepository.save(sucursal);
    }
    
    @Transactional
    public void cambiarEstado(Integer id) {
        Sucursal s = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal fantasma 👻"));
        
        // Switch de luz: Prender/Apagar
        s.setActivo(s.getActivo() == null ? false : !s.getActivo());
        
        sucursalRepository.save(s);
    }
}