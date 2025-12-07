package mx.ipn.upiicsa.sistema_citas.dao;

import mx.ipn.upiicsa.sistema_citas.mv.BloqueCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BloqueCitaRepository extends JpaRepository<BloqueCita, Integer> {
    // Aquí es donde luego validaremos "si ya existe una cita a esta hora"
}