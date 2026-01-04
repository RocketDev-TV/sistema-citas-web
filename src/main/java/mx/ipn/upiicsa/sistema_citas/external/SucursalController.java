package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.SucursalBs;
import mx.ipn.upiicsa.sistema_citas.dto.SucursalDto;
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    // CREAR
    @PostMapping
    public ResponseEntity<Sucursal> guardar(@RequestBody SucursalDto dto) {
        return ResponseEntity.ok(sucursalBs.guardar(dto));
    }

    // EDITAR (¡Este faltaba!)
    @PutMapping("/{id}")
    public ResponseEntity<Sucursal> editar(@PathVariable Integer id, @RequestBody SucursalDto dto) {
        dto.setIdSucursal(id); // Forzamos el ID de la URL
        return ResponseEntity.ok(sucursalBs.guardar(dto));
    }

    // ACTIVAR/DESACTIVAR (¡Este también!)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> alternarEstado(@PathVariable Integer id) {
        sucursalBs.cambiarEstado(id);
        return ResponseEntity.ok().build();
    }
}