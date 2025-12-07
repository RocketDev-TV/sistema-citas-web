package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;

@Data
public class CitaDto {
    private Integer idCliente;
    private Integer idServicio;
    private Integer idSucursal;
    private Integer idEmpleado;
    // private LocalDateTime fechaHora; // Descomenta si agregas fecha
}