package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.BloqueCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BloqueCitaRepository extends JpaRepository<BloqueCita, Integer> {

    // Traducimos la fórmula matemática a SQL de Java (JPQL)
    // "Revisa si hay algún bloque (b) de este empleado donde las horas se crucen"
    @Query("""
        SELECT COUNT(b) > 0 
        FROM BloqueCita b 
        WHERE b.cita.empleado.idEmpleado = :idEmpleado 
        AND (b.fechaInicio < :fechaFin AND b.fechaFin > :fechaInicio)
    """)
    boolean empleadoOcupado(
        @Param("idEmpleado") Integer idEmpleado, 
        @Param("fechaInicio") LocalDateTime fechaInicio, 
        @Param("fechaFin") LocalDateTime fechaFin
    );
}