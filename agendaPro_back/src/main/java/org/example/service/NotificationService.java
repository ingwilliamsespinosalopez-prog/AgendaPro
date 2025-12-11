package org.example.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import io.github.cdimascio.dotenv.Dotenv; // IMPORTANTE: Importar librería
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

public class NotificationService {

    // Cargar Dotenv una sola vez (ignora si falta el archivo para no romper en producción)
    private static final Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    // Método auxiliar para obtener variables: Busca en .env primero, luego en Sistema
    private static String getEnv(String key) {
        String value = dotenv.get(key);
        return (value != null) ? value : System.getenv(key);
    }

    // GMAIL
    private static final String GMAIL_USER = getEnv("GMAIL_USER");
    private static final String GMAIL_PASSWORD = getEnv("GMAIL_PASSWORD");

    // TWILIO
    private static final String TWILIO_ACCOUNT_SID = getEnv("TWILIO_ACCOUNT_SID");
    private static final String TWILIO_AUTH_TOKEN = getEnv("TWILIO_AUTH_TOKEN");

    // NÚMEROS DE TELÉFONO
    private static final String TWILIO_WHATSAPP_NUMBER =
            getEnv("TWILIO_WHATSAPP_NUMBER") != null ? getEnv("TWILIO_WHATSAPP_NUMBER") : "whatsapp:+14155238886";

    private static final String TWILIO_SMS_FROM_NUMBER = getEnv("TWILIO_SMS_FROM_NUMBER");

    private final JavaMailSenderImpl mailSender;

    public NotificationService() {
        // Validación con log claro
        if (GMAIL_USER == null || GMAIL_PASSWORD == null || TWILIO_ACCOUNT_SID == null) {
            System.err.println("⚠️ ERROR CRÍTICO: Variables de entorno no encontradas.");
            System.err.println("   Asegúrate de tener el archivo .env en la raíz del proyecto.");
        } else {
            System.out.println("✅ Variables de entorno cargadas correctamente.");
        }

        // Configurar Gmail
        mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(GMAIL_USER);
        mailSender.setPassword(GMAIL_PASSWORD);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        // props.put("mail.debug", "true"); // Descomenta si necesitas ver logs detallados del envío de correo

        // Configurar Twilio
        try {
            if (TWILIO_ACCOUNT_SID != null && TWILIO_AUTH_TOKEN != null) {
                Twilio.init(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
                System.out.println("✅ Twilio inicializado.");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error iniciando Twilio: " + e.getMessage());
        }
    }

    // ENVIAR CORREO
    public void enviarCorreo(String destinatario, String asunto, String mensaje) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(GMAIL_USER);
            email.setTo(destinatario);
            email.setSubject(asunto);
            email.setText(mensaje);
            mailSender.send(email);
            System.out.println("📧 Correo enviado a: " + destinatario);
        } catch (Exception e) {
            System.err.println("❌ Error enviando correo: " + e.getMessage());
        }
    }

    // ENVIAR WHATSAPP
    public void enviarWhatsApp(String numeroDestino, String mensaje) {
        try {
            Message.creator(
                    new PhoneNumber("whatsapp:" + numeroDestino),
                    new PhoneNumber(TWILIO_WHATSAPP_NUMBER),
                    mensaje
            ).create();
            System.out.println("✅ WhatsApp enviado a: " + numeroDestino);
        } catch (Exception e) {
            System.err.println("❌ Error enviando WhatsApp: " + e.getMessage());
        }
    }

    // ENVIAR SMS
    public void enviarSMS(String numeroDestino, String mensaje) {
        try {
            Message message = Message.creator(
                    new PhoneNumber(numeroDestino),
                    new PhoneNumber(TWILIO_SMS_FROM_NUMBER),
                    mensaje
            ).create();

            System.out.println("📩 SMS enviado a: " + numeroDestino);
            System.out.println("SID: " + message.getSid());

        } catch (Exception e) {
            System.err.println("❌ Error enviando SMS: " + e.getMessage());
        }
    }
}
