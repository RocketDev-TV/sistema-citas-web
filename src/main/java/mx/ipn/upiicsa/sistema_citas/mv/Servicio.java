package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cci01_servicio") // Tu tabla de la BDD
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
    private Integer activo; // 1 = Sí, 0 = No (según tu SQL es int4)

    @Column(name = "nu_duracion")
    private Integer duracion; // En minutos
}