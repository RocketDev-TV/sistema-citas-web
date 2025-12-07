package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;

@Data
public class EmpleadoDto {
    private Integer idPersona;  // ¿Quién es?
    private Integer idSucursal; // ¿Dónde trabaja?
}