package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

    @Modifying
    @Query("DELETE FROM Cita c WHERE c.cliente.idPersona = :idPersona")
    void deleteByClienteId(@Param("idPersona") Integer idPersona);

    @Modifying
    @Query("DELETE FROM Cita c WHERE c.sucursal.idSucursal = :idSucursal")
    void deleteBySucursalId(@Param("idSucursal") Integer idSucursal);
}