package org.example.controller;

import io.javalin.http.Context;
import io.javalin.http.UploadedFile;
import io.javalin.http.ForbiddenResponse;
import org.example.model.Blog;
import org.example.service.BlogService;
import org.example.service.FileService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class BlogController {

    private final BlogService service;
    private final FileService fileService = new FileService(); // Para guardar imágenes

    public BlogController(BlogService service) {
        this.service = service;
    }

    // 1. CREAR (Con subida de imagen)
    public void crearPublicacion(Context ctx) {
        try {
            // Validar sesión
            Integer idUsuarioAutenticado = ctx.attribute("usuarioId");
            if (idUsuarioAutenticado == null) throw new ForbiddenResponse("Usuario no autenticado");

            // Obtener datos del formulario (multipart)
            String titulo = ctx.formParam("titulo");
            String contenido = ctx.formParam("contenido");
            String categoria = ctx.formParam("categoria");
            Boolean destacado = Boolean.parseBoolean(ctx.formParam("destacado"));

            // Manejar imagen
            UploadedFile archivo = ctx.uploadedFile("imagen");
            String urlImagen = null;
            if (archivo != null) {
                urlImagen = fileService.guardarImagenLocal(archivo, idUsuarioAutenticado);
            }

            // Crear objeto
            Blog blog = new Blog();
            blog.setIdUsuario(idUsuarioAutenticado);
            blog.setTitulo(titulo);
            blog.setContenido(contenido);
            blog.setCategoria(categoria);
            blog.setDestacado(destacado);
            blog.setFechaPublicacion(LocalDate.now());
            blog.setImg(urlImagen);

            Integer idGenerado = service.crearPublicacion(blog);

            if (idGenerado != null && idGenerado > 0) {
                ctx.status(201).json(Map.of("mensaje", "Blog creado", "id", idGenerado));
            } else {
                ctx.status(500).json(Map.of("error", "No se pudo crear el blog"));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    // 2. VER LISTA
    public void verPublicaciones(Context ctx) {
        ctx.json(service.verPublicacion());
    }

    // 3. VER UNO SOLO
    public void verUno(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Blog blog = service.obtenerPorId(id);
        if (blog != null) ctx.json(blog);
        else ctx.status(404).json(Map.of("error", "Blog no encontrado"));
    }

    // 4. EDITAR (Con imagen opcional)
    public void editarPublicacion(Context ctx) {
        try {
            int idBlog = Integer.parseInt(ctx.pathParam("id"));

            Blog blogExistente = service.obtenerPorId(idBlog);
            if (blogExistente == null) {
                ctx.status(404).json(Map.of("error", "Blog no encontrado"));
                return;
            }

            // Datos formulario
            String titulo = ctx.formParam("titulo");
            String contenido = ctx.formParam("contenido");
            String categoria = ctx.formParam("categoria");


            String fechaStr = ctx.formParam("fechaPublicacion");
            UploadedFile archivo = ctx.uploadedFile("imagen");
            String urlImagen = blogExistente.getImg();

            if (archivo != null) {
                if(urlImagen != null) fileService.borrarImagenLocal(urlImagen);
                urlImagen = fileService.guardarImagenLocal(archivo, blogExistente.getIdUsuario());
            }


            blogExistente.setTitulo(titulo);
            blogExistente.setContenido(contenido);
            blogExistente.setCategoria(categoria);
            blogExistente.setImg(urlImagen);


            if (fechaStr != null && !fechaStr.isEmpty()) {
                // LocalDate.parse acepta formato "YYYY-MM-DD" por defecto
                blogExistente.setFechaPublicacion(LocalDate.parse(fechaStr));
            }

            if(ctx.formParam("destacado") != null) {
                blogExistente.setDestacado(Boolean.parseBoolean(ctx.formParam("destacado")));
            }

            boolean actualizado = service.actualizarPublicacion(blogExistente);

            if (actualizado) ctx.json(Map.of("mensaje", "Blog actualizado"));
            else ctx.status(500).json(Map.of("error", "Error al actualizar en BD"));

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }


    public void eliminarPublicacion(Context ctx) {
        int idBlog = Integer.parseInt(ctx.pathParam("id"));


        Blog blog = service.obtenerPorId(idBlog);
        if (blog != null && blog.getImg() != null) {
            fileService.borrarImagenLocal(blog.getImg());
        }

        boolean eliminado = service.eliminarPublicacion(idBlog);
        if (eliminado) ctx.json(Map.of("mensaje", "Blog eliminado"));
        else ctx.status(400).json(Map.of("error", "No se pudo eliminar"));
    }
    public void listarPorEstado(Context ctx) {
        try {
            String idParam = ctx.pathParam("idEstado");
            Integer idEstado = Integer.parseInt(idParam);

            List<Blog> blogs = service.obtenerPorEstado(idEstado);
            ctx.json(blogs);

        } catch (NumberFormatException e) {
            ctx.status(400).json("El ID de estado proporcionado no es un número válido.");
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error interno al obtener blogs por estado");
        }
    }

    public void cambiarEstado(Context ctx) {
        try {
            String idBlogParam = ctx.pathParam("id");
            Integer idBlog = Integer.parseInt(idBlogParam);

            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            Integer nuevoIdEstado = (Integer) body.get("idEstado");

            if (nuevoIdEstado == null) {
                ctx.status(400).json("Se requiere el campo 'idEstado' en el cuerpo de la petición.");
                return;
            }
            service.cambiarEstado(idBlog, nuevoIdEstado);
            ctx.status(200).json("Estado del blog ID " + idBlog + " cambiado exitosamente a estado " + nuevoIdEstado);

        } catch (NumberFormatException e) {
            ctx.status(400).json("El ID de blog o el ID de estado no son números válidos.");
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json("Error interno al cambiar el estado del blog.");
        }
    }
}