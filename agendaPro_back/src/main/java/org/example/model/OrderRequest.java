package org.example.model;

public class OrderRequest {
    private double amount;
    private String currency;
    private int idCita;
    private  int idUsuario;

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public int getIdCita() { return idCita; }
    public void setIdCita (int idCita) { this.idCita = idCita; }
    public  int getIdUsuario () { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}