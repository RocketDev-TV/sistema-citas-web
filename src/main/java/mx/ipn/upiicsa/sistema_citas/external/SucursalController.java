package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.SucursalBs;
import mx.ipn.upiicsa.sistema_citas.dto.SucursalDto;
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    @Autowired
    private SucursalBs sucursalBs;

    @GetMapping
    public List<Sucursal> listar() {
        return sucursalBs.listarTodas();
    }

    @PostMapping
    public Sucursal guardar(@RequestBody SucursalDto dto) {
        // 1. Convertimos el DTO a la Entidad
        Sucursal sucursal = new Sucursal();
        sucursal.setNombre(dto.getNombre());
        sucursal.setIdEstablecimiento(dto.getIdEstablecimiento());

        // 2. Convertir lat/lon a Point de PostGIS
        if (dto.getLatitud() != null && dto.getLongitud() != null) {
            GeometryFactory factory = new GeometryFactory();
            Point punto = factory.createPoint(new Coordinate(dto.getLongitud(), dto.getLatitud()));
            sucursal.setUbicacion(punto);
        }

        return sucursalBs.registrar(sucursal);
    }
}