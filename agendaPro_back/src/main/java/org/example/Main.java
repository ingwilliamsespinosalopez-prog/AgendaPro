package org.example;

import io.javalin.Javalin;
import io.javalin.http.Header;
import io.javalin.http.staticfiles.Location;
import org.example.config.DBconfig;
import org.example.config.Inicio;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        // Obtener configuración desde variables de entorno
        String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
        List<String> origins;

        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            origins = Arrays.asList(allowedOrigins.split(","));
        } else {
            // Valores por defecto para desarrollo
            origins = Arrays.asList(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:5173",
                    "http://afgcorporation.sytes.net/",
                    "http://3.210.62.109/",
                    "https://afgcorporation.sytes.net/",
                    "http://127.0.0.1:3000/",
                    "https://afgcorporation.ddns.net/",
                    "https://afgcorporation.ddns.net"
            );
        }

        // 1. Crear la carpeta "uploads" si no existe
        try {
            Files.createDirectories(Paths.get("uploads"));
        } catch (Exception e) {
            System.err.println("⚠️ No se pudo crear la carpeta uploads: " + e.getMessage());
        }

        // 2. Iniciar Javalin con configuración
        Javalin app = Javalin.create(config -> {

            // A. Configuración CORS
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    // Aplicar orígenes permitidos
                    origins.forEach(origin -> it.allowHost(origin));

                    it.allowCredentials = true;
                    it.exposeHeader("Content-Type");
                    it.exposeHeader("Authorization");
                });
            });

            // B. Configuración de Archivos Estáticos
            config.staticFiles.add(staticFiles -> {
                staticFiles.hostedPath = "/uploads";
                staticFiles.directory = "uploads";
                staticFiles.location = Location.EXTERNAL;
            });

        });

        // 3. INICIAR EL SERVIDOR
        app.start("0.0.0.0", 7001);

        // 4. Manejo de OPTIONS
        app.options("/*", ctx -> {
            String origin = ctx.header("Origin");

            if (origin != null && origins.contains(origin)) {
                ctx.header(Header.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
            }

            ctx.header(Header.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
            ctx.header(Header.ACCESS_CONTROL_ALLOW_HEADERS, "Authorization, Content-Type, X-Requested-With");
            ctx.header(Header.ACCESS_CONTROL_ALLOW_METHODS, "GET, POST, PUT, DELETE, OPTIONS");
            ctx.status(200);
            ctx.result("OK");
        });

        // 5. Iniciar Dependencias y Rutas
        Inicio inicio = new Inicio(DBconfig.getDataSource());

        inicio.inicioUsuario().register(app);
        inicio.inicioCita().register(app);
        inicio.inicioPago().register(app);
        inicio.inicioBlog().register(app);
        inicio.inicioPayPal().register(app);
        inicio.inicioServicio().register(app);

        System.out.println("🚀 API iniciada en http://0.0.0.0:7001");
        System.out.println("📂 Carpeta de imágenes configurada en /uploads");
        System.out.println("🌐 Orígenes permitidos: " + origins);
    }
}