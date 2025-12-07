package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaDto {
    private Integer idCliente;
    private Integer idServicio;
    private Integer idSucursal;
    private Integer idEmpleado;
    
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}