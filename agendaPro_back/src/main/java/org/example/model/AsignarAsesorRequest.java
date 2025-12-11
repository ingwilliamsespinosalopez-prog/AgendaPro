package org.example.model;

public class AsignarAsesorRequest {
    private int idAsesor;

    // Constructor vacío (necesario para Jackson)
    public AsignarAsesorRequest() {}

    // Getters y Setters (OBLIGATORIOS)
    public int getIdAsesor() {
        return idAsesor;
    }

    public void setIdAsesor(int idAsesor) {
        this.idAsesor = idAsesor;
    }
}