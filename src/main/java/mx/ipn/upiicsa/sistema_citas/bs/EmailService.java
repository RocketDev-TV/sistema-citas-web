package mx.ipn.upiicsa.sistema_citas.bs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Leemos el correo emisor desde el application.properties para no escribirlo duro aquí
    @Value("${spring.mail.username}")
    private String remitente;

    public void enviarCorreo(String destinatario, String asunto, String cuerpo) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            message.setFrom(remitente);
            message.setTo(destinatario);
            message.setSubject(asunto);
            message.setText(cuerpo);

            mailSender.send(message);
            System.out.println("Correo enviado a: " + destinatario);
            
        } catch (Exception e) {
            System.err.println("Error enviando correo: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al enviar el correo.");
        }
    }
}