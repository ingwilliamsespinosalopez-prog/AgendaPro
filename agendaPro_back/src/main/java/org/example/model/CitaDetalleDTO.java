package org.example.model;

import com.fasterxml.jackson.annotation.JsonFormat; // Asegúrate de tener Jackson
import java.time.LocalDate;
import java.time.LocalTime;

public class CitaDetalleDTO {
    private int idCita;
    private String clienteNombre;
    private String servicioNombre;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime hora;

    private String modalidad;
    private String estado;
    private String asesorNombre;
    private String notas;

    public CitaDetalleDTO() {}

    // === GETTERS Y SETTERS (OBLIGATORIOS PARA EL JSON) ===
    public int getIdCita() { return idCita; }
    public void setIdCita(int idCita) { this.idCita = idCita; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getServicioNombre() { return servicioNombre; }
    public void setServicioNombre(String servicioNombre) { this.servicioNombre = servicioNombre; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getAsesorNombre() { return asesorNombre; }
    public void setAsesorNombre(String asesorNombre) { this.asesorNombre = asesorNombre; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}