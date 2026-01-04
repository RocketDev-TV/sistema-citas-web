package mx.ipn.upiicsa.sistema_citas.dto;

import lombok.Data;
import java.util.List;

@Data
public class AsignacionHorarioDto {
    private Integer idEmpleado;
    private List<Integer> idsHorarios; // Lista de IDs de los checkboxes marcados
}