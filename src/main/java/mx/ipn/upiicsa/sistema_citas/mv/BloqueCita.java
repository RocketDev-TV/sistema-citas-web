package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tce07_bloque_cita")
public class BloqueCita {

    // Como esta tabla no tiene un ID solito serial en tu script, 
    // JPA nos va a pedir uno a fuerza.
    @Id
    @Column(name = "fk_id_cita")
    private Integer idCita;

    @Column(name = "fk_id_sucursal")
    private Integer idSucursal;

    @Column(name = "fh_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fh_fin")
    private LocalDateTime fechaFin;

    // Relación de vuelta con la Cita (Para que Java sepa navegar)
    @OneToOne
    @MapsId
    @JoinColumn(name = "fk_id_cita")
    @com.fasterxml.jackson.annotation.JsonIgnore // Para no hacer bucles infinitos
    private Cita cita;
}