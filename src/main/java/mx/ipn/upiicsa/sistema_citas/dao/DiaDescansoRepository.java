package mx.ipn.upiicsa.sistema_citas.dao;
import mx.ipn.upiicsa.sistema_citas.mv.DiaDescanso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiaDescansoRepository extends JpaRepository<DiaDescanso, Integer> {
    List<DiaDescanso> findByEmpleadoIdEmpleado(Integer idEmpleado);
}