package org.example.repository;

import org.example.config.DBconfig;
import org.example.model.Pago;
import org.example.model.PagoDetalleDTO;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList;

public class PagoRepository {

    private final DataSource dataSource;


    public PagoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Pago registrarPago(Pago pago) throws SQLException {
        String sql = """
            INSERT INTO pago(idCita, monto, idTransaccion, idEstadoPago, idMetodoPago)
            VALUES (?, ?, ?, ?, ?)
        """;

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, pago.getIdCita());
            stmt.setBigDecimal(2, pago.getMonto());
            stmt.setString(3, pago.getIdTransaccion());
            stmt.setInt(4, pago.getIdEstadoPago());
            stmt.setInt(5, pago.getIdMetodoPago());
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    pago.setIdPago(rs.getInt(1));
                }
            }

            return pago;
        }
    }

    public List<Pago> listarTodos() throws SQLException {
        String sql = "SELECT * FROM pago ORDER BY fechaPago DESC";
        List<Pago> pagos = new ArrayList<>();

        try (Connection conn = DBconfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                pagos.add(mapResultSetToPago(rs));
            }
        }
        return pagos;
    }

    private Pago mapResultSetToPago(ResultSet rs) throws SQLException {
        Pago pago = new Pago();
        pago.setIdPago(rs.getInt("idPago"));
        pago.setIdCita(rs.getInt("idCita"));
        pago.setMonto(rs.getBigDecimal("monto"));
        pago.setIdTransaccion(rs.getString("idTransaccion"));
        pago.setIdEstadoPago(rs.getInt("idEstadoPago"));
        pago.setIdMetodoPago(rs.getInt("idMetodoPago"));
        pago.setFechaPago(rs.getTimestamp("fechaPago"));
        return pago;
    }

    public void guardarPagoYActualizarCita(Pago pago) throws SQLException {
        String sqlPago = "INSERT INTO pago(idUsuario, idCita, paypal_order_id, paypal_transaction_id, status, monto, moneda, fecha_pago) VALUES (?, ?, ?, ?, ?, ?, 'MXN', NOW())";
        String sqlUpdateCita = "UPDATE cita SET pagado = 1 WHERE idCita = ?";

        Connection conn = null;
        try {
            conn = DBconfig.getDataSource().getConnection();
            conn.setAutoCommit(false); // Iniciar Transacción

            // 1. Insertar el Pago
            try (PreparedStatement stmtPago = conn.prepareStatement(sqlPago)) {
                stmtPago.setInt(1, pago.getIdUsuario());
                stmtPago.setInt(2, pago.getIdCita());
                stmtPago.setString(3, pago.getPaypalOrderId());
                stmtPago.setString(4, pago.getIdTransaccion());
                stmtPago.setString(5, pago.getStatus());
                stmtPago.setBigDecimal(6, pago.getMonto());
                stmtPago.executeUpdate();
            }

            // 2. Actualizar la Cita
            try (PreparedStatement stmtCita = conn.prepareStatement(sqlUpdateCita)) {
                stmtCita.setInt(1, pago.getIdCita());
                stmtCita.executeUpdate();
            }

            conn.commit(); // Confirmar cambios

        } catch (SQLException e) {
            if (conn != null) conn.rollback(); // Deshacer si falla
            throw e;
        } finally {
            if (conn != null) {
                conn.setAutoCommit(true);
                conn.close();
            }
        }
    }

    // Obtener el ID de transacción de PayPal por el ID de la Cita
    public String obtenerTransactionIdPorCita(int idCita) throws SQLException {
        String sql = "SELECT paypal_transaction_id FROM pago WHERE idCita = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idCita);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getString("paypal_transaction_id");
            }
        }
        return null;
    }

    public List<PagoDetalleDTO> listarTodosDetallado() throws SQLException {
        // Hacemos JOIN para obtener los nombres reales en lugar de solo IDs
        String sql = """
            SELECT 
                p.idPago,
                CONCAT(u.nombre, ' ', u.apellido) as cliente,
                p.idCita,
                s.nombre as servicio,
                c.fechaCita,
                c.horaCita,
                p.monto,
                'PayPal' as metodo, 
                p.status as estado,
                p.paypal_transaction_id
            FROM pago p
            JOIN usuario u ON p.idUsuario = u.idUsuario
            JOIN cita c ON p.idCita = c.idCita
            JOIN servicio s ON c.idServicio = s.idServicio
            ORDER BY p.fecha_pago DESC
        """;

        List<PagoDetalleDTO> lista = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                PagoDetalleDTO dto = new PagoDetalleDTO();
                dto.idPago = rs.getInt("idPago");
                dto.clienteNombre = rs.getString("cliente");
                dto.idCita = rs.getInt("idCita");
                dto.servicioNombre = rs.getString("servicio");
                // Convertimos fecha/hora a String para facilitar visualización
                dto.fechaCita = rs.getString("fechaCita");
                dto.horaCita = rs.getString("horaCita");
                dto.monto = rs.getBigDecimal("monto");
                dto.metodoPago = rs.getString("metodo");
                dto.estadoPago = rs.getString("estado");
                dto.paypalTransactionId = rs.getString("paypal_transaction_id");

                lista.add(dto);
            }
        }
        return lista;
    }

    public void actualizarEstadoPagoPorCita(int idCita, String nuevoEstado) throws SQLException {
        String sql = "UPDATE pago SET status = ? WHERE idCita = ?";
        try (Connection con = DBconfig.getDataSource().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, nuevoEstado);
            ps.setInt(2, idCita);
            ps.executeUpdate();
        }
    }

}


