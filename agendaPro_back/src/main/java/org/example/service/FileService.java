package org.example.service;

import io.javalin.http.UploadedFile;
import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

public class FileService {

    private static final String UPLOAD_DIR = "uploads";

    public String guardarImagenLocal(UploadedFile archivo, int idUsuario) {
        try {
            String extension = "";
            int i = archivo.filename().lastIndexOf('.');
            if (i > 0) extension = archivo.filename().substring(i);

            String nombreArchivo = "perfil_" + idUsuario + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path rutaDestino = Paths.get(UPLOAD_DIR, nombreArchivo);

            try (InputStream is = archivo.content()) {
                Files.copy(is, rutaDestino, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/" + nombreArchivo;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void borrarImagenLocal(String rutaRelativa) {
        if (rutaRelativa == null || rutaRelativa.isEmpty()) return;

        try {
            // La ruta en BD viene como "/uploads/foto.jpg", quitamos la primera barra
            // para que el sistema de archivos la encuentre en la carpeta "uploads" del proyecto
            String rutaLimpia = rutaRelativa.startsWith("/") ? rutaRelativa.substring(1) : rutaRelativa;

            Path rutaArchivo = Paths.get(rutaLimpia);
            File archivo = rutaArchivo.toFile();

            if (archivo.exists()) {
                if (archivo.delete()) {
                    System.out.println("🗑️ Imagen eliminada: " + rutaLimpia);
                } else {
                    System.err.println("⚠️ No se pudo eliminar el archivo: " + rutaLimpia);
                }
            }
        } catch (Exception e) {
            System.err.println("Error al intentar borrar imagen: " + e.getMessage());
        }
    }
}