package mx.ipn.upiicsa.sistema_citas.external;

import mx.ipn.upiicsa.sistema_citas.bs.SucursalBs;
import mx.ipn.upiicsa.sistema_citas.dto.AltaSucursalDto;
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

    @PostMapping
    public ResponseEntity<Sucursal> guardar(@RequestBody AltaSucursalDto dto) {
        return ResponseEntity.ok(sucursalBs.guardar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sucursal> editar(@PathVariable Integer id, @RequestBody AltaSucursalDto dto) {
        return ResponseEntity.ok(sucursalBs.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> alternarEstado(@PathVariable Integer id) {
        sucursalBs.cambiarEstado(id); 
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/borrar/{id}")
    public ResponseEntity<?> eliminarTotal(@PathVariable Integer id) {
        try {
            sucursalBs.eliminarDefinitivo(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}