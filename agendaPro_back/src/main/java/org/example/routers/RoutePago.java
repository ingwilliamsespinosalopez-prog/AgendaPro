package org.example.routers;

import io.javalin.Javalin;
import org.example.controller.PagoController;

public class RoutePago {

    private final PagoController controller;

    public RoutePago(PagoController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {

        // ADMIN
        app.get("/admin/pago/listar", controller::listarTodos);

        // CLIENTE
        app.post("/cliente/pago/registrar", controller::registrar);
    }
}
