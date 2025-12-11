package org.example.controller;

import io.javalin.http.Context;
import org.example.model.CitaDetalleDTO;
import org.example.model.Servicio;
import org.example.service.ServicioService;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class ServicioController {

    private final ServicioService service;

    public ServicioController(ServicioService service) {
        this.service = service;
    }

    public void listar(Context ctx) {
        try {

            List<Servicio> servicios = service.obtenerTodos();
            ctx.json(servicios);

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error interno al obtener los servicios");
        }
    }
    public void listarPorEstado(Context ctx) {
        try {
            // 1. Obtener el 'id' de la URL: /api/servicios/filtrar/1
            String idParam = ctx.pathParam("id");
            Integer idEstado = Integer.parseInt(idParam);

            // 2. Pasar el 'idEstado' al servicio
            List<Servicio> servicios = service.obtenerPorEstado(idEstado);
            ctx.json(servicios);

        } catch (NumberFormatException e) {
            // Manejar el caso si el 'id' no es un número
            ctx.status(400).json("El ID de estado proporcionado no es un número válido.");
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error interno al obtener los servicios");
        }
    }

    public void listarPorFecha(Context ctx) {
        try {
            // 1. Obtener la fecha de la URL: /api/servicios/filtrar-por-fecha/2025-12-31
            String fechaParam = ctx.pathParam("fecha");

            // 2. Pasar la fecha (como String) al servicio
            List<Servicio> servicios = service.obtenerPorFecha(fechaParam);

            ctx.json(servicios);

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error interno al obtener los servicios por fecha");
        }
    }
    public void listarPorEstadoFecha(Context ctx) {
        try {
            String fechaParam = ctx.pathParam("fecha");
            String idEstadoParam = ctx.pathParam("id");

            Integer idEstado = Integer.parseInt(idEstadoParam);
            List<CitaDetalleDTO> solicitudes = service.obtenerPorFechaYEstado(fechaParam, idEstado);
            ctx.json(solicitudes);

        } catch (NumberFormatException e) {
            ctx.status(400).json("El ID de estado proporcionado no es un número válido.");
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error interno al obtener las solicitudes por fecha y estado");
        }
    }
}