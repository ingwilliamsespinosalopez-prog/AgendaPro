package org.example.controller;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import org.example.model.AsignarAsesorRequest;
import org.example.model.Cita;
import org.example.service.CitaService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class CitaController {

    private final CitaService service;

    public CitaController(CitaService service) {
        this.service = service;
    }

    public void crear(Context ctx) {
        try {
            Cita nuevaCita = ctx.bodyAsClass(Cita.class);
            Integer resultado = service.crearCita(nuevaCita);

            if (resultado == null) {
                ctx.status(500).json(Map.of("error", "Error interno del servidor"));
            } else if (resultado == -1) {
                ctx.status(409).json(Map.of("error", "El horario seleccionado no está disponible (Empalme)."));
            } else {
                // AQUÍ ESTÁ LA MAGIA: Devolvemos un objeto JSON limpio
                Map<String, Object> respuesta = new HashMap<>();
                respuesta.put("id", resultado);
                respuesta.put("mensaje", "Cita creada con éxito");

                ctx.status(201).json(respuesta);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Ver error en consola del servidor
            ctx.status(400).json(Map.of("error", "Error en los datos: " + e.getMessage()));
        }
    }

    public void listarMisCitas(Context ctx) {
        try {
            Integer idCliente = ctx.attribute("usuarioId");
            if (idCliente == null) {
                throw new ForbiddenResponse("No autorizado");
            }
            List<Cita> citas = service.obtenerPorCliente(idCliente);
            ctx.json(citas);
        } catch (ForbiddenResponse e) {
            ctx.status(403).json(e.getMessage());
        } catch (Exception e) {
            ctx.status(500).json("Error al listar citas: " + e.getMessage());
        }
    }

    public void listarTodas(Context ctx) {
        try {
            List<Cita> citas = service.listarTodas();
            ctx.json(citas);
        } catch (Exception e) {
            ctx.status(500).json("Error al listar citas: " + e.getMessage());
        }
    }

    public void listarDetallado(Context ctx) {
        ctx.json(service.listarTodasDetallado());
    }

    public void listarPorEstado(Context ctx) {
        try {
            String estadoParam = ctx.pathParam("estado");
            int idEstado = Integer.parseInt(estadoParam);
            List<Cita> citas = service.listarPorEstado(idEstado);
            ctx.json(citas);
        } catch (NumberFormatException e) {
            ctx.status(400).json("Estado inválido");
        } catch (Exception e) {
            ctx.status(500).json("Error al listar citas por estado: " + e.getMessage());
        }
    }

    public void listarPorCliente(Context ctx) {
        try {
            String clienteParam = ctx.pathParam("idCliente");
            int idCliente = Integer.parseInt(clienteParam);
            List<Cita> citas = service.obtenerPorCliente(idCliente);
            ctx.json(citas);
        } catch (NumberFormatException e) {
            ctx.status(400).json("ID de cliente inválido");
        } catch (Exception e) {
            ctx.status(500).json("Error al listar citas del cliente: " + e.getMessage());
        }
    }

    // GET /cita/asesor/{idAsesor}
    public void listarPorAsesor(Context ctx) {
        try {
            int idAsesor = Integer.parseInt(ctx.pathParam("idAsesor"));
            ctx.json(service.listarPorAsesor(idAsesor));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Error al listar por asesor"));
        }
    }

    public void eliminar(Context ctx) {
        try {
            int idCita = Integer.parseInt(ctx.pathParam("id"));
            // Aquí deberías validar que la cita pertenezca al usuario logueado por seguridad
            // Por ahora, lo haremos directo para solucionar tu bloqueo
            boolean eliminado = service.eliminarCita(idCita); // Necesitas crear este método en Service y Repository

            if (eliminado) {
                ctx.status(200).json(Map.of("mensaje", "Cita liberada"));
            } else {
                ctx.status(404).json(Map.of("error", "Cita no encontrada"));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Error eliminando cita: " + e.getMessage()));
        }
    }

    public void cancelar(Context ctx) {
        int idCita = Integer.parseInt(ctx.pathParam("id"));
        String resultado = service.cancelarCita(idCita);

        if ("OK".equals(resultado)) {
            ctx.json(Map.of("mensaje", "Cita cancelada y reembolso procesado"));
        } else {
            ctx.status(400).json(Map.of("error", resultado));
        }
    }

    public void reagendar(Context ctx) {
        try {
            int idCita = Integer.parseInt(ctx.pathParam("id"));
            Map<String, String> body = ctx.bodyAsClass(Map.class);

            LocalDate nuevaFecha = LocalDate.parse(body.get("fecha"));
            LocalTime nuevaHora = LocalTime.parse(body.get("hora"));
            String motivo = body.get("motivo");

            String resultado = service.reagendarCita(idCita, nuevaFecha, nuevaHora, motivo);

            if ("OK".equals(resultado)) {
                ctx.json(Map.of("mensaje", "Cita reagendada con éxito"));
            } else {
                ctx.status(409).json(Map.of("error", resultado));
            }
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", "Datos inválidos"));
        }
    }

    public void asignarAsesor(Context ctx) {
        try {
            // 1. Obtener ID de la Cita desde la URL
            int idCita = Integer.parseInt(ctx.pathParam("id"));

            // 2. Obtener ID del Asesor desde el JSON usando la nueva clase
            // Esto evita el error 400 de "Bad Request"
            org.example.model.AsignarAsesorRequest request = ctx.bodyAsClass(org.example.model.AsignarAsesorRequest.class);

            // Validar que venga el dato
            if (request.getIdAsesor() <= 0) {
                ctx.status(400).json(Map.of("error", "Debes seleccionar un asesor válido"));
                return;
            }

            // 3. Llamar al servicio
            String resultado = service.asignarAsesor(idCita, request.getIdAsesor());

            if ("OK".equals(resultado)) {
                ctx.json(Map.of("mensaje", "Asesor asignado correctamente"));
            } else {
                ctx.status(400).json(Map.of("error", resultado));
            }

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    public void actualizarEstado(Context ctx) {
        try {
            int idCita = Integer.parseInt(ctx.pathParam("id"));

            Map<String, Integer> body = ctx.bodyAsClass(Map.class);

            if (!body.containsKey("idEstado")) {
                ctx.status(400).json(Map.of("error", "Falta el parámetro idEstado"));
                return;
            }

            int nuevoEstado = body.get("idEstado");
            boolean exito = service.actualizarEstado(idCita, nuevoEstado);

            if (exito) {
                ctx.json(Map.of("mensaje", "Estado actualizado correctamente"));
            } else {
                ctx.status(400).json(Map.of("error", "No se pudo actualizar el estado"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }
}
