package org.example.controller;

import io.javalin.http.Context;
import io.javalin.http.Cookie;
import io.javalin.http.SameSite;
import io.javalin.http.UploadedFile;
import org.example.model.Usuario;
import org.example.config.JwtUtil;
import org.example.repository.UsuarioRepository;
import org.example.service.UsuarioService;
import org.example.service.FileService;
import org.example.service.NotificationService; // <--- Import NotificationService
import org.mindrot.jbcrypt.BCrypt;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

public class UsuarioController {
    private final UsuarioService service;
    private final UsuarioRepository repository;
    private final FileService fileService = new FileService();

    // 1. Instantiate NotificationService
    private final NotificationService notificaciones = new NotificationService();

    public UsuarioController(UsuarioService service, UsuarioRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    public void registrar(Context ctx) {
        try {
            Usuario usuario = ctx.bodyAsClass(Usuario.class);

            // 2. Capture the raw password BEFORE it gets encrypted by the service
            String passwordOriginal = usuario.getContrasena();

            // Basic validation
            if (usuario.getCorreo() == null || usuario.getCorreo().isEmpty()) {
                ctx.status(400).result("El correo es obligatorio para enviar las credenciales.");
                return;
            }

            // 3. Register user (This encrypts the password and saves to DB)
            service.registrar(usuario);

            // 4. Send email with credentials in a separate thread to avoid blocking the response
            new Thread(() -> {
                String asunto = "Bienvenido a AFG Corporación - Tus Credenciales de Acceso";
                String mensaje = "Hola " + usuario.getNombre() + ",\n\n" +
                        "Tu cuenta ha sido creada exitosamente en nuestro sistema.\n\n" +
                        "Aquí tienes tus credenciales de acceso:\n" +
                        "--------------------------------\n" +
                        "Correo: " + usuario.getCorreo() + "\n" +
                        "Contraseña: " + passwordOriginal + "\n" +
                        "--------------------------------\n\n" +
                        "Por favor, ingresa al sistema y cambia tu contraseña lo antes posible por seguridad.\n" +
                        "Atentamente,\nEl equipo de AFG Corporación.";

                notificaciones.enviarCorreo(usuario.getCorreo(), asunto, mensaje);
            }).start();

            ctx.status(201).json(Map.of("mensaje", "Usuario registrado y credenciales enviadas por correo"));

        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }
    public void obtenerEstadisticas(Context ctx) {
        try {
            String usuarioId = ctx.pathParam("usuarioId");
            int totalPublicaciones = repository.contarPublicaciones();
            int totalAsesorias = repository.contarCitas();
            int totalClientes = repository.contarClientes();

            Map<String, Integer> estadisticas = new HashMap<>();
            estadisticas.put("publicaciones", totalPublicaciones);
            estadisticas.put("asesorias", totalAsesorias);
            estadisticas.put("clientes", totalClientes);

            ctx.json(estadisticas);
            ctx.status(200);

        } catch (Exception e) {
            System.err.println("Error al obtener estadísticas: " + e.getMessage());
            ctx.status(500).json(Map.of("error", "Error al obtener estadísticas"));
        }
    }

    public static class LoginRequest {
        private String correo;
        private String contrasena;

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }
        public String getContrasena() { return contrasena; }
        public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    }

    public void login(Context ctx) {
        try {
            LoginRequest loginRequest = ctx.bodyAsClass(LoginRequest.class);
            String correo = loginRequest.getCorreo();
            String contrasena = loginRequest.getContrasena();

            if (correo == null || contrasena == null) {
                ctx.status(400).result("Faltan los datos");
                return;
            }

            Optional<Usuario> usuarioOpt = service.getCorreo(correo);
            if (usuarioOpt.isPresent()) {
                Usuario u = usuarioOpt.get();
                boolean valido = BCrypt.checkpw(contrasena, u.getContrasena());

                if (valido) {

    // VALIDACIÓN IMPORTANTE
    if (u.getEstado() != null && u.getEstado().equalsIgnoreCase("inactivo")) {
        ctx.status(403).result("Tu cuenta ha sido desactivada");
        return;
    }

    String token = JwtUtil.generarToken(u);

    Cookie cookie = new Cookie("token", token);
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    cookie.setMaxAge(86400);
    cookie.setSameSite(SameSite.LAX);
    ctx.cookie(cookie);

    ctx.json(Map.of(
            "mensaje", "Login exitoso",
            "token", token,
            "rol", u.getIdRol(),
            "id", u.getIdUsuario()
    ));
                } else {
                    ctx.status(401).result("Contraseña incorrecta");
                }
            } else {
                ctx.status(404).result("Correo no registrado");
            }
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }

    // ... (The rest of your existing methods: encriptarPassword, listarAsesores, editarPerfil, etc. remain exactly the same) ...

    public void encriptarPassword(Context ctx) {
        String contrasena = ctx.formParam("contrasena");
        if (contrasena == null || contrasena.isEmpty()) {
            ctx.status(400).result("Falta 'contrasena'");
            return;
        }
        String hash = BCrypt.hashpw(contrasena, BCrypt.gensalt());
        ctx.status(200).result("Contraseña encriptada: " + hash);
    }

    public void listarAsesores(Context ctx) {
        ctx.json(service.listarAsesores());
    }

    public void editarPerfil(Context ctx) {
        try {
            int idRuta = Integer.parseInt(ctx.pathParam("id"));
            int idToken = ctx.attribute("usuarioId") != null ? (int) ctx.attribute("usuarioId") : -1;

            if (idRuta != idToken) {
                ctx.status(403).result("Acceso no valido");
                return;
            }

            Usuario usuario = ctx.bodyAsClass(Usuario.class);
            usuario.setIdUsuario(idRuta);

            if (usuario.getContrasena() != null && !usuario.getContrasena().isEmpty()) {
                String hashed = BCrypt.hashpw(usuario.getContrasena(), BCrypt.gensalt());
                usuario.setContrasena(hashed);
            }

            service.editarPerfil(usuario);
            ctx.status(200).result("Perfil actualizado con ID " + idRuta);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result("Error de validación: " + e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }
    public void validarCorreo(Context ctx) {
        String correo = ctx.formParam("correo");

        try {
            Optional<Usuario> usuarioOpt = service.getCorreo(correo);

            if (usuarioOpt.isEmpty()) {
                ctx.status(404).json(Map.of("ok", false, "mensaje", "El correo no pertenece a un usuario o no existe"));
                return;
            }

            ctx.json(Map.of("ok", true, "usuario", usuarioOpt.get()));

        } catch (SQLException e) {
            ctx.status(500).json(Map.of("ok", false, "mensaje", "Error interno del servidor"));
        }
    }


    public void recuperarPassword(Context ctx) {
        try {
            String correo = ctx.formParam("correo");
            String nuevaPassword = ctx.formParam("nuevaPassword");

            service.recuperarPassword(correo, nuevaPassword);
            ctx.status(200).result("Contraseña actualizada correctamente");
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        }
    }
    public void UpdatePassword(Context ctx) {
        try {
            String correo = ctx.formParam("correo");
            String nuevaPassword = ctx.formParam("nuevaPassword");

            if (correo == null || correo.isEmpty() || nuevaPassword == null || nuevaPassword.isEmpty()) {
                ctx.status(400).result("El correo y la nueva contraseña son obligatorios.");
                return;
            }

            // 1. Actualizar contraseña
            service.recuperarPassword(correo, nuevaPassword);

            // 2. Obtener datos del usuario
            Optional<Usuario> optUsuario = service.getCorreo(correo);

            if (optUsuario.isEmpty()) {
                ctx.status(404).result("No se encontró un usuario con ese correo.");
                return;
            }

            // Convertir Optional -> Usuario real
            Usuario usuario = optUsuario.get();

            // 3. Enviar correo en un hilo separado
            new Thread(() -> {
                String asunto = "Actualización de Contraseña - AFGCorporación";
                String mensaje = "Hola " + usuario.getNombre() + ",\n\n" +
                        "Tu contraseña ha sido actualizada correctamente.\n\n" +
                        "Aquí tienes tu nueva contraseña:\n" +
                        "--------------------------------\n" +
                        "Correo: " + correo + "\n" +
                        "Nueva Contraseña: " + nuevaPassword + "\n" +
                        "--------------------------------\n\n" +
                        "Te recomendamos cambiarla al ingresar para mantener tu cuenta segura.\n" +
                        "Atentamente,\nEl equipo de AFG Corporación.";

                notificaciones.enviarCorreo(correo, asunto, mensaje);
            }).start();

            ctx.status(200).json(Map.of("mensaje", "Contraseña actualizada y enviada al correo"));

        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }

    public void obtenerPerfil(Context ctx) {
        try {
            int idRuta = Integer.parseInt(ctx.pathParam("id"));
            int idToken = ctx.attribute("usuarioId") != null ? (int) ctx.attribute("usuarioId") : -1;

            if (idRuta != idToken) {
                ctx.status(403).result("Acceso Inavalido");
                return;
            }

            Optional<Usuario> usuarioOpt = service.getId(idRuta);
            if (usuarioOpt.isPresent()) {
                ctx.json(usuarioOpt.get());
            } else {
                ctx.status(404).result("Usuario no encontrado con ID " + idRuta);
            }
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }

    public void eliminarUsuario(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));

            boolean eliminado = repository.eliminarUsuario(id);

            if (eliminado) {
                // Eliminado correctamente, sin respuesta (No Content)
                ctx.status(204);
            } else {
                // No se eliminó (ID no existe)
                ctx.status(404);
            }

        } catch (Exception e) {
            ctx.status(500);
        }
    }

    public void cambiarEstadoUsuario(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));

            // Obtener estado actual
            String estadoActual = repository.obtenerEstado(id);

            if (estadoActual == null) {
                ctx.status(404).json(Map.of("error", "Usuario no encontrado"));
                return;
            }

            // Cambiar entre "activo" e "inactivo"
            String nuevoEstado = estadoActual.equalsIgnoreCase("activo") ? "inactivo" : "activo";

            boolean actualizado = repository.cambiarEstado(id, nuevoEstado);

            if (actualizado) {
                ctx.json(Map.of("mensaje", "Estado actualizado a: " + nuevoEstado));
            } else {
                ctx.status(500).json(Map.of("error", "Error al actualizar estado"));
            }

        } catch (SQLException e) {
            ctx.status(500).json(Map.of("error", "Error en base de datos", "detalle", e.getMessage()));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", "Solicitud inválida", "detalle", e.getMessage()));
        }
    }

    public void listarUsuarios(Context ctx) {
        try {
            ctx.json(service.listarTodos());
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Error al listar usuarios"));
        }
    }
    public void subirFotoPerfil(Context ctx) {
        try {
            int idUsuario = Integer.parseInt(ctx.pathParam("id"));
            UploadedFile archivo = ctx.uploadedFile("imagen");

            if (archivo == null) {
                ctx.status(400).json(Map.of("error", "No se envió imagen"));
                return;
            }

            Optional<Usuario> usuarioOpt = service.getId(idUsuario);
            if (usuarioOpt.isPresent()) {
                String fotoAnterior = usuarioOpt.get().getImg();
                if (fotoAnterior != null && !fotoAnterior.startsWith("http")) {
                    fileService.borrarImagenLocal(fotoAnterior);
                }
            }

            String urlRelativa = fileService.guardarImagenLocal(archivo, idUsuario);

            if (urlRelativa != null) {
                service.actualizarFoto(idUsuario, urlRelativa);
                ctx.json(Map.of("mensaje", "Foto actualizada", "url", urlRelativa));
            } else {
                ctx.status(500).json(Map.of("error", "Fallo al guardar en disco"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public void eliminarFotoPerfil(Context ctx) {
        try {
            int idUsuario = Integer.parseInt(ctx.pathParam("id"));
            Optional<Usuario> usuarioOpt = service.getId(idUsuario);
            if (usuarioOpt.isPresent()) {
                String fotoAnterior = usuarioOpt.get().getImg();
                if (fotoAnterior != null && !fotoAnterior.startsWith("http")) {
                    fileService.borrarImagenLocal(fotoAnterior);
                }
                service.actualizarFoto(idUsuario, null);
                ctx.json(Map.of("mensaje", "Foto eliminada correctamente"));
            } else {
                ctx.status(404).json(Map.of("error", "Usuario no encontrado"));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
    private static final Map<String, CodigoRecuperacion> codigos = new HashMap<>();

    public static class CodigoRecuperacion {
        public String codigo;
        public long expiracion;
        public CodigoRecuperacion(String codigo, long expiracion) {
            this.codigo = codigo;
            this.expiracion = expiracion;
        }
    }
    public void enviarCodigo(Context ctx) {
        try {
            String correo = ctx.formParam("correo");

            if (correo == null || correo.isEmpty()) {
                ctx.status(400).result("El correo es obligatorio");
                return;
            }

            Optional<Usuario> usuario = service.getCorreo(correo);

            if (usuario.isEmpty()) {
                ctx.status(404).result("El correo no existe en el sistema");
                return;
            }

            // GENERAR CÓDIGO
            String codigo = String.format("%06d", new Random().nextInt(999999));

            // GUARDAR POR 3 MINUTOS
            codigos.put(correo, new CodigoRecuperacion(
                    codigo,
                    System.currentTimeMillis() + 180000
            ));

            // ENVIAR EMAIL (ASÍNCRONO)
            new Thread(() -> {
                String asunto = "Código de verificación AFG Corporación";
                String mensaje = "Tu código de verificación es: " + codigo + "\nTiene una validez de 3 minutos.";
                notificaciones.enviarCorreo(correo, asunto, mensaje);
            }).start();

            ctx.status(200).json(Map.of(
                    "mensaje", "Código enviado al correo",
                    "correo", correo
            ));

        } catch (Exception e) {
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }
    public void verificarCodigo(Context ctx) {
        try {
            String correo = ctx.formParam("correo");
            String codigo = ctx.formParam("codigo");

            CodigoRecuperacion data = codigos.get(correo);

            if (data == null) {
                ctx.status(400).result("No se solicitó código para este correo");
                return;
            }

            if (System.currentTimeMillis() > data.expiracion) {
                codigos.remove(correo);
                ctx.status(400).result("El código ha expirado");
                return;
            }

            if (!data.codigo.equals(codigo)) {
                ctx.status(400).result("Código incorrecto");
                return;
            }

            ctx.status(200).result("Código validado correctamente");

        } catch (Exception e) {
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }
    public void recuperPassword(Context ctx) {
        try {
            String correo = ctx.formParam("correo");
            String nuevaPassword = ctx.formParam("nuevaPassword");

            if (correo == null || nuevaPassword == null ||
                    correo.isEmpty() || nuevaPassword.isEmpty()) {
                ctx.status(400).result("Datos incompletos");
                return;
            }

            // VALIDAR QUE EXISTE UN CÓDIGO VÁLIDO
            if (!codigos.containsKey(correo)) {
                ctx.status(400).result("Debes verificar un código primero");
                return;
            }

            // Hashear la contraseña (recomendado)
            String passwordHasheada = BCrypt.hashpw(nuevaPassword, BCrypt.gensalt());

            // Actualizar en BD
            service.recuperarPassword(correo, passwordHasheada);

            // Borrar código después del uso
            codigos.remove(correo);

            // Enviar correo de confirmación
            new Thread(() -> {
                String asunto = "Cambio de contraseña AFG Corporación";
                String mensaje = "Tu contraseña ha sido actualizada correctamente.";
                notificaciones.enviarCorreo(correo, asunto, mensaje);
            }).start();

            ctx.status(200).result("Contraseña actualizada correctamente");

        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            ctx.status(500).result("Error interno: " + e.getMessage());
        }
    }
}
