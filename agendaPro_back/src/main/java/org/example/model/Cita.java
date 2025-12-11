package org.example.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.sql.Timestamp;
import com.fasterxml.jackson.annotation.JsonFormat;

public class Cita {

    private Integer idCita;
    private Integer idCliente;
    private Integer idAsesor;
    private Integer idServicio;
    private Integer idEstado;
    private Integer idModalidad;
    private Boolean pagado;
    private String notas;
    private Timestamp fechaCreacion;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate fechaCita;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime horaCita;

    public Cita() {
    }

    public Cita(Integer idCliente, Integer idAsesor, Integer idServicio, Integer idEstado, Integer idModalidad, LocalDate fechaCita, LocalTime horaCita, String notas) {
        this.idCliente = idCliente;
        this.idAsesor = idAsesor;
        this.idServicio = idServicio;
        this.idEstado = idEstado;
        this.idModalidad = idModalidad;
        this.fechaCita = fechaCita;
        this.horaCita = horaCita;
        this.notas = notas;
    }

    public Integer getIdCita() {
        return idCita;
    }

    public void setIdCita(Integer idCita) {
        this.idCita = idCita;
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public Integer getIdAsesor() {
        return idAsesor;
    }

    public void setIdAsesor(Integer idAsesor) {
        this.idAsesor = idAsesor;
    }

    public Integer getIdServicio() {
        return idServicio;
    }

    public void setIdServicio(Integer idServicio) {
        this.idServicio = idServicio;
    }

    public Integer getIdEstado() {
        return idEstado;
    }

    public void setIdEstado(Integer idEstado) {
        this.idEstado = idEstado;
    }

    public Integer getIdModalidad() {
        return idModalidad;
    }

    public void setIdModalidad(Integer idModalidad) {
        this.idModalidad = idModalidad;
    }

    public LocalDate getFechaCita() {
        return fechaCita;
    }

    public void setFechaCita(LocalDate fechaCita) {
        this.fechaCita = fechaCita;
    }

    public LocalTime getHoraCita() {
        return horaCita;
    }

    public void setHoraCita(LocalTime horaCita) {
        this.horaCita = horaCita;
    }

    public Boolean getPagado() {
        return pagado;
    }

    public void setPagado(Boolean pagado) {
        this.pagado = pagado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public Timestamp getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Timestamp fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}