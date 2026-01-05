package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // <--- OJO IMPORT
import org.springframework.data.jpa.repository.Query;     // <--- OJO IMPORT
import org.springframework.data.repository.query.Param;   // <--- OJO IMPORT
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    
    List<Horario> findByIdSucursalOrderByDiaLaboralIdDiaAscHoraInicioAsc(Integer idSucursal);
    
    void deleteByIdSucursal(Integer idSucursal);

    @Modifying
    @Query(value = "DELETE FROM tce06_empleado_horario WHERE fk_id_horario IN (SELECT id_horario FROM tce08_horario WHERE fk_id_sucursal = :idSucursal)", nativeQuery = true)
    void desasignarEmpleadosPorSucursal(@Param("idSucursal") Integer idSucursal);
}