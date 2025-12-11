document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    
    
    // ===== ELEMENTOS DEL DOM =====
    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const enlacesMenu = document.querySelectorAll('.item-menu');
    
    // Calendario
    const calendarioDias = document.getElementById('calendario-dias');
    const mesAnio = document.getElementById('mes-anio');
    const btnMesAnterior = document.getElementById('mes-anterior');
    const btnMesSiguiente = document.getElementById('mes-siguiente');
    
    // Formulario
    const formularioCita = document.getElementById('formulario-cita');
    const tipoAsesoria = document.getElementById('tipo-asesoria');
    const horario = document.getElementById('horario');
    const notas = document.getElementById('notas');
    const btnAgendar = document.getElementById('btn-agendar');
    
    // Modal confirmación
    const modalConfirmar = document.getElementById('modal-confirmar');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const btnAceptarModal = document.getElementById('btn-aceptar-modal');
    
    // Notificación
    const notificacion = document.getElementById('notificacion');
    const cerrarNotificacion = document.getElementById('cerrar-notificacion');
    
    // Pago
    const seccionTotal = document.getElementById('seccion-total');
    const precioTotalEl = document.getElementById('precio-total');
    const seccionPago = document.getElementById('seccion-pago');
    const modalResumen = document.getElementById('modal-resumen');
    const paypalContainer = document.getElementById('paypal-button-container');
    
    // Logout
    const btnLogout = document.getElementById('logout-button');
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    
    // Modal Domingo
    const modalDomingo = document.getElementById('modal-domingo');
    const btnDomingoCerrar = document.getElementById('btn-domingo-cerrar');
    
    // Modal Horario Pasado
    const modalHorarioPasado = document.getElementById('modal-horario-pasado');
    const btnHorarioCerrar = document.getElementById('btn-horario-cerrar');
    
    // Nombre Usuario
    const nombreUsuario = document.getElementById('nombre-usuario');

    
    
    // Variables
    let fechaActual = new Date();
    let fechaSeleccionada = null;
    let datosFormulario = null;
    let idCitaCreada = null;
    // ===== LOGOUT TAMBIÉN EN MÓVIL =====

// Detectar si hay un botón de logout dentro del menú móvil
const btnLogoutMobile = document.getElementById('logout-mobile');

if (btnLogoutMobile) {
    btnLogoutMobile.addEventListener('click', function(e) {
        e.preventDefault();
        cerrarMenu(); // cerrar menú para que no estorbe
        abrirModalLogout(); // abrir modal de confirmación de logout
    });
}

    
    // ===== MENÚ HAMBURGUESA =====
    function esMobile() {
        return window.innerWidth <= 768;
    }
    
    function abrirMenu() {
        if (!menuLateral || !overlayMenu || !botonHamburguesa) return;
        menuLateral.classList.add('abierto');
        overlayMenu.classList.add('activo');
        botonHamburguesa.classList.add('activo');
        document.body.style.overflow = 'hidden';
    }
    
    function cerrarMenu() {
        if (!menuLateral || !overlayMenu || !botonHamburguesa) return;
        menuLateral.classList.remove('abierto');
        overlayMenu.classList.remove('activo');
        botonHamburguesa.classList.remove('activo');
        document.body.style.overflow = '';
    }
    
    if (botonHamburguesa) {
        botonHamburguesa.addEventListener('click', function(e) {
            e.stopPropagation();
            if (menuLateral.classList.contains('abierto')) {
                cerrarMenu();
            } else {
                abrirMenu();
            }
        });
    }
    
    if (overlayMenu) {
        overlayMenu.addEventListener('click', cerrarMenu);
    }
    
    enlacesMenu.forEach(enlace => {
        enlace.addEventListener('click', function() {
            if (esMobile()) {
                cerrarMenu();
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                cerrarMenu();
            }
            if (modalConfirmar && modalConfirmar.classList.contains('activo')) {
                cerrarModalConfirmacion();
            }
            if (modalLogout && modalLogout.classList.contains('activo')) {
                cerrarModalLogout();
            }
            if (modalDomingo && modalDomingo.classList.contains('activo')) {
                cerrarModalDomingo();
            }
            if (modalHorarioPasado && modalHorarioPasado.classList.contains('activo')) {
                cerrarModalHorarioPasado();
            }
        }
    });
    
    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });
    
    // ===== CARGAR NOMBRE USUARIO =====
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId && nombreUsuario) {
        const perfil = JSON.parse(localStorage.getItem('afgcorporacion_cliente_perfil') || '{}');
        if (perfil.nombreCompleto) {
            nombreUsuario.textContent = perfil.nombreCompleto;
        }
    }
    
    // ===== LOGOUT =====
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModalLogout();
        });
    }
    
    if (btnLogoutVolver) {
        btnLogoutVolver.addEventListener('click', function() {
            cerrarModalLogout();
        });
    }
    
    if (btnLogoutConfirmar) {
        btnLogoutConfirmar.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '../paginas/Rol_Usuario.html';
        });
    }
    
    if (modalLogout) {
        modalLogout.addEventListener('click', function(e) {
            if (e.target === modalLogout) {
                cerrarModalLogout();
            }
        });
    }
    
    function abrirModalLogout() {
        if (modalLogout) {
            modalLogout.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function cerrarModalLogout() {
        if (modalLogout) {
            modalLogout.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }
    
    // ===== MODAL DOMINGO =====
    if (btnDomingoCerrar) {
        btnDomingoCerrar.addEventListener('click', function() {
            cerrarModalDomingo();
        });
    }
    
    if (modalDomingo) {
        modalDomingo.addEventListener('click', function(e) {
            if (e.target === modalDomingo) {
                cerrarModalDomingo();
            }
        });
    }
    
    function abrirModalDomingo() {
        if (modalDomingo) {
            modalDomingo.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function cerrarModalDomingo() {
        if (modalDomingo) {
            modalDomingo.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }
    
    // ===== MODAL HORARIO PASADO =====
    if (btnHorarioCerrar) {
        btnHorarioCerrar.addEventListener('click', function() {
            cerrarModalHorarioPasado();
        });
    }
    
    if (modalHorarioPasado) {
        modalHorarioPasado.addEventListener('click', function(e) {
            if (e.target === modalHorarioPasado) {
                cerrarModalHorarioPasado();
            }
        });
    }
    
    function abrirModalHorarioPasado() {
        if (modalHorarioPasado) {
            modalHorarioPasado.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function cerrarModalHorarioPasado() {
        if (modalHorarioPasado) {
            modalHorarioPasado.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }
    
    // ===== CALENDARIO =====
    function renderizarCalendario() {
        if (!calendarioDias) return;
        
        calendarioDias.innerHTML = '';
        
        const anio = fechaActual.getFullYear();
        const mes = fechaActual.getMonth();
        
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        if (mesAnio) {
            mesAnio.textContent = `${nombresMeses[mes]} ${anio}`;
        }
        
        const primerDia = new Date(anio, mes, 1);
        const diaSemana = primerDia.getDay();
        const ultimoDia = new Date(anio, mes + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const ultimoDiaMesAnterior = new Date(anio, mes, 0).getDate();
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        for (let i = diaSemana - 1; i >= 0; i--) {
            calendarioDias.appendChild(crearDia(ultimoDiaMesAnterior - i, true, null));
        }
        
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaDia = new Date(anio, mes, dia);
            fechaDia.setHours(0, 0, 0, 0);
            const esHoy = fechaDia.getTime() === hoy.getTime();
            const esSeleccionado = fechaSeleccionada && fechaDia.getTime() === fechaSeleccionada.getTime();
            const esPasado = fechaDia < hoy;
            calendarioDias.appendChild(crearDia(dia, false, fechaDia, esHoy, esSeleccionado, esPasado));
        }
        
        const diasTotalesGrid = calendarioDias.children.length;
        const diasRestantes = (diasTotalesGrid > 35) ? 42 - diasTotalesGrid : 35 - diasTotalesGrid;
        
        for (let dia = 1; dia <= diasRestantes; dia++) {
            calendarioDias.appendChild(crearDia(dia, true, null));
        }
    }
    
    function crearDia(numero, otroMes, fecha, esHoy = false, esSeleccionado = false, esPasado = false) {
        const div = document.createElement('div');
        div.className = 'dia';
        div.textContent = numero;
        
        if (otroMes) {
            div.classList.add('otro-mes');
        } else {
            if (esHoy) div.classList.add('hoy');
            if (esSeleccionado) div.classList.add('seleccionado');
            if (esPasado) div.classList.add('deshabilitado');
            
            // Verificar si es domingo (0 = domingo)
            const esDomingo = fecha && fecha.getDay() === 0;
            
            if (esDomingo) {
                div.classList.add('deshabilitado');
                div.style.opacity = '0.5';
                div.style.cursor = 'not-allowed';
                div.addEventListener('click', function(e) {
                    e.preventDefault();
                    abrirModalDomingo();
                });
            } else if (!esPasado) {
                div.addEventListener('click', function() {
                    fechaSeleccionada = fecha;
                    renderizarCalendario();
                });
            }
        }
        
        return div;
    }
    
    if (btnMesAnterior) {
        btnMesAnterior.addEventListener('click', function() {
            fechaActual.setMonth(fechaActual.getMonth() - 1);
            renderizarCalendario();
        });
    }
    
    if (btnMesSiguiente) {
        btnMesSiguiente.addEventListener('click', function() {
            fechaActual.setMonth(fechaActual.getMonth() + 1);
            renderizarCalendario();
        });
    }
    
    // ===== CARGAR SERVICIOS DESDE EL BACKEND =====
    async function cargarServicios() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/servicios`);
            
            if (!response.ok) {
                throw new Error('Error al cargar servicios');
            }
            
            const servicios = await response.json();
            
            if (tipoAsesoria) {
                tipoAsesoria.innerHTML = '<option value="">Selecciona un tipo de asesoría</option>';
                
                servicios.forEach(servicio => {
                    const option = document.createElement('option');
                    option.value = servicio.idServicio;
                    option.textContent = servicio.nombre;
                    option.setAttribute('data-price', servicio.precio);
                    tipoAsesoria.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando servicios:', error);
            alert('Error al cargar los servicios. Por favor recarga la página.');
        }
    }
    
    // ===== LÓGICA DE PAGO Y PRECIOS =====
    if (tipoAsesoria) {
        tipoAsesoria.addEventListener('change', () => {
            const selectedOption = tipoAsesoria.options[tipoAsesoria.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            
            if (price) {
                const formattedPrice = parseFloat(price).toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                });
                precioTotalEl.textContent = formattedPrice;
                seccionTotal.style.display = 'block';
                seccionPago.style.display = 'block';
            } else {
                seccionTotal.style.display = 'none';
                seccionPago.style.display = 'none';
                precioTotalEl.textContent = '$0.00 MXN';
            }
        });
    }
    
    // ===== FUNCIONES AUXILIARES =====
    function convertirHoraAFormato24(hora12) {
        const [time, modifier] = hora12.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        
        return `${hours}:${minutes}:00`;
    }
    
    function obtenerHoraActual24() {
        const ahora = new Date();
        const hours = ahora.getHours();
        const minutes = ahora.getMinutes();
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    // ===== VALIDAR FORMULARIO =====
    function validarFormulario() {
        if (!fechaSeleccionada) {
            alert('Por favor selecciona una fecha del calendario');
            return false;
        }
        
        // Validar que no sea domingo
        if (fechaSeleccionada.getDay() === 0) {
            abrirModalDomingo();
            return false;
        }
        
        if (!tipoAsesoria || !tipoAsesoria.value) {
            alert('Por favor selecciona un tipo de asesoría');
            tipoAsesoria.focus();
            return false;
        }
        
        if (!horario || !horario.value) {
            alert('Por favor selecciona un horario');
            horario.focus();
            return false;
        }
        
        // Validar horarios pasados
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const fechaSel = new Date(fechaSeleccionada);
        fechaSel.setHours(0, 0, 0, 0);
        
        if (fechaSel.getTime() === hoy.getTime()) {
            const horaActual = obtenerHoraActual24();
            const horaSeleccionada = convertirHoraAFormato24(horario.value).substring(0, 5);
            
            if (horaSeleccionada <= horaActual) {
                abrirModalHorarioPasado();
                return false;
            }
        }
        
        const modalidadInput = document.querySelector('input[name="modalidad"]:checked');
        if (!modalidadInput) {
            alert('Por favor selecciona una modalidad (Presencial o Google Meet)');
            return false;
        }
        
        const seccionPagoVisible = seccionPago && window.getComputedStyle(seccionPago).display === 'block';
        const metodoPagoInput = document.querySelector('input[name="metodo-pago"]:checked');
        if (seccionPagoVisible && !metodoPagoInput) {
            alert('Por favor selecciona un método de pago');
            return false;
        }
        
        return true;
    }
    
    // ===== FORMULARIO =====
    if (formularioCita) {
        formularioCita.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validarFormulario()) {
                return;
            }
            
            const opcion = tipoAsesoria.options[tipoAsesoria.selectedIndex];
            const precioRaw = parseFloat(opcion.getAttribute('data-price') || 0);
            const modalidad = document.querySelector('input[name="modalidad"]:checked').value;
            const metodo = document.querySelector('input[name="metodo-pago"]:checked')?.value || 'N/A';
            
            datosFormulario = {
                fecha: fechaSeleccionada,
                tipoId: parseInt(tipoAsesoria.value),
                tipoTexto: opcion.text,
                horario: horario.value,
                notas: notas.value,
                precio: precioRaw,
                modalidad: modalidad,
                metodoPago: metodo,
                idUsuario: parseInt(localStorage.getItem('usuarioId') || '1')
            };
            
            const fechaFormateadaModal = datosFormulario.fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
            
            const precioFormateado = datosFormulario.precio.toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN'
            });
            
            if (modalResumen) {
                modalResumen.innerHTML = `
                    <p><strong>Servicio:</strong> <span>${datosFormulario.tipoTexto}</span></p>
                    <p><strong>Fecha:</strong> <span>${fechaFormateadaModal}</span></p>
                    <p><strong>Horario:</strong> <span>${datosFormulario.horario}</span></p>
                    <p><strong>Modalidad:</strong> <span>${datosFormulario.modalidad}</span></p>
                    <p><strong>Método:</strong> <span>${datosFormulario.metodoPago}</span></p>
                    <p style="border-top: 1px solid #ddd; padding-top: 8px;">
                        <strong>Total:</strong> 
                        <span style="font-weight: 700; font-size: 1.1rem; color: #0e5d6b;">${precioFormateado}</span>
                    </p>
                `;
            }
            
            abrirModal();
        });
    }
    
    // ===== MODAL DE CONFIRMACIÓN =====
    function abrirModal() {
        if (modalConfirmar) {
            modalConfirmar.classList.add('activo');
            document.body.style.overflow = 'hidden';
            
            // Configurar botones según método de pago
            if (datosFormulario.metodoPago === 'paypal') {
                if (btnAceptarModal) btnAceptarModal.style.display = 'none';
                if (paypalContainer) {
                    paypalContainer.style.display = 'block';
                    renderizarBotonPayPal();
                }
            } else {
                if (btnAceptarModal) btnAceptarModal.style.display = 'block';
                if (paypalContainer) paypalContainer.style.display = 'none';
            }
        }
    }
    
    function cerrarModalConfirmacion() {
        if (modalConfirmar) {
            modalConfirmar.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }
    
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', cerrarModalConfirmacion);
    }
    
    if (btnAceptarModal) {
        btnAceptarModal.addEventListener('click', function() {
            cerrarModalConfirmacion();
            agendarCita();
        });
    }
    
    if (modalConfirmar) {
        modalConfirmar.addEventListener('click', function(e) {
            if (e.target === modalConfirmar) {
                cerrarModalConfirmacion();
            }
        });
    }
    
    // ===== PAYPAL =====
    function renderizarBotonPayPal() {
        if (!paypalContainer) return;
        
        paypalContainer.innerHTML = '';
        
        paypal.Buttons({
            createOrder: async function() {
                try {
                    const cita = await guardarCitaEnBackend(false);
                    idCitaCreada = cita.id;
                    
                    const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: datosFormulario.precio,
                            currency: "MXN",
                            idUsuario: datosFormulario.idUsuario,
                            idCita: idCitaCreada
                        })
                    });
                    
                    const orderData = await response.json();
                    return orderData.id;
                    
                } catch (error) {
                    console.error(error);
                    alert("Error iniciando el pago.");
                }
            },
            
            onApprove: async function(data) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/payments/capture/${data.orderID}?idCita=${idCitaCreada}&idUsuario=${datosFormulario.idUsuario}`, {
                        method: 'POST'
                    });
                    
                    const orderData = await response.json();
                    
                    if (orderData.status === 'COMPLETED') {
                        cerrarModalConfirmacion();
                        mostrarNotificacion();
                        limpiarFormulario();
                    } else {
                        alert("Pago no completado.");
                    }
                } catch (error) {
                    console.error("Error:", error);
                    alert("Error al procesar el pago.");
                }
            },
            
            onCancel: async function() {
                alert("Pago cancelado.");
                if (idCitaCreada) {
                    await fetch(`${API_BASE_URL}/cita/eliminar/${idCitaCreada}`, { method: 'DELETE' });
                    idCitaCreada = null;
                }
            },
            
            onError: async function() {
                alert("Error en PayPal.");
                if (idCitaCreada) {
                    await fetch(`${API_BASE_URL}/cita/eliminar/${idCitaCreada}`, { method: 'DELETE' });
                    idCitaCreada = null;
                }
            }
            
        }).render('#paypal-button-container');
    }
    
    // ===== GUARDAR CITA EN BACKEND =====
    async function guardarCitaEnBackend(pagado) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No hay sesión activa.");
            window.location.href = '../paginas/Rol_Usuario.html';
            throw new Error("Sin token");
        }
        
        const year = datosFormulario.fecha.getFullYear();
        const month = String(datosFormulario.fecha.getMonth() + 1).padStart(2, '0');
        const day = String(datosFormulario.fecha.getDate()).padStart(2, '0');
        
        let horaFinal = convertirHoraAFormato24(datosFormulario.horario);
        
        const payload = {
            idCliente: datosFormulario.idUsuario,
            idAsesor: null,
            idServicio: datosFormulario.tipoId,
            idEstado: 1,
            idModalidad: (datosFormulario.modalidad === 'Meet') ? 2 : 1,
            fechaCita: `${year}-${month}-${day}`,
            horaCita: horaFinal,
            pagado: pagado,
            notas: datosFormulario.notas
        };
        
        const response = await fetch(`${API_BASE_URL}/cita/agendar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const texto = await response.text();
        
        if (response.status === 409) {
            throw new Error("Ese horario ya fue ocupado.");
        }
        
        if (!response.ok) {
            throw new Error(texto);
        }
        
        const result = JSON.parse(texto);
        
        if (!result.id) {
            throw new Error("El servidor no devolvió un ID");
        }
        
        return { id: result.id };
    }
    
    // ===== AGENDAR CITA (Método tradicional sin PayPal) =====
    async function agendarCita() {
        if (!datosFormulario) return;
        
        try {
            const cita = await guardarCitaEnBackend(true);
            mostrarNotificacion();
            limpiarFormulario();
        } catch (error) {
            console.error('Error al agendar cita:', error);
            alert(error.message || 'Error al agendar la cita. Por favor intenta de nuevo.');
        }
    }
    
    // ===== LIMPIAR FORMULARIO =====
    function limpiarFormulario() {
        if (formularioCita) {
            formularioCita.reset();
        }
        fechaSeleccionada = null;
        renderizarCalendario();
        
        if (seccionTotal) seccionTotal.style.display = 'none';
        if (seccionPago) seccionPago.style.display = 'none';
        if (precioTotalEl) precioTotalEl.textContent = '$0.00 MXN';
    }
    
    // ===== NOTIFICACIÓN =====
    function mostrarNotificacion() {
        if (notificacion) {
            notificacion.classList.add('mostrar');
            setTimeout(() => {
                ocultarNotificacion();
            }, 4000);
        }
    }
    
    function ocultarNotificacion() {
        if (notificacion) {
            notificacion.classList.remove('mostrar');
        }
    }
    
    if (cerrarNotificacion) {
        cerrarNotificacion.addEventListener('click', ocultarNotificacion);
    }
    
    // ===== INICIALIZAR =====
    if (calendarioDias) {
        renderizarCalendario();
    }
    
    // Cargar servicios al iniciar
    cargarServicios();
    
    console.log('✅ Agendar Cita AFGCORPORACIÓN cargado correctamente con conexión al backend');
});