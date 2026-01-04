package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tce03_empleado")
public class Empleado {

    @Id
    @Column(name = "id_empleado")
    private Integer idEmpleado;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_empleado")
    private Persona persona;

    @ManyToOne
    @JoinColumn(name = "fk_id_sucursal")
    private Sucursal sucursal;

    @Column(name = "st_activo")
    private Integer stActivo;
}