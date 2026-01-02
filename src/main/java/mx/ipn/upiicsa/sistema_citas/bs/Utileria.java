package mx.ipn.upiicsa.sistema_citas.bs;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

import javax.management.RuntimeErrorException;

import org.springframework.stereotype.Component;

@Component
public class Utileria {
    public String encriptar(String texto) {
        try{
            if (texto == null) return null;
            
            // Algoritmo SHA-512
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            
            // Convertimos el texto a bytes y aplicamos el Hash
            byte[] hash = digest.digest(texto.getBytes(StandardCharsets.UTF_8));
            
            // Convertimos esos bytes a texto(Base64)
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error al encriptar: " + e.getMessage());
        }
    }

    public String generarRandom(int longitud) {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for(int i = 0; i < longitud; i++) {
            sb.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }
        return sb.toString();
    }
}
