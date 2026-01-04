package mx.ipn.upiicsa.sistema_citas.dao;
import mx.ipn.upiicsa.sistema_citas.mv.DiaLaboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaLaboralRepository extends JpaRepository<DiaLaboral, Integer> {
}