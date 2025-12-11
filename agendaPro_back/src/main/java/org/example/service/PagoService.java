package org.example.service;

import org.example.model.Pago;
import org.example.model.PagoDetalleDTO;
import org.example.repository.PagoRepository;
import java.util.List;

public class PagoService {

    private final PagoRepository pagoRepository;
    private final CitaService citaService;

    public PagoService(PagoRepository pagoRepository, CitaService citaService) {
        this.pagoRepository = pagoRepository;
        this.citaService = citaService;
    }

    public Pago registrarPago(Pago pago) throws Exception {
        Pago pagoCreado = pagoRepository.registrarPago(pago);

        boolean citaActualizada = citaService.marcarPagado(pago.getIdCita());

        if (!citaActualizada) {
            System.err.println("Advertencia: Pago registrado, pero la Cita (ID: " + pago.getIdCita() + ") no se marcó como pagada.");
        }

        return pagoCreado;
    }

    public List<Pago> listarTodos() throws Exception {
        return pagoRepository.listarTodos();
    }

    public List<PagoDetalleDTO> listarTodosDetallado() throws Exception {
        return pagoRepository.listarTodosDetallado();
    }
}