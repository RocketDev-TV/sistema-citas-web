package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "cci01_servicio")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(name = "tx_nombre")
    private String nombre;

    @Column(name = "tx_descripcion")
    private String descripcion;

    @Column(name = "st_activo")
    private Integer activo;

    @Column(name = "nu_duracion")
    private Integer duracion;

    @Column(name = "nu_precio")
    private BigDecimal precio; 
}