package org.example.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Pago {

    private Integer idPago;
    private Integer idCita;
    private BigDecimal monto;
    private String idTransaccion;
    private Integer idEstadoPago;
    private Integer idMetodoPago;
    private Timestamp fechaPago;

    private Integer idUsuario;
    private String paypalOrderId;
    private String status;
    private String moneda;

    public Pago() {}

    public Pago(Integer idCita, BigDecimal monto, String idTransaccion, Integer idEstadoPago, Integer idMetodoPago) {
        this.idCita = idCita;
        this.monto = monto;
        this.idTransaccion = idTransaccion;
        this.idEstadoPago = idEstadoPago;
        this.idMetodoPago = idMetodoPago;
    }

    public Integer getIdPago() { return idPago; }
    public void setIdPago(Integer idPago) { this.idPago = idPago; }

    public Integer getIdCita() { return idCita; }
    public void setIdCita(Integer idCita) { this.idCita = idCita; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getIdTransaccion() { return idTransaccion; }
    public void setIdTransaccion(String idTransaccion) { this.idTransaccion = idTransaccion; }

    public Integer getIdEstadoPago() { return idEstadoPago; }
    public void setIdEstadoPago(Integer idEstadoPago) { this.idEstadoPago = idEstadoPago; }

    public Integer getIdMetodoPago() { return idMetodoPago; }
    public void setIdMetodoPago(Integer idMetodoPago) { this.idMetodoPago = idMetodoPago; }

    public Timestamp getFechaPago() { return fechaPago; }
    public void setFechaPago(Timestamp fechaPago) { this.fechaPago = fechaPago; }

    // Getters y Setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getPaypalOrderId() { return paypalOrderId; }
    public void setPaypalOrderId(String paypalOrderId) { this.paypalOrderId = paypalOrderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
}