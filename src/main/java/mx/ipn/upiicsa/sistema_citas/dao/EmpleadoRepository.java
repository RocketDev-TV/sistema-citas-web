package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    List<Empleado> findByStActivo(Integer stActivo);
}