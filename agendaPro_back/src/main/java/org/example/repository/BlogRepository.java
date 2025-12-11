package org.example.repository;

import org.example.config.DBconfig;
import org.example.model.Blog;
import javax.sql.DataSource;
import java.sql.*;
import java.util.List;
import java.util.ArrayList;

public class BlogRepository {
    private final DataSource dataSource;

    public BlogRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public int crear(Blog b) throws SQLException {
        String sql = """
            INSERT INTO blog (
                idUsuario, titulo, contenido, img, fechaPublicacion, categoria, destacado
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, b.getIdUsuario());
            ps.setString(2, b.getTitulo());
            ps.setString(3, b.getContenido());
            ps.setString(4, b.getImg()); // Guardamos URL
            ps.setDate(5, Date.valueOf(b.getFechaPublicacion()));
            ps.setString(6, b.getCategoria());
            ps.setBoolean(7, b.getDestacado());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) return rs.getInt(1);
                }
            }
        }
        return -1;
    }

    // --- NUEVO: ACTUALIZAR ---
    public boolean actualizar(Blog b) throws SQLException {
        // CORRECCIÓN: Agregamos fechaPublicacion al SQL
        String sql = """
            UPDATE blog SET 
                titulo = ?, contenido = ?, img = ?, categoria = ?, destacado = ?, fechaPublicacion = ?
            WHERE idBlog = ?
        """;

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, b.getTitulo());
            ps.setString(2, b.getContenido());
            ps.setString(3, b.getImg());
            ps.setString(4, b.getCategoria());
            ps.setBoolean(5, b.getDestacado());

            // CORRECCIÓN: Asignar la fecha (parámetro 6)
            ps.setDate(6, Date.valueOf(b.getFechaPublicacion()));

            // El ID pasa a ser el parámetro 7
            ps.setInt(7, b.getIdBlog());

            return ps.executeUpdate() > 0;
        }
    }

    // --- NUEVO: ELIMINAR ---
    public boolean eliminar(int idBlog) throws SQLException {
        String sql = "DELETE FROM blog WHERE idBlog = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idBlog);
            return ps.executeUpdate() > 0;
        }
    }

    // --- NUEVO: OBTENER POR ID (Para editar) ---
    public Blog obtenerPorId(int id) throws SQLException {
        String sql = "SELECT * FROM blog WHERE idBlog = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToBlog(rs);
            }
        }
        return null;
    }

    public List<Blog> listarTodos() throws SQLException {
        String sql = "SELECT * FROM blog ORDER BY fechaPublicacion DESC";
        List<Blog> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapResultSetToBlog(rs));
            }
        }
        return lista;
    }

    private Blog mapResultSetToBlog(ResultSet rs) throws SQLException {
        Blog b = new Blog();
        b.setIdBlog(rs.getInt("idBlog"));
        b.setIdUsuario(rs.getInt("idUsuario"));
        b.setTitulo(rs.getString("titulo"));
        b.setContenido(rs.getString("contenido"));
        b.setImg(rs.getString("img")); // Leemos String
        Date fechaDb = rs.getDate("fechaPublicacion");
        if (fechaDb != null) {
            b.setFechaPublicacion(fechaDb.toLocalDate());
        }
        b.setCategoria(rs.getString("categoria"));
        b.setDestacado(rs.getBoolean("destacado"));
        return b;
    }
    public List<Blog> listarPorEstado(Integer idEstado) throws SQLException {

        String sql = "SELECT * FROM blog WHERE idEstado = ?";
        List<Blog> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idEstado);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {

                    Blog b = new Blog();
                    b.setIdBlog(rs.getInt("idBlog"));
                    b.setTitulo(rs.getString("titulo"));
                    b.setContenido(rs.getString("contenido"));

                    lista.add(b);
                }
            }
        }
        return lista;
    }
    // Código en la clase BlogRepository.java

    public void actualizarEstado(Integer idBlog, Integer nuevoIdEstado) throws SQLException {
        String sql = "UPDATE blog SET idEstado = ? WHERE idBlog = ?";

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, nuevoIdEstado);

            ps.setInt(2, idBlog);
            int rowsAffected = ps.executeUpdate();

            if (rowsAffected == 0) {
                throw new SQLException("No se encontró el blog con ID " + idBlog + " para actualizar.");
            }
        }
    }
}