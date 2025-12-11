package org.example.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import org.example.model.OrderRequest;
import org.example.model.Pago;
import org.example.repository.CitaRepository;
import org.example.service.CitaService;
import org.example.repository.PagoRepository;
import org.example.service.PayPalService;
import org.example.config.DBconfig; // Asegúrate de importar esto para pasar el datasource
import java.util.Map;
import java.math.BigDecimal;

public class PaymentController {

    private final PagoRepository pagoRepository = new PagoRepository(DBconfig.getDataSource());
    private final CitaRepository citaRepository = new CitaRepository();

    private final PayPalService payPalService = new PayPalService();
    private final CitaService citaService = new CitaService(citaRepository, pagoRepository);

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Crear Orden (Generar Link)
    public void createOrder(Context ctx) {
        try {
            OrderRequest orderRequest = ctx.bodyAsClass(OrderRequest.class);

            // Pasamos ID Usuario e ID Cita al servicio
            String responseFromPayPal = payPalService.createOrder(
                    orderRequest.getAmount(),
                    orderRequest.getCurrency(),
                    orderRequest.getIdUsuario(),
                    orderRequest.getIdCita()
            );

            ctx.status(201).result(responseFromPayPal).contentType("application/json");

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error creando la orden: " + e.getMessage());
        }
    }

    // 2. Capturar Orden (Endpoint API directo - Opcional)
    // POST /api/payments/capture/{orderId}
    public void captureOrder(Context ctx) {
        try {
            // 1. Obtener datos de la URL
            String orderId = ctx.pathParam("orderId");
            String idCitaStr = ctx.queryParam("idCita");
            String idUsuarioStr = ctx.queryParam("idUsuario");

            if (idCitaStr == null || idUsuarioStr == null) {
                ctx.status(400).json(Map.of("error", "Faltan datos (idCita o idUsuario) para registrar el pago"));
                return;
            }

            int idCita = Integer.parseInt(idCitaStr);
            int idUsuario = Integer.parseInt(idUsuarioStr);

            // 2. Llamar a PayPal para cobrar (CAPTURE)
            String captureResponse = payPalService.captureOrder(orderId);

            // 3. Leer el JSON de PayPal
            JsonNode root = objectMapper.readTree(captureResponse);

            // Verificamos que la respuesta tenga status para evitar errores
            if (!root.has("status")) {
                ctx.status(500).json(Map.of("error", "Respuesta inválida de PayPal", "details", captureResponse));
                return;
            }

            String status = root.path("status").asText();

            // 4. Si el pago fue exitoso, GUARDAR EN BASE DE DATOS Y NOTIFICAR
            if ("COMPLETED".equals(status)) {
                // Navegar por el JSON para sacar los datos financieros
                JsonNode captures = root.path("purchase_units").get(0).path("payments").path("captures").get(0);

                String transactionId = captures.path("id").asText();
                BigDecimal amount = new BigDecimal(captures.path("amount").path("value").asText());

                // Algunos campos opcionales como moneda
                String currency = "MXN";
                if (captures.path("amount").has("currency_code")) {
                    currency = captures.path("amount").path("currency_code").asText();
                }

                // Crear el objeto Pago
                Pago nuevoPago = new Pago();
                nuevoPago.setIdUsuario(idUsuario);
                nuevoPago.setIdCita(idCita);
                nuevoPago.setMonto(amount);
                nuevoPago.setIdTransaccion(transactionId);
                nuevoPago.setPaypalOrderId(orderId);
                nuevoPago.setStatus(status);
                nuevoPago.setIdEstadoPago(1); // 1 = Pagado
                nuevoPago.setIdMetodoPago(1); // 1 = PayPal
                nuevoPago.setMoneda(currency);

                // A) GUARDAR EN BD Y ACTUALIZAR CITA
                pagoRepository.guardarPagoYActualizarCita(nuevoPago);
                System.out.println("✅ Pago registrado en BD para cita " + idCita);

                // B) ENVIAR NOTIFICACIONES (CORREO Y WHATSAPP) - ¡NUEVO!
                System.out.println("🔔 Iniciando envío de notificaciones...");
                citaService.notificarCitaPagada(idCita);
            }

            // 5. Responder al frontend
            ctx.status(200).result(captureResponse).contentType("application/json");

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Error capturando el pago: " + e.getMessage()));
        }
    }

    // 3. RETORNO DE PAYPAL (Success) - ¡AQUÍ GUARDAMOS EN BD!
    public void handleSuccess(Context ctx) {
        try {
            String token = ctx.queryParam("token"); // Order ID
            String citaIdStr = ctx.queryParam("citaId");

            if (token == null || citaIdStr == null) {
                ctx.status(400).html("Error: Faltan datos del pago.");
                return;
            }

            int idCita = Integer.parseInt(citaIdStr);

            // A) Cobrar a PayPal
            String jsonResponse = payPalService.captureOrder(token);
            JsonNode root = objectMapper.readTree(jsonResponse);
            String status = root.path("status").asText();

            if ("COMPLETED".equals(status)) {
                // B) Extraer datos
                JsonNode captures = root.path("purchase_units").get(0).path("payments").path("captures").get(0);
                String transactionId = captures.path("id").asText();
                BigDecimal amount = new BigDecimal(captures.path("amount").path("value").asText());

                // C) Crear objeto Pago
                Pago nuevoPago = new Pago();
                nuevoPago.setIdCita(idCita);
                nuevoPago.setMonto(amount);
                nuevoPago.setIdTransaccion(transactionId);
                nuevoPago.setIdEstadoPago(1); // ASUMIENDO: 1 = Pagado
                nuevoPago.setIdMetodoPago(1); // ASUMIENDO: 1 = PayPal (Ajusta según tu BD)

                // D) Guardar en BD y Actualizar Cita
                pagoRepository.guardarPagoYActualizarCita(nuevoPago);

                // E) Respuesta al usuario
                ctx.html("<h1>¡Pago Exitoso!</h1><p>Cita #" + idCita + " confirmada. Puedes cerrar esta ventana.</p>");
            } else {
                ctx.html("<h1>Pago no completado</h1><p>Status: " + status + "</p>");
            }

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).html("Error procesando el pago: " + e.getMessage());
        }
    }

    // 4. Cancelación
    public void handleCancel(Context ctx) {
        ctx.html("<h1>Pago Cancelado</h1><p>No se ha realizado ningún cargo.</p>");
    }
}