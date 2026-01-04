package mx.ipn.upiicsa.sistema_citas.mv;

import java.util.List;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tce06_empleado_horario", // Nombre de la tabla intermedia
        joinColumns = @JoinColumn(name = "fk_id_persona"), // Tu ID de empleado/persona
        inverseJoinColumns = @JoinColumn(name = "fk_id_horario") // El ID del horario
    )
    private List<Horario> horariosAsignados;
}