package org.example.config;
import io.github.cdimascio.dotenv.Dotenv;

public class PayPalConfig {

    private static final Dotenv dotenv = Dotenv.load();

    public static final String BASE_URL = "https://api.sandbox.paypal.com";

    public static final String CLIENT_ID = dotenv.get("PAYPAL_CLIENT_ID");
    public static final String CLIENT_SECRET = dotenv.get("PAYPAL_SECRET");

    static {
        if (CLIENT_ID == null || CLIENT_SECRET == null) {
            throw new RuntimeException("FATAL: Faltan las credenciales de PAYPAL en el archivo .env");
        }
    }

}