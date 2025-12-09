package mx.ipn.upiicsa.sistema_citas.mv;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tci05_cita")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Integer idCita;

    @ManyToOne
    @JoinColumn(name = "fk_id_persona")
    private Persona cliente;

    @ManyToOne
    @JoinColumn(name = "fk_id_servicio")
    private Servicio servicio;

    @ManyToOne
    @JoinColumn(name = "fk_id_sucursal")
    private Sucursal sucursal;

    @ManyToOne
    @JoinColumn(name = "fk_id_empleado")
    private Empleado empleado;

    @Column(name = "fk_id_lista_precio")
    private Integer idListaPrecio;

    // --- AQUÍ ESTÁ EL CAMBIO DE CASCADA ---
    @OneToOne(mappedBy = "cita", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("cita")
    private BloqueCita bloqueCita;
}