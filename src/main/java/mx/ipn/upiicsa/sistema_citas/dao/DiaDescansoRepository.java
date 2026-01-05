package mx.ipn.upiicsa.sistema_citas.dao;
import mx.ipn.upiicsa.sistema_citas.mv.DiaDescanso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiaDescansoRepository extends JpaRepository<DiaDescanso, Integer> {
    List<DiaDescanso> findByEmpleadoIdEmpleado(Integer idEmpleado);

    @Modifying
    @Query("DELETE FROM DiaDescanso d WHERE d.empleado.idEmpleado = :idEmpleado")
    void deleteByEmpleadoId(@Param("idEmpleado") Integer idEmpleado);
}