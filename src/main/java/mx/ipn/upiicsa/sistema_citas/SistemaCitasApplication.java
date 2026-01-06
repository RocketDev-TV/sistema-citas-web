package mx.ipn.upiicsa.sistema_citas;

import java.util.TimeZone;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;
import java.util.Date;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class SistemaCitasApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaCitasApplication.class, args);
	}

	@PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Mexico_City"));
        System.out.println("=== 🇲🇽 HORA CONFIGURADA: " + new Date() + " 🇲🇽 ===");
    }

}