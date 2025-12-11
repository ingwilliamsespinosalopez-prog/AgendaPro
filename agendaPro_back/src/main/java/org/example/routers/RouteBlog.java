package org.example.routers;

import io.javalin.Javalin;
import org.example.controller.BlogController;
import org.example.config.AuthMiddleware;

public class RouteBlog {

    private final BlogController controller;

    public RouteBlog(BlogController controller) {
        this.controller = controller;
    }

    public void register(Javalin app) {
        // Rutas Públicas (Ver blogs)
        app.get("/blog/listar", controller::verPublicaciones);
        app.get("/blog/{id}", controller::verUno);

        app.get("/blog/estado/{idEstado}", controller::listarPorEstado);//aldo

        // Rutas Protegidas (Solo Admin puede crear/editar/borrar)
        app.before("/admin/blog/*", AuthMiddleware.requireAdmin);

        app.post("/admin/blog/crear", controller::crearPublicacion);
        app.put("/admin/blog/editar/{id}", controller::editarPublicacion);
        app.delete("/admin/blog/eliminar/{id}", controller::eliminarPublicacion);
        app.put("/blog/cambiar-estado/{id}", controller::cambiarEstado); //aldo


    }
}