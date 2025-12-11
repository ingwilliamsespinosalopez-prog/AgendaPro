package org.example.service;

import org.example.model.Usuario;
import org.example.repository.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public void actualizarFoto(int idUsuario, String urlFoto) throws SQLException {
        repository.actualizarFoto(idUsuario, urlFoto);
    }

    public void registrar(Usuario usuario) throws SQLException {
        if (repository.verificarCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado.");
        }

        if (usuario.getContrasena() != null) {
            String hash = BCrypt.hashpw(usuario.getContrasena(), BCrypt.gensalt());
            usuario.setContrasena(hash);
        }

        repository.registrarUsuario(usuario);
    }

    public Optional<Usuario> getCorreo(String correo) throws SQLException {
        return repository.getCorreo(correo);
    }

    public Optional<Usuario> getId(int id) throws SQLException {
        return repository.getId(id);
    }

    public List<Usuario> listarAsesores() {
        try { return repository.listarAsesores(); } catch (Exception e) { return List.of(); }
    }

    public void editarPerfil(Usuario usuario) throws SQLException {
        repository.updatePerfil(usuario);
    }

    public void recuperarPassword(String correo, String nuevaPassword) throws SQLException {
        if (!repository.verificarCorreo(correo)) {
            throw new IllegalArgumentException("El correo proporcionado no está registrado.");
        }

        String hash = BCrypt.hashpw(nuevaPassword, BCrypt.gensalt());
        repository.updatePassword(correo, hash);
    }


    public boolean cambiarEstado(int idUsuario, String nuevoEstado) {
        try {
            return repository.cambiarEstado(idUsuario, nuevoEstado);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Usuario> listarTodos() {
        try {
            return repository.listarTodos();
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }
}