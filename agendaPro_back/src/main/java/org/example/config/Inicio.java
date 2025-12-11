package org.example.config;

import javax.sql.DataSource;

import org.example.controller.*;
import org.example.repository.*;
import org.example.routers.*;

import org.example.service.*;

public class Inicio {

    private final DataSource dataSource;

    public Inicio(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // --- Módulo Usuario ---
    public RoutesUsuario inicioUsuario() {
        // Usamos this.dataSource en lugar de llamar a DBconfig otra vez
        UsuarioRepository usuarioRepository = new UsuarioRepository(this.dataSource);
        UsuarioService usuarioService = new UsuarioService(usuarioRepository);
        UsuarioController usuarioController = new UsuarioController(usuarioService,usuarioRepository);
        return new RoutesUsuario(usuarioController);
    }

    // --- Módulo Cita ---
    public RoutesCita inicioCita() {
        CitaRepository citaRepository = new CitaRepository();

        // CORRECCIÓN: Necesitamos PagoRepository aquí también
        PagoRepository pagoRepository = new PagoRepository(this.dataSource);

        // Pasamos ambos repositorios al servicio
        CitaService citaService = new CitaService(citaRepository, pagoRepository);

        CitaController citaController = new CitaController(citaService);
        return new RoutesCita(citaController);
    }

    // --- Módulo Pago ---
    // Quitamos 'static' para poder usar 'this.dataSource'
    public RoutePago inicioPago() {
        PagoRepository pagoRepository = new PagoRepository(this.dataSource);
        CitaRepository citaRepository = new CitaRepository();

        // Ojo: Si PagoService también cambió su constructor, ajusta aquí.
        // Si PagoService solo usa estos dos, está bien:
        CitaService citaService = new CitaService(citaRepository, pagoRepository);
        PagoService pagoService = new PagoService(pagoRepository, citaService);

        PagoController pagoController = new PagoController(pagoService);
        return new RoutePago(pagoController);
    }

    // --- Módulo Blog ---
    public RouteBlog inicioBlog() {
        BlogRepository blogRepository = new BlogRepository(this.dataSource);
        BlogService blogService = new BlogService(blogRepository);
        BlogController blogController = new BlogController(blogService);
        return new RouteBlog(blogController);
    }

    public RoutePayment inicioPayPal() {
        PaymentController paymentController = new PaymentController();
        return new RoutePayment(paymentController);
    }

    public RouteServicio inicioServicio() {
        ServicioRepository repo = new ServicioRepository();
        ServicioService service = new ServicioService(repo);
        ServicioController controller = new ServicioController(service);
        return new RouteServicio(controller);
    }
}
