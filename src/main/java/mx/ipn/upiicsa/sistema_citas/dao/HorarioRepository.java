package mx.ipn.upiicsa.sistema_citas.dao;
import mx.ipn.upiicsa.sistema_citas.mv.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    List<Horario> findByIdSucursalOrderByDiaLaboralIdDiaAscHoraInicioAsc(Integer idSucursal);
}