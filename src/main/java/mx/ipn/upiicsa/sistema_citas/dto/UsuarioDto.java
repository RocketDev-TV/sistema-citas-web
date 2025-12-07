package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;

@Data
public class UsuarioDto {
    private Integer idPersona; // Debe existir previamente
    private String login;
    private String password;
    private Integer idRol; // 1=Admin, 2=Empleado, 3=Cliente
}