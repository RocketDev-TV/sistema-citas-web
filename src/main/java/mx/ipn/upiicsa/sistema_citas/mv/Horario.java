package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "tce08_horario")
public class Horario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Integer idHorario;

    @ManyToOne
    @JoinColumn(name = "fk_id_dia")
    private DiaLaboral diaLaboral;

    @Column(name = "tm_inicio")
    private LocalTime horaInicio;

    @Column(name = "tm_fin")
    private LocalTime horaFin;

    @Column(name = "fk_id_sucursal")
    private Integer idSucursal; 
}