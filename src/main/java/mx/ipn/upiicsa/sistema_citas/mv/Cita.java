package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;
//import java.time.LocalDateTime; // Para fecha Y hora

@Data
@Entity
@Table(name = "tci05_cita")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Integer idCita;

    // Relación 1: El Cliente (Persona)
    @ManyToOne
    @JoinColumn(name = "fk_id_persona")
    private Persona cliente;

    // Relación 2: El Servicio (Corte, Tinte...)
    @ManyToOne
    @JoinColumn(name = "fk_id_servicio")
    private Servicio servicio;

    // Relación 3: La Sucursal
    @ManyToOne
    @JoinColumn(name = "fk_id_sucursal")
    private Sucursal sucursal;

    // Relación 4: El Empleado que atiende
    @ManyToOne
    @JoinColumn(name = "fk_id_empleado")
    private Empleado empleado;

    // Truco: Mapeamos ListaPrecio como ID simple por ahora
    @Column(name = "fk_id_lista_precio")
    private Integer idListaPrecio;

    // Aunque no está en tu CREATE TABLE original, 
    // seguro necesitas saber CUÁNDO es la cita, ¿no? 
    // Si tu tabla no tiene campo de fecha, avísame, 
    // pero normalmente iría algo así:
    // @Column(name = "fh_cita")
    // private LocalDateTime fechaHora;
}