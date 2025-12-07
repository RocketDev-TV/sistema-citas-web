package mx.ipn.upiicsa.sistema_citas.bs;

import mx.ipn.upiicsa.sistema_citas.dao.SucursalRepository;
import mx.ipn.upiicsa.sistema_citas.mv.Sucursal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Logica de negocio
public class SucursalBs {

    @Autowired // Inyectamos (DAO)
    private SucursalRepository sucursalRepository;

    // 1. Método para GUARDAR
    public Sucursal registrar(Sucursal sucursal) {
        if (sucursal.getNombre() == null || sucursal.getNombre().isEmpty()) {
            throw new RuntimeException("¡Oye! La sucursal necesita un nombre.");
        }
        
        return sucursalRepository.save(sucursal);
    }

    // 2. Método para LISTAR todo
    public List<Sucursal> listarTodas() {
        return sucursalRepository.findAll();
    }
}