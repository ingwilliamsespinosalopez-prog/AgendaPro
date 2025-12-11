package org.example.routers;

import io.javalin.Javalin;
import org.example.controller.ServicioController;

public class RouteServicio {
    private final ServicioController controller;

    public RouteServicio(ServicioController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        app.get("/api/servicios", controller::listar);
        /// exemen
        app.get("/api/servicios/filtrar/{id}", controller::listarPorEstado);
        app.get("/api/servicios/filtrar-por-fecha/{fecha}", controller::listarPorFecha);
        app.get("/api/servicios/filtrar-por-fecha-estado/{fecha}/{id}", controller::listarPorEstadoFecha);
    }
}