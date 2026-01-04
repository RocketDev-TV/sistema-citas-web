package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Point;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data // Lombok genera Getters, Setters y toString automático
@Entity
@Table(name = "tce02_sucursal")
public class Sucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sucursal")
    private Integer idSucursal;

    @Column(name = "tx_nombre")
    private String nombre;

    @Column(name = "fk_id_establecimiento")
    private Integer idEstablecimiento;

    @Column(name = "st_activo") 
    private Boolean activo;

    @JsonIgnore
    @Column(name = "gm_ubicacion", columnDefinition = "geometry(Point,4326)")
    private Point ubicacion;
}