package mx.ipn.upiicsa.sistema_citas.mv;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tca02_usuario")
public class Usuario {

    @Id
    @Column(name = "id_usuario")
    private Integer idUsuario;

    // Relación con Persona (Mismo ID)
    @OneToOne
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Persona persona;

    @Column(name = "tx_login")
    private String login;

    @Column(name = "tx_password")
    // Ocultamos el password para que nunca salga en el JSON al consultar
    @JsonIgnore 
    private String password;

    @Column(name = "st_activo")
    private Boolean activo;

    @Column(name = "fk_id_rol")
    private Integer idRol;

    @Column(name = "tx_token_verificacion")
    private String tokenVerificacion;

    @Column(name = "nu_intentos")
    private Integer intentos;

    @Column(name = "fh_desbloqueo")
    private LocalDateTime fechaDesbloqueo;

}