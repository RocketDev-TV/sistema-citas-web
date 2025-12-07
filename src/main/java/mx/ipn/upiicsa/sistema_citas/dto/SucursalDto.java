package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;

@Data
public class SucursalDto {
    private String nombre;
    private Integer idEstablecimiento;
    private Double latitud;
    private Double longitud;
}