package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;
import java.time.LocalTime;
import java.util.List;

@Data
public class AltaSucursalDto {
    private String nombre;
    private Boolean activo;
    
    // Configuración de horarios
    private LocalTime turno1Inicio;
    private LocalTime turno1Fin;
    
    private LocalTime turno2Inicio;
    private LocalTime turno2Fin;
    
    private List<Integer> diasLaborales;
}