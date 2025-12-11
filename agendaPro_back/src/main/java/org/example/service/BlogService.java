package org.example.service;

import org.example.model.Blog;
import org.example.repository.BlogRepository;
import java.util.List;
import java.sql.SQLException;

public class BlogService {

    private final BlogRepository repository;

    public BlogService(BlogRepository repository) {
        this.repository = repository;
    }

    public Integer crearPublicacion(Blog blog) {
        try {
            return repository.crear(blog);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Blog> verPublicacion() {
        try {
            return repository.listarTodos();
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public Blog obtenerPorId(int id) {
        try {
            return repository.obtenerPorId(id);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean actualizarPublicacion(Blog blog) {
        try {
            return repository.actualizar(blog);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean eliminarPublicacion(int id) {
        try {
            return repository.eliminar(id);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    public List<Blog> obtenerPorEstado(Integer idEstado) {
        try {
            return repository.listarPorEstado(idEstado);
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }
    public void cambiarEstado(Integer idBlog, Integer nuevoIdEstado) throws SQLException {
        repository.actualizarEstado(idBlog, nuevoIdEstado);
    }
}