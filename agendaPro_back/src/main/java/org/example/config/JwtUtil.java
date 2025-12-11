package org.example.config;

import io.jsonwebtoken.*;
import org.example.model.Usuario;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = "clave_super_secreta_muy_segura_de_32_bytes";

    public static String generarToken(Usuario usuario) {
        Key key = new SecretKeySpec(SECRET_KEY.getBytes(), SignatureAlgorithm.HS256.getJcaName());

        int id = usuario.getIdUsuario();
        int rol = usuario.getIdRol();

        String token = Jwts.builder()
                .setSubject(usuario.getCorreo())
                .claim("id", id)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 28800000))
                .signWith(key)
                .compact();

        System.out.println("Token: " + token);
        return token;
    }

    public static Claims validarToken(String token) throws JwtException {
        System.out.println("validando token...");
        System.out.println("Token: " + token);

        JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build();

        Claims claims = parser.parseClaimsJws(token).getBody();
        System.out.println("Claims de token: " + claims);

        Object rawId = claims.get("id");
        Object rawRol = claims.get("rol");

        int id = extraerEnteroSeguro(rawId);
        int rol = extraerEnteroSeguro(rawRol);

        claims.put("id", id);
        claims.put("rol", rol);

        System.out.println("Token validado");
        System.out.println("Usuario ID" + id);
        System.out.println("Rol" + rol);

        return claims;
    }
    public static int extraerEnteroSeguro(Object valor) {
        System.out.println("Extrayendo: " + valor + " (tipo: " + tipo(valor) + ")");
        if (valor instanceof Integer) {
            return (Integer) valor;
        } else if (valor instanceof Number) {
            return ((Number) valor).intValue();
        } else if (valor instanceof String) {
            try {
                return Integer.parseInt(((String) valor).trim());
            } catch (NumberFormatException e) {
                System.out.println("Error de entero: " + valor);
            }
        } else {
            System.out.println("Tipo denegado: " + tipo(valor));
        }
        return -1;
    }

    private static String tipo(Object obj) {
        return obj != null ? obj.getClass().getSimpleName() : "null";
    }
}