package org.example.repository;

import org.example.config.DBconfig;
import org.example.model.Usuario;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UsuarioRepository {

    private final DataSource dataSource;

    public UsuarioRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void actualizarFoto(int idUsuario, String urlFoto) throws SQLException {
        String sql = "UPDATE usuario SET img = ? WHERE idUsuario = ?";

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, urlFoto);
            stmt.setInt(2, idUsuario);

            stmt.executeUpdate();
        }
    }
    public boolean cambiarEstado(int idUsuario, String nuevoEstado) throws SQLException {
        String sql = "UPDATE usuario SET estado = ? WHERE idUsuario = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, nuevoEstado);
            ps.setInt(2, idUsuario);

            return ps.executeUpdate() > 0;
        }
    }

    public String obtenerEstado(int idUsuario) throws SQLException {
        String sql = "SELECT estado FROM usuario WHERE idUsuario = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idUsuario);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("estado");
                }
            }

            return null;
        }
    }

    public boolean eliminarUsuario(int idUsuario) throws SQLException {
        String sql = "DELETE FROM usuario WHERE idUsuario = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            return ps.executeUpdate() > 0;
        }
    }

    public void registrarUsuario(Usuario usuario) throws SQLException {
        String sql = "INSERT INTO usuario (idRol, nombre, apellido, segundoApellido, rfc, curp, contrasena, correo, telefono, img, estado) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')";

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuario.getIdRol());
            stmt.setString(2, usuario.getNombre());
            stmt.setString(3, usuario.getApellido());
            stmt.setString(4, usuario.getSegundoApellido());
            stmt.setString(5, usuario.getRfc());
            stmt.setString(6, usuario.getCurp());
            stmt.setString(7, usuario.getContrasena());
            stmt.setString(8, usuario.getCorreo());
            stmt.setString(9, usuario.getTelefono());
            stmt.setString(10, usuario.getImg()); // Ahora guardamos la URL si existe

            stmt.executeUpdate();
        }
    }

    public boolean verificarCorreo(String correo) throws SQLException {
        String sql = "SELECT COUNT(*) FROM usuario WHERE correo = ?";
        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, correo);
            ResultSet rs = stmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        }
    }

    public Optional<Usuario> getCorreo(String correo) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE correo = ?";
        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, correo);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return Optional.of(mapearUsuario(rs));
        }
        return Optional.empty();
    }

    public Optional<Usuario> getId(int id) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE idUsuario = ?";
        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return Optional.of(mapearUsuario(rs));
        }
        return Optional.empty();
    }

    public void updatePerfil(Usuario usuario) throws SQLException {
        // No actualizamos la foto aquí, para eso está el endpoint específico
        String sql = "UPDATE usuario SET nombre=?, apellido=?, segundoApellido=?, rfc=?, curp=?, telefono=?, correo=?, idRol=? WHERE idUsuario=?";

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, usuario.getNombre());
            stmt.setString(2, usuario.getApellido());
            stmt.setString(3, usuario.getSegundoApellido());
            stmt.setString(4, usuario.getRfc());
            stmt.setString(5, usuario.getCurp());
            stmt.setString(6, usuario.getTelefono());
            stmt.setString(7, usuario.getCorreo());
            stmt.setInt(8, usuario.getIdRol());
            stmt.setInt(9, usuario.getIdUsuario());

            int filas = stmt.executeUpdate();
            if (filas == 0) {
                throw new IllegalArgumentException("No se encontró el usuario con ID " + usuario.getIdUsuario());
            }
        }
    }

    public int contarPublicaciones() {
        String sql = "SELECT COUNT(*) as total FROM blog";

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                return rs.getInt("total");
            }
            return 0;

        } catch (SQLException e) {
            System.err.println("Error al contar publicaciones: " + e.getMessage());
            return 0;
        }
    }
    public int contarCitas() {
        String sql = "SELECT COUNT(*) as total FROM cita";

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                return rs.getInt("total");
            }
            return 0;

        } catch (SQLException e) {
            System.err.println("Error al contar citas: " + e.getMessage());
            return 0;
        }
    }
    public int contarClientes() {
        String sql = "SELECT COUNT(*) as total FROM usuario WHERE idRol = 2";

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                return rs.getInt("total");
            }
            return 0;

        } catch (SQLException e) {
            System.err.println("Error al contar clientes: " + e.getMessage());
            return 0;
        }
    }

    private Usuario mapearUsuario(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setIdUsuario(rs.getInt("idUsuario"));
        u.setNombre(rs.getString("nombre"));
        u.setApellido(rs.getString("apellido"));
        u.setSegundoApellido(rs.getString("segundoApellido"));
        u.setTelefono(rs.getString("telefono"));
        u.setCorreo(rs.getString("correo"));
        u.setContrasena(rs.getString("contrasena"));
        u.setRfc(rs.getString("rfc"));
        u.setCurp(rs.getString("curp"));
        u.setIdRol(rs.getInt("idRol"));
        u.setEstado(rs.getString("estado"));

        // --- CAMBIO: Leemos la URL de la imagen ---
        u.setImg(rs.getString("img"));

        return u;
    }

    public void updatePassword(String correo, String nuevaPasswordEncriptada) throws SQLException {
        String sql = "UPDATE usuario SET contrasena = ? WHERE correo = ?";
        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, nuevaPasswordEncriptada);
            stmt.setString(2, correo);
            stmt.executeUpdate();
        }
    }

    public List<Usuario> listarAsesores() throws SQLException {
        String sql = "SELECT idUsuario, idRol, nombre, apellido, img FROM usuario WHERE idRol = 3";
        List<Usuario> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Usuario u = new Usuario();
                u.setIdUsuario(rs.getInt("idUsuario"));
                u.setIdRol(rs.getInt("idRol"));
                u.setNombre(rs.getString("nombre"));
                u.setApellido(rs.getString("apellido"));
                u.setImg(rs.getString("img"));
                lista.add(u);
            }
        }
        return lista;
    }

    public List<Usuario> listarTodos() throws SQLException {
        String sql = "SELECT * FROM usuario ORDER BY idUsuario DESC";
        List<Usuario> lista = new ArrayList<>();

        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearUsuario(rs));
            }
        }
        return lista;
    }
}
