package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tce04_dia_laboral")
public class DiaLaboral {
    @Id
    @Column(name = "id_dia")
    private Integer idDia;

    @Column(name = "tx_nombre")
    private String nombre; // Lunes, Martes...

    @Column(name = "st_activo")
    private Integer activo;
}