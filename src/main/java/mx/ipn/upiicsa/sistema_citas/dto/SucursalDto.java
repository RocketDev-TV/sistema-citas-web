package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;

@Data
public class SucursalDto {
    private Integer idSucursal;
    private String nombre;
    private Boolean activo;
    
    // Dejamos estos vivos por si en el futuro activas el mapa
    private Double latitud;
    private Double longitud;
}