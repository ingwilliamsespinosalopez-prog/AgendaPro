package org.example.model;

import java.math.BigDecimal;

public class Servicio {
    private int idServicio;
    private String nombre;
    private BigDecimal precio;

    public Servicio() {}

    public Servicio(int idServicio, String nombre, BigDecimal precio) {
        this.idServicio = idServicio;
        this.nombre = nombre;
        this.precio = precio;
    }

    public int getIdServicio() { return idServicio; }
    public void setIdServicio(int idServicio) { this.idServicio = idServicio; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
}