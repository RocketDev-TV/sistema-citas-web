package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; 
import org.springframework.data.jpa.repository.Query;   
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    
    List<Horario> findByIdSucursalOrderByDiaLaboralIdDiaAscHoraInicioAsc(Integer idSucursal);
    
    @Modifying
    @Query(value = "DELETE FROM tce06_empleado_horario WHERE fk_id_horario IN :ids", nativeQuery = true)
    void limpiarTablaIntermedia(@Param("ids") List<Integer> ids);

    @Modifying
    @Query("DELETE FROM Horario h WHERE h.idSucursal = :idSucursal")
    void eliminarPorSucursalJPQL(@Param("idSucursal") Integer idSucursal);

    @Modifying
    @Query(value = "DELETE FROM tce06_empleado_horario WHERE fk_id_persona = :idEmpleado", nativeQuery = true)
    void desasignarEmpleadosPorIdEmpleado(@Param("idEmpleado") Integer idEmpleado);
}