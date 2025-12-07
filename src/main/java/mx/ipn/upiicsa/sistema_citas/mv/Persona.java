package mx.ipn.upiicsa.sistema_citas.mv;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate; // Para fechas sin hora

@Data
@Entity
@Table(name = "tca01_persona")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persona")
    private Integer idPersona;

    @Column(name = "tx_nombre")
    private String nombre;

    @Column(name = "tx_primer_apellido")
    private String primerApellido;

    @Column(name = "tx_segundo_apellido")
    private String segundoApellido;

    @Column(name = "fh_nacimiento")
    private LocalDate fechaNacimiento;

    // Mapeamos el género directo como ID para no crear otra clase ahorita
    @Column(name = "fk_id_genero")
    private Integer idGenero; 
}