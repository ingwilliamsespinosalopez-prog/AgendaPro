package org.example.service;

import org.example.model.CitaDetalleDTO;
import org.example.model.Servicio;
import org.example.repository.ServicioRepository;

import java.time.LocalDate;
import java.util.List;
import java.sql.SQLException;

public class ServicioService {
    private final ServicioRepository repository;

    public ServicioService(ServicioRepository repository) {
        this.repository = repository;
    }

    public List<Servicio> obtenerTodos() {
        try {
            return repository.listarTodos();
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }
    public List<Servicio> obtenerPorEstado(Integer idEstado) {
        try {
            return repository.listarPorEstado(idEstado); // Pasa el Integer directamente
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }
    public List<Servicio> obtenerPorFecha(String fechaCita) {
        try {
            return repository.listarPorFecha(fechaCita);
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }
    public List<CitaDetalleDTO> obtenerPorFechaYEstado(String fechaCita, Integer idEstado) {
        try {
            // Llama al repositorio, que ahora devuelve List<CitaDetalleDTO>
            return repository.listarPorFechaYEstado(fechaCita, idEstado);
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of(); // Devuelve una lista vacía en caso de error
        }
    }
}