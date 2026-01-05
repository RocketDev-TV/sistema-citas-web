package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    List<Empleado> findByStActivo(Integer stActivo);

    @Modifying
    @Query("UPDATE Empleado e SET e.sucursal = null WHERE e.sucursal.idSucursal = :idSucursal")
    void desvincularSucursal(@Param("idSucursal") Integer idSucursal);
}