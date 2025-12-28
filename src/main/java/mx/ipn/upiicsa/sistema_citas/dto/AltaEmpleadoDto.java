package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AltaEmpleadoDto {
    // Datos Personales
    private String nombre;
    private String primerApellido;
    private String segundoApellido;
    private LocalDate fechaNacimiento;
    
    // Datos Laborales
    private Integer idSucursal;
    
    // Datos de Acceso
    private String login;
    private String password;
}