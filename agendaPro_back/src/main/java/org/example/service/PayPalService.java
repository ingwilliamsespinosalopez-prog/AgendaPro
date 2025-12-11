package org.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.config.PayPalConfig;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.time.Duration;

public class PayPalService {
    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Obtener Token (CON DEPURACIÓN)
    private String getAccessToken() throws Exception {
        // Verificar que las credenciales no sean nulas antes de enviar
        if (PayPalConfig.CLIENT_ID == null || PayPalConfig.CLIENT_SECRET == null) {
            throw new RuntimeException("ERROR CRÍTICO: Las credenciales en .env son NULL. Revisa la ubicación del archivo .env");
        }

        String auth = PayPalConfig.CLIENT_ID + ":" + PayPalConfig.CLIENT_SECRET;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        System.out.println("--- INTENTANDO AUTENTICAR CON PAYPAL ---");
        // No imprimas el CLIENT_SECRET por seguridad, pero verifica que encodedAuth tenga datos
        System.out.println("Enviando credenciales codificadas...");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PayPalConfig.BASE_URL + "/v1/oauth2/token"))
                .header("Authorization", "Basic " + encodedAuth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials"))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Fallo en Auth PayPal. Status: " + response.statusCode());
        }

        JsonNode jsonNode = objectMapper.readTree(response.body());

        if (!jsonNode.has("access_token")) {
            throw new RuntimeException("El JSON no tiene access_token.");
        }

        return jsonNode.get("access_token").asText();
    }

    public String createOrder(double amount, String currency, int idUsuario, int idCita) throws Exception {
        String token = getAccessToken();

        String returnUrl = "http://localhost:7001/api/payments/success?userId=" + idUsuario + "&citaId=" + idCita;
        String cancelUrl = "http://localhost:7001/api/payments/cancel";

        String jsonBody = String.format("""
            {
              "intent": "CAPTURE",
              "purchase_units": [
                {
                  "amount": {
                    "currency_code": "%s",
                    "value": "%.2f"
                  }
                }
              ],
              "application_context" : {
                "return_url" : "%s",
                "cancel_url" : "%s"
              }
            }
            """, currency, amount, returnUrl, cancelUrl);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PayPalConfig.BASE_URL + "/v2/checkout/orders"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status Crear Orden: " + response.statusCode());
        System.out.println("Respuesta Orden: " + response.body());

        return response.body();
    }

    // 3. Capturar Orden
    public String captureOrder(String orderId) throws Exception {
        String token = getAccessToken();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PayPalConfig.BASE_URL + "/v2/checkout/orders/" + orderId + "/capture"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    // 4. Reembolsar Pago (Refund)
    public boolean refundPayment(String captureId) {
        try {
            String token = getAccessToken();

            // Endpoint de reembolso: /v2/payments/captures/{capture_id}/refund
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PayPalConfig.BASE_URL + "/v2/payments/captures/" + captureId + "/refund"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + token)
                    .POST(HttpRequest.BodyPublishers.ofString("{}")) // Body vacío = Reembolso total
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Status Refund: " + response.statusCode());

            // 201 Created significa que el reembolso se procesó
            return response.statusCode() == 201;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}