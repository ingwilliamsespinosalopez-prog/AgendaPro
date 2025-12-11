package org.example.model;

import java.time.LocalDate;

public class Blog {

    private int idBlog;
    private int idUsuario;
    private String titulo;
    private String contenido;
    private String img; // <--- CAMBIO A STRING (URL)
    private LocalDate fechaPublicacion;
    private String categoria;
    private Boolean destacado;

    public Blog() {
    }

    // Constructor completo
    public Blog(int idBlog, int idUsuario, String titulo, String contenido, String img, LocalDate fechaPublicacion, String categoria, Boolean destacado) {
        this.idBlog = idBlog;
        this.idUsuario = idUsuario;
        this.titulo = titulo;
        this.contenido = contenido;
        this.img = img;
        this.fechaPublicacion = fechaPublicacion;
        this.categoria = categoria;
        this.destacado = destacado;
    }

    // Getters y Setters
    public int getIdBlog() { return idBlog; }
    public void setIdBlog(int idBlog) { this.idBlog = idBlog; }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }

    public LocalDate getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDate fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Boolean getDestacado() { return destacado; }
    public void setDestacado(Boolean destacado) { this.destacado = destacado; }
}