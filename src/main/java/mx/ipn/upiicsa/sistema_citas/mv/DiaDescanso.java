package mx.ipn.upiicsa.sistema_citas.mv;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "tce05_dia_descanso")
public class DiaDescanso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dia_descanso")
    private Integer idDiaDescanso;

    @ManyToOne
    @JoinColumn(name = "fk_id_empleado")
    @JsonIgnore 
    private Empleado empleado; 

    @Column(name = "fh_descanso")
    private LocalDate fecha;
}