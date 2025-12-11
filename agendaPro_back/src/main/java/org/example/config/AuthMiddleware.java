package org.example.config;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.javalin.http.UnauthorizedResponse;
import io.javalin.http.ForbiddenResponse;
import io.jsonwebtoken.Claims;
import org.example.config.JwtUtil;

public class AuthMiddleware {

    public static Handler requireAuth = ctx -> {
        // --- NUEVO: IGNORAR OPTIONS ---
        // Si el navegador pregunta permisos (OPTIONS), dejamos pasar la solicitud
        // para que Main.java responda con los headers CORS.
        if (ctx.method().toString().equals("OPTIONS")) {
            return;
        }
        // ------------------------------

        String authHeader = ctx.header("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedResponse("Token no proporcionado");
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = JwtUtil.validarToken(token);

            int usuarioId = JwtUtil.extraerEnteroSeguro(claims.get("id"));
            int rol = JwtUtil.extraerEnteroSeguro(claims.get("rol"));
            String correo = claims.getSubject();

            ctx.attribute("usuarioId", usuarioId);
            ctx.attribute("rol", rol);
            ctx.attribute("correo", correo);

            System.out.println("Usuario autenticado - ID: " + usuarioId + ", Rol: " + rol);
        } catch (Exception e) {
            throw new UnauthorizedResponse("Token inválido o expirado");
        }
    };

    public static Handler requireRole(int... rolesPermitidos) {
        return ctx -> {
            // --- NUEVO: IGNORAR OPTIONS EN ROLES TAMBIÉN ---
            if (ctx.method().toString().equals("OPTIONS")) {
                return;
            }
            // -----------------------------------------------
            requireAuth.handle(ctx);

            Integer rolUsuario = ctx.attribute("rol");

            if (rolUsuario == null) {
                // Si llegamos aquí y es OPTIONS, ya debió haber retornado arriba.
                // Si no es OPTIONS y es null, algo falló en requireAuth.
                throw new UnauthorizedResponse("No se pudo determinar el rol del usuario");
            }

            boolean tienePermiso = false;
            for (int rolPermitido : rolesPermitidos) {
                if (rolUsuario == rolPermitido) {
                    tienePermiso = true;
                    break;
                }
            }

            if (!tienePermiso) {
                throw new ForbiddenResponse("No tienes permisos para acceder a este recurso");
            }

            System.out.println("Acceso permitido - Rol: " + rolUsuario);
        };
    }

    public static Handler requireAdmin = requireRole(1);

    public static Handler requireAsesor = requireRole(3);

    public static Handler requireCliente = requireRole(2);

}