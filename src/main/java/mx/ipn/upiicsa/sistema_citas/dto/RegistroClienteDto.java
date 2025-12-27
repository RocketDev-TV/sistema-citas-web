package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistroClienteDto {
    // Datos Personales
    private String nombre;
    private String primerApellido;
    private String segundoApellido;
    private LocalDate fechaNacimiento; // Formato "YYYY-MM-DD"
    private Integer idGenero;

    // Datos de Cuenta
    private String login;
    private String password;

    // Correo
    private String correo;
}