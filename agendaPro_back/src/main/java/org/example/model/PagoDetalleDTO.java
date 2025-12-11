package org.example.model;

import java.math.BigDecimal;

public class PagoDetalleDTO {
    public int idPago;
    public String clienteNombre;
    public int idCita;
    public String servicioNombre;
    public String fechaCita;
    public String horaCita;
    public BigDecimal monto;
    public String metodoPago;
    public String estadoPago;
    public String paypalTransactionId;

    public PagoDetalleDTO() {}
}