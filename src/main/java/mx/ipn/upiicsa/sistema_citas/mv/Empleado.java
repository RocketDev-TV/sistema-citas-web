package mx.ipn.upiicsa.sistema_citas.mv;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // <--- IMPORTANTE
import jakarta.persistence.*;
import lombok.Getter; // <--- CAMBIO RECOMENDADO
import lombok.Setter; // <--- CAMBIO RECOMENDADO
// import lombok.Data; // <--- EVITA USAR @Data EN ENTIDADES JPA

@Getter // Usar Getter y Setter por separado es más seguro que @Data en JPA
@Setter
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
    // ESTA LÍNEA ES LA QUE ARREGLA EL ERROR 500:
    // Le dice a Jackson: "Cuando pintes la sucursal, no pintes su lista de empleados"
    // (Asegúrate que en tu clase Sucursal la lista se llame "empleados" o ajusta el nombre aquí)
    @JsonIgnoreProperties({"empleados", "citas", "horarios"}) 
    private Sucursal sucursal;

    @Column(name = "st_activo")
    private Integer stActivo;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tce06_empleado_horario", 
        joinColumns = @JoinColumn(name = "fk_id_persona"), 
        inverseJoinColumns = @JoinColumn(name = "fk_id_horario") 
    )
    // También conviene ignorar cosas dentro de horarios para evitar ciclos si es bidireccional
    @JsonIgnoreProperties("empleados") 
    private List<Horario> horariosAsignados;
}