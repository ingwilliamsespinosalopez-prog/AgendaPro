package org.example.service;

import org.example.model.Cita;
import org.example.model.Usuario;
import org.example.repository.CitaRepository;
import org.example.repository.PagoRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.sql.SQLException;

public class CitaService {

    private final CitaRepository repository;
    private  final  NotificationService notificaciones = new NotificationService();
    private final PagoRepository pagoRepository;
    private final PayPalService payPalService = new PayPalService();

    public CitaService(CitaRepository repository, PagoRepository pagoRepository) {
        this.repository = repository;
        this.pagoRepository = pagoRepository;
    }

    public Integer crearCita(Cita cita) {
        try {
            // 1. Validar empalmes SOLO SI hay un asesor asignado
            // Si idAsesor es NULL, nos saltamos esta validación
            if (cita.getIdAsesor() != null && cita.getIdAsesor() > 0) {
                boolean ocupado = repository.existeEmpalme(
                        cita.getIdAsesor(),
                        cita.getFechaCita(),
                        cita.getHoraCita()
                );

                if (ocupado) {
                    System.out.println("❌ Horario ocupado");
                    return -1;
                }
            }

            // 2. Guardar la cita en Base de Datos
            int idCitaGenerada = repository.crear(cita);

            return idCitaGenerada;

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Cita> listarTodas() {
        try {
            return repository.listarTodas();
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public List<org.example.model.CitaDetalleDTO> listarTodasDetallado() {
        try {
            return repository.listarTodasDetallado();
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of(); // Retorna lista vacía en vez de null
        }
    }

    public List<Cita> listarPorEstado(int idEstado) {
        try {
            return repository.listarPorEstado(idEstado);
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public List<org.example.model.CitaDetalleDTO> listarPorAsesor(int idAsesor) {
        try {
            return repository.listarPorAsesorDetallado(idAsesor);
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public List<Cita> obtenerPorCliente(int idCliente) {
        try {
            return repository.listarPorCliente(idCliente);
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public Cita obtenerPorId(int idCita) {
        try {
            return repository.obtenerPorId(idCita);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean actualizarEstado(int idCita, int nuevoEstado) {
        try {
            return repository.actualizarEstado(idCita, nuevoEstado) > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean marcarPagado(int idCita) {
        try {
            return repository.marcarPagado(idCita);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public String cambiarEstado(int idCita, String accion) {
        try {
            return repository.cambiarEstado(idCita, accion);
        } catch (SQLException e) {
            e.printStackTrace();
            return "Error al cambiar estado";
        }
    }

    public String asignarAsesor(int idCita, int idAsesor) {
        try {
            boolean ok = repository.asignarAsesor(idCita, idAsesor);
            return ok ? "Asesor asignado correctamente" : "No se pudo asignar";
        } catch (SQLException e) {
            e.printStackTrace();
            return "Error en la base de datos al asignar asesor";
        }
    }

    public List<Cita> listarCompletadasYCanceladas() {
        try {
            return repository.listarPorEstados(List.of(3, 4));
        } catch (SQLException e) {
            e.printStackTrace();
            return List.of();
        }
    }

   private void enviarNotificacionesConfirmacion(Cita cita) {
        try {
            Usuario cliente = repository.obtenerDatosContacto(cita.getIdCliente());

            if (cliente == null) return;

            String nombreCliente = cliente.getNombre() + " " + cliente.getApellido();
            String mensaje = "Hola " + nombreCliente + ", tu cita ha sido agendada exitosamente para el: " + cita.getFechaCita() + " a las " + cita.getHoraCita();
            String instrucciones;

            // C. Validar Modalidad (Asumiendo que idModalidad 2 es ONLINE/MEET)
            // Ajusta el '2' según tu base de datos.
            if (cita.getIdModalidad() == 2) {
                String linkMeet = "https://meet.google.com/sem-udet-upe"; // Link generado o estático
                instrucciones = "\n\nModalidad: En Línea.\nEnlace para tu videollamada: " + linkMeet;
            } else {
                instrucciones = "\n\nModalidad: Presencial.\nTe esperamos en nuestras oficinas.";
            }

            String mensajeFinal = mensaje + instrucciones + "\n\nGracias por confiar en AFG Corporación.";

            // D. ENVIAR CORREO
            System.out.println("📧 Enviando correo a: " + cliente.getCorreo());
            notificaciones.enviarCorreo(cliente.getCorreo(), "Confirmación de Cita - AFG", mensajeFinal);

            String mensajeSMS = "Hola " + nombreCliente
                    + ", tu cita es el " + cita.getFechaCita()
                    + " a las " + cita.getHoraCita()
                    + (cita.getIdModalidad() == 2
                    ? ". Modalidad: En linea."
                    : ". Modalidad: Presencial.");

            // E. ENVIAR WHATSAPP / SMS
            // IMPORTANTE: Formatear el número para Twilio (+521...)
            String telefono = cliente.getTelefono();
            if (telefono != null && !telefono.isEmpty()) {
                // Limpiar el teléfono de espacios o guiones
                telefono = telefono.replaceAll("[^0-9]", "");

                // Formato para México (+521 + 10 dígitos)
                String telefonoTwilio = "+52" + telefono;

                // En Producción usarías 'telefonoTwilio'.
                // EN MODO PRUEBA (Sandbox), FORZAMOS TU NÚMERO para que veas que llega:
                String miNumeroPruebaW = "+5219666642931";
                String miNumeroPrueba = "+529601152138";


                System.out.println("📱 Enviando WhatsApp...");
                notificaciones.enviarWhatsApp(miNumeroPruebaW, mensajeFinal);

                System.out.println("Enviando SMS");
                notificaciones.enviarSMS(miNumeroPrueba, mensajeSMS);

            }

        } catch (Exception e) {
            System.err.println("Error al enviar notificaciones (La cita sí se guardó): " + e.getMessage());
        }
    }

    public boolean eliminarCita(int idCita) {
        try {
            return repository.eliminar(idCita);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public void notificarCitaPagada(int idCita) {
        try {
            // Buscamos la cita completa en la BD para tener fecha, hora, cliente, etc.
            Cita cita = repository.obtenerPorId(idCita);
            if (cita != null) {
                enviarNotificacionesConfirmacion(cita); // Reutilizamos tu lógica privada existente
            }
        } catch (Exception e) {
            System.err.println("Error recuperando cita para notificar: " + e.getMessage());
        }
    }

    public String cancelarCita(int idCita) {
        try {
            Cita cita = repository.obtenerPorId(idCita);
            if (cita == null) return "Cita no encontrada";

            // 2. Si está pagada, intentamos reembolsar
            if (cita.getPagado()) {
                String transactionId = pagoRepository.obtenerTransactionIdPorCita(idCita);

                if (transactionId != null) {
                    boolean reembolsoExitoso = payPalService.refundPayment(transactionId);

                    if (reembolsoExitoso) {
                        System.out.println("💰 Reembolso exitoso. Actualizando BD...");

                        // --- ESTO ES LO NUEVO QUE FALTABA ---
                        pagoRepository.actualizarEstadoPagoPorCita(idCita, "REFUNDED");
                        // ------------------------------------

                    } else {
                        return "Error al procesar el reembolso en PayPal";
                    }
                }
            }

            repository.actualizarEstado(idCita, 3);

            return "OK";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error interno: " + e.getMessage();
        }
    }

    public String reagendarCita(int idCita, LocalDate nuevaFecha, LocalTime nuevaHora, String motivo) {
        try {
            Cita cita = repository.obtenerPorId(idCita);
            if (cita == null) return "Cita no encontrada";

            // 1. Verificar empalmes (Importante: ¡No empalmar con otras citas!)
            boolean ocupado = repository.existeEmpalme(cita.getIdAsesor(), nuevaFecha, nuevaHora);
            if (ocupado) return "El nuevo horario no está disponible";

            // 2. Actualizar
            boolean exito = repository.reagendar(idCita, nuevaFecha, nuevaHora, motivo);

            return exito ? "OK" : "No se pudo actualizar";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
