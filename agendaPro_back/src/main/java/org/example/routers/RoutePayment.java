package org.example.routers;

import io.javalin.Javalin;
import org.example.controller.PaymentController;

public class RoutePayment {

    private final PaymentController paymentController;

    public RoutePayment(PaymentController paymentController) {
        this.paymentController = paymentController;
    }

    public void register(Javalin app) {
        // Grupo de rutas de PayPal
        app.post("/api/payments/create", paymentController::createOrder);
        app.post("/api/payments/capture/{orderId}", paymentController::captureOrder);

        // AGREGA ESTAS DOS:
        app.get("/api/payments/success", paymentController::handleSuccess);
        app.get("/api/payments/cancel", paymentController::handleCancel);
    }
}