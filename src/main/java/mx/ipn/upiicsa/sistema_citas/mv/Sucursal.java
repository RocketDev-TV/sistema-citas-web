package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tce02_sucursal")
public class Sucursal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sucursal")
    private Integer idSucursal;

    @Column(name = "tx_nombre")
    private String nombre;

    @Column(name = "st_activo")
    private Boolean activo;

    @Column(name = "fk_id_establecimiento")
    private Integer idEstablecimiento;
    
}