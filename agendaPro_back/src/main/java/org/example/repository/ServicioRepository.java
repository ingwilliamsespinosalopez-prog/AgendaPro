package org.example.repository;

import org.example.config.DBconfig;
import org.example.model.Cita;
import org.example.model.CitaDetalleDTO;
import org.example.model.Servicio;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ServicioRepository {

    public List<Servicio> listarTodos() throws SQLException {
        String sql = "SELECT * FROM servicio";
        List<Servicio> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Servicio s = new Servicio();
                s.setIdServicio(rs.getInt("idServicio"));
                s.setNombre(rs.getString("nombre"));
                s.setPrecio(rs.getBigDecimal("precio"));
                lista.add(s);
            }
        }
        return lista;
    }
    public List<Servicio> listarPorEstado(Integer idEstado) throws SQLException {

        // 1. SQL CORREGIDO: JOIN entre cita y servicio para filtrar por estado de cita
        String sql = "SELECT s.idServicio, s.nombre, s.precio "
                + "FROM cita c "
                + "INNER JOIN servicio s ON c.idServicio = s.idServicio "
                + "WHERE c.idEstado = ?";

        List<Servicio> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idEstado);

            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    Servicio s = new Servicio();
                    // Usamos los alias de la consulta SQL: s.idServicio, s.nombre, s.precio
                    s.setIdServicio(rs.getInt("idServicio"));
                    s.setNombre(rs.getString("nombre"));
                    s.setPrecio(rs.getBigDecimal("precio"));
                    lista.add(s);
                }
            }
        }
        return lista;
    }
    public List<Servicio> listarPorFecha(String fechaCita) throws SQLException {
        String sql = "SELECT s.idServicio, s.nombre, s.precio "
                + "FROM cita c "
                + "INNER JOIN servicio s ON c.idServicio = s.idServicio "
                + "WHERE c.fechaCita = ?";

        List<Servicio> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, fechaCita);
            try (ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    Servicio s = new Servicio();
                    s.setIdServicio(rs.getInt("idServicio"));
                    s.setNombre(rs.getString("nombre"));
                    s.setPrecio(rs.getBigDecimal("precio"));
                    lista.add(s);
                }
            }
        }
        return lista;
    }

    public List<CitaDetalleDTO> listarPorFechaYEstado(String fechaParam, Integer idEstadoParam) throws SQLException {

        String sql = "SELECT "
                + "c.idCita, c.notas, c.fechaCita, c.horaCita, "
                + "s.nombre AS servicioNombre, "
                + "cl.nombre AS clienteNombre, "
                + "a.nombre AS asesorNombre, "
                + "ec.descripcion AS estado, "
                + "m.descripcion AS modalidad "
                + "FROM cita c "
                + "INNER JOIN servicio s ON c.idServicio = s.idServicio "
                + "INNER JOIN usuario cl ON c.idCliente = cl.idUsuario "
                + "INNER JOIN usuario a ON c.idAsesor = a.idUsuario "
                + "INNER JOIN estado_cita ec ON c.idEstado = ec.idEstado "
                + "INNER JOIN modalidad m ON c.idModalidad = m.idModalidad "
                + "WHERE c.fechaCita = ? AND c.idEstado = ?";

        List<CitaDetalleDTO> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, fechaParam);
            ps.setInt(2, idEstadoParam);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    CitaDetalleDTO dto = new CitaDetalleDTO();

                    dto.setClienteNombre(rs.getString("clienteNombre"));
                    dto.setAsesorNombre(rs.getString("asesorNombre"));
                    lista.add(dto);
                }
            }
        }
        return lista;
    }
}