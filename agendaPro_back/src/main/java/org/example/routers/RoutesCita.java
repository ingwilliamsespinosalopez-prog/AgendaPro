package org.example.routers;

import io.javalin.Javalin;
import org.example.controller.CitaController;
// Borra el import de AuthMiddleware si ya no lo usas aquí

public class RoutesCita {

    private final CitaController controller;

    public RoutesCita(CitaController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        // ELIMINAR ESTAS LÍNEAS DE 'app.before':
        // app.before("/admin/cita/*", AuthMiddleware.requireAdmin);
        // app.before("/cliente/cita/*", AuthMiddleware.requireCliente); <--- BORRAR ESTA

        // Las rutas se quedan igual:
        app.get("/admin/cita/listar", controller::listarDetallado);
        app.put("/admin/citas/asignar/{id}", controller::asignarAsesor);
        app.get("/cliente/cita/mias", controller::listarMisCitas);

        app.post("/cita/agendar", controller::crear);
        app.get("/cita/estado/{estado}", controller::listarPorEstado);
        app.get("/cita/asesor/{idAsesor}", controller::listarPorAsesor);
        app.get("/cita/cliente/{idCliente}", controller::listarPorCliente);

        app.delete("/cita/eliminar/{id}", controller::eliminar);

        app.post("/cita/cancelar/{id}", controller::cancelar);
        app.put("/cita/reagendar/{id}", controller::reagendar);
        app.put("/cita/estado/{id}", controller::actualizarEstado);
    }
}