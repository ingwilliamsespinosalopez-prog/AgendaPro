document.addEventListener('DOMContentLoaded', async function() {
    
    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');

    // ===== VALIDACIÓN SESIÓN =====
    if (!token || !usuarioId) {
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }
    
    // ===== ELEMENTOS DEL DOM =====
    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const enlacesMenu = document.querySelectorAll('.item-menu');
    const tbodySolicitudes = document.getElementById('tbody-solicitudes');
    const btnLogout = document.getElementById('logout-button');
    
    // Modales
    const modalConfirmar = document.getElementById('modal-confirmar');
    const modalRechazar = document.getElementById('modal-rechazar');
    const modalDetalles = document.getElementById('modal-detalles');
    const modalLogout = document.getElementById('modal-logout');
    const modalAccionTemprana = document.getElementById('modal-accion-temprana'); 
    
    const btnCancelarConfirmar = document.getElementById('btn-cancelar-confirmar');
    const btnAceptarConfirmar = document.getElementById('btn-aceptar-confirmar');
    const btnVolverRechazar = document.getElementById('btn-volver-rechazar');
    const btnSiRechazar = document.getElementById('btn-si-rechazar');
    const cerrarModalDetalles = document.getElementById('cerrar-modal-detalles');
    const contenidoDetalles = document.getElementById('contenido-detalles');
    const badgeEstadoModal = document.getElementById('badge-estado-modal');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    const btnCerrarTemprana = document.getElementById('btn-cerrar-temprana'); 
    
    // Alertas
    const alertaConfirmar = document.getElementById('alerta-confirmar');
    const alertaRechazar = document.getElementById('alerta-rechazar');
    const cerrarAlertaConfirmar = document.getElementById('cerrar-alerta-confirmar');
    const cerrarAlertaRechazar = document.getElementById('cerrar-alerta-rechazar');
    
    // Variables de estado
    let misSolicitudes = [];
    let solicitudSeleccionada = null;
    
    // ==========================================
    // INICIALIZACIÓN Y UTILS
    // ==========================================
    
    await cargarMisSolicitudes();
    setupEventListeners();

    function formatearFecha(fechaISO) {
        if (!fechaISO) return "-";
        const [y, m, d] = fechaISO.split('-');
        return `${d}/${m}/${y}`;
    }
    
    function esAccionTemprana(idCita) {
        const cita = misSolicitudes.find(c => c.idCita === idCita);
        if (!cita || cita.fecha === 'Fecha N/A' || cita.hora === 'Hora N/A') return false; 
        
        // Formato ISO 8601 (YYYY-MM-DDTTHH:mm)
        const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
        const ahora = new Date();
        
        return ahora < fechaHoraCita;
    }

    // ==========================================
    // 1. CARGAR DATOS (BACKEND) - CON FILTRO
    // ==========================================
    async function cargarMisSolicitudes() {
        try {
            console.log("Cargando citas para asesor ID:", usuarioId);

            const response = await fetch(`${API_BASE_URL}/cita/asesor/${usuarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al cargar solicitudes del asesor");

            const data = await response.json();
            
            // ✅ FILTRAR SOLO PENDIENTE Y CONFIRMADA
            misSolicitudes = data
                .filter(cita => cita.estado === 'Pendiente' || cita.estado === 'Confirmada')
                .map(cita => ({
                    ...cita,
                    clienteNombre: cita.clienteNombre || 'Cliente Desconocido',
                    servicioNombre: cita.servicioNombre || 'Servicio General',
                    fecha: cita.fecha || 'Fecha N/A',
                    hora: cita.hora || 'Hora N/A',
                    modalidad: cita.modalidad || 'Presencial',
                    estado: cita.estado || 'Pendiente',
                    asesorNombre: cita.asesorNombre, 
                    notas: cita.notas || ''
                }));

            renderizarTabla();

        } catch (error) {
            console.error(error);
            tbodySolicitudes.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red">Error: ${error.message}</td></tr>`;
        }
    }

    async function actualizarEstadoCita(idCita, nuevoEstadoId, alertaElemento, mensajeAlerta) {
        try {
            console.log(`Intentando actualizar cita ${idCita} a estado ${nuevoEstadoId}`);
            
            const response = await fetch(`${API_BASE_URL}/cita/estado/${idCita}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ idEstado: nuevoEstadoId })
            });

            if (response.ok) {
                if (alertaElemento) {
                    alertaElemento.querySelector('.alerta-titulo').textContent = mensajeAlerta;
                    mostrarAlerta(alertaElemento);
                }
                await cargarMisSolicitudes();
                return true;
            } else {
                const errorData = await response.json();
                console.error("Error API:", errorData);
                alert("Error: " + (errorData.error || "No se pudo actualizar el estado de la cita."));
                return false;
            }

        } catch (e) {
            console.error("Error de conexión/petición:", e);
            alert("Error de conexión al servidor.");
            return false;
        }
    }

    // ==========================================
    // 2. RENDERIZADO - CON ESTILO VERDE
    // ==========================================
    function renderizarTabla() {
        if (!tbodySolicitudes) return;
        
        tbodySolicitudes.innerHTML = '';

        if (misSolicitudes.length === 0) {
            tbodySolicitudes.innerHTML = `
                <tr class="fila-vacia">
                    <td colspan="7">
                        <div class="mensaje-vacio">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            </svg>
                            <p>📋 No tienes solicitudes pendientes o confirmadas</p>
                            <p class="texto-secundario">Las solicitudes aparecerán aquí</p>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        misSolicitudes.forEach((cita, index) => {
            const tr = crearFilaSolicitud(cita, index);
            tbodySolicitudes.appendChild(tr);
        });
        
        setTimeout(animarFilas, 100);
    }
    
    function crearFilaSolicitud(cita, index) {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        
        // ✅ CLASES DE ESTADO CON VERDE PARA CONFIRMADA
        let claseEstado = 'pendiente';
        if (cita.estado === 'Confirmada') claseEstado = 'confirmada';

        // 2. Lógica de fecha para habilitar acciones post-cita
        const citaYaPaso = 
            cita.fecha !== 'Fecha N/A' && cita.hora !== 'Hora N/A'
            ? new Date() > new Date(`${cita.fecha}T${cita.hora}`)
            : false;

        let botonesAccionHTML = '';
        
        if (cita.estado === 'Pendiente') {
            // Flujo INICIAL (ID 1): ACEPTAR (ID 2) o RECHAZAR (ID 3)
            botonesAccionHTML = `
                <div class="contenedor-botones-accion">
                    <button class="boton-accion btn-aceptar-asignacion" data-accion="aceptar" data-id="${cita.idCita}">
                        Aceptar
                    </button>
                    <button class="boton-accion btn-rechazar" data-accion="rechazar" data-id="${cita.idCita}">
                        Rechazar
                    </button>
                </div>
            `;
        } else if (cita.estado === 'Confirmada') {
            if (citaYaPaso) {
                // Flujo POST-CITA: COMPLETAR (ID 4) o NO ASISTIO (ID 5)
                botonesAccionHTML = `
                    <div class="contenedor-botones-accion">
                        <button class="boton-accion btn-completar" data-accion="completar" data-id="${cita.idCita}">
                            Completar
                        </button>
                        <button class="boton-accion btn-no-asistio" data-accion="no-asistio" data-id="${cita.idCita}">
                            No Asistió
                        </button>
                    </div>
                `;
            } else {
                // Flujo PRE-CITA: Solo CANCELAR (ID 3)
                botonesAccionHTML = `
                    <div class="contenedor-botones-accion">
                        <button class="boton-accion btn-rechazar" data-accion="cancelar-confirmada" data-id="${cita.idCita}">
                            Cancelar
                        </button>
                    </div>
                `;
            }
        }
        
        // 3. Renderizado de la fila
        const modalidad = cita.modalidad || 'N/A';
        const modalidadClass = String(modalidad).toLowerCase().replace('/', '');
        const modalidadIcono = modalidad === 'Presencial'
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10-7 10"></path><path d="m13 14-4-4 4-4"></path><path d="M4 14a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"></path><path d="M20 14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2"></path></svg>`;

        tr.innerHTML = `
            <td>
                <span class="nombre-cliente">${cita.clienteNombre}</span>
            </td>
            <td>
                <span class="tema-tratar">${cita.servicioNombre}</span>
            </td>
            <td>
                <div class="fecha-hora-celda">
                    <span class="fecha-texto">${formatearFecha(cita.fecha)}</span>
                    <span class="hora-texto">${cita.hora}</span>
                </div>
            </td>
            <td>
                <span class="badge-modalidad ${modalidadClass}">
                    ${modalidadIcono}
                    ${modalidad}
                </span>
            </td>
            <td>
                <span class="badge-estado ${claseEstado}">${cita.estado}</span>
            </td>
            <td class="celda-acciones">
                ${botonesAccionHTML}
            </td>
            <td style="text-align: center;">
                <button class="btn-detalles" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </td>
        `;
        
        return tr;
    }

    // ==========================================
    // 3. MANEJO DE ACCIONES Y MODALES
    // ==========================================

    // --- MANEJAR CLICKS DE BOTONES ---
    document.addEventListener('click', function(e) {
        const btnDetalles = e.target.closest('.btn-detalles');
        if (btnDetalles) {
            const index = parseInt(btnDetalles.dataset.index);
            mostrarDetalles(index);
            return;
        }
        
        const boton = e.target.closest('.boton-accion');
        if (!boton) return;
        
        const accion = boton.dataset.accion;
        const idCita = parseInt(boton.dataset.id);
        
        solicitudSeleccionada = idCita;
        
        // Elementos dinámicos de los modales
        const modalTituloConfirmar = document.getElementById('modal-titulo-confirmar');
        const modalTextoConfirmar = document.getElementById('modal-texto-confirmar');
        const modalTituloRechazar = document.getElementById('modal-titulo-rechazar');
        const modalTextoRechazar = document.getElementById('modal-texto-rechazar');

        if (accion === 'aceptar') {
            modalTituloConfirmar.textContent = 'Confirmar Asignación';
            modalTextoConfirmar.textContent = '¿Estás seguro de que deseas ACEPTAR esta asesoría? Se marcará como Confirmada (Estado 2).';
            btnAceptarConfirmar.dataset.finalAction = 'aceptar-api';
            abrirModal(modalConfirmar);
        } else if (accion === 'rechazar') {
            modalTituloRechazar.textContent = 'Rechazar Asignación';
            modalTextoRechazar.textContent = '¿Estás seguro de que deseas RECHAZAR esta asignación? Esto cancelará la solicitud (Estado 3).';
            btnSiRechazar.dataset.finalAction = 'rechazar-api';
            abrirModal(modalRechazar);
        } else if (accion === 'completar') {
            if (esAccionTemprana(idCita)) {
                abrirModal(modalAccionTemprana);
                return;
            }
            modalTituloConfirmar.textContent = 'Completar Asesoría';
            modalTextoConfirmar.textContent = '¿Estás seguro de que deseas marcar esta asesoría como COMPLETADA? (Estado 4)';
            btnAceptarConfirmar.dataset.finalAction = 'completar-api';
            abrirModal(modalConfirmar);
        } else if (accion === 'no-asistio') {
            if (esAccionTemprana(idCita)) {
                abrirModal(modalAccionTemprana);
                return;
            }
            modalTituloRechazar.textContent = 'No Asistió';
            modalTextoRechazar.textContent = '¿Estás seguro de marcar esta asesoría como NO ASISTIÓ? (Estado 5)';
            btnSiRechazar.dataset.finalAction = 'no-asistio-api';
            abrirModal(modalRechazar);
        } else if (accion === 'cancelar-confirmada') {
            modalTituloRechazar.textContent = 'Cancelar Asesoría';
            modalTextoRechazar.textContent = '¿Estás seguro de que deseas CANCELAR esta asesoría Confirmada? Se marcará como Cancelada (Estado 3).';
            btnSiRechazar.dataset.finalAction = 'cancelar-api';
            abrirModal(modalRechazar);
        }
    });

    // --- ACCIÓN DE ACEPTAR/COMPLETAR ---
    if (btnAceptarConfirmar) {
        btnAceptarConfirmar.addEventListener('click', async function() {
            const action = this.dataset.finalAction;
            
            if (!solicitudSeleccionada) {
                alert("Error: No hay cita seleccionada");
                return;
            }
            
            let nuevoEstado;
            let mensajeAlerta;
            
            // Mapeo de IDs de estado
            if (action === 'aceptar-api') {
                nuevoEstado = 2; // Confirmada
                mensajeAlerta = 'Asesoría Aceptada correctamente';
            } else if (action === 'completar-api') {
                nuevoEstado = 4; // Completada
                mensajeAlerta = 'Asesoría Completada correctamente';
            } else {
                cerrarModal(modalConfirmar);
                return;
            }

            const exito = await actualizarEstadoCita(solicitudSeleccionada, nuevoEstado, alertaConfirmar, mensajeAlerta);
            if (exito) {
                cerrarModal(modalConfirmar);
            }
        });
    }

    if (btnCancelarConfirmar) {
        btnCancelarConfirmar.addEventListener('click', function() {
            cerrarModal(modalConfirmar);
        });
    }

    // --- ACCIÓN de RECHAZAR/CANCELAR/NO ASISTIO ---
    if (btnSiRechazar) {
        btnSiRechazar.addEventListener('click', async function() {
            const action = this.dataset.finalAction;
            
            if (!solicitudSeleccionada) return;

            let nuevoEstado;
            let mensajeAlerta;

            // Mapeo de IDs de estado
            if (action === 'rechazar-api' || action === 'cancelar-api') {
                nuevoEstado = 3; // Cancelada
                mensajeAlerta = (action === 'rechazar-api') ? 'Solicitud Rechazada' : 'Asesoría Cancelada';
            } else if (action === 'no-asistio-api') {
                nuevoEstado = 5; // No Asistió
                mensajeAlerta = 'Asesoría marcada como No Asistió';
            } else {
                cerrarModal(modalRechazar);
                return;
            }

            const exito = await actualizarEstadoCita(solicitudSeleccionada, nuevoEstado, alertaRechazar, mensajeAlerta);
            if (exito) {
                cerrarModal(modalRechazar);
            }
        });
    }

    if (btnVolverRechazar) {
        btnVolverRechazar.addEventListener('click', function() {
            cerrarModal(modalRechazar);
        });
    }

    if (btnCerrarTemprana) {
        btnCerrarTemprana.addEventListener('click', function() {
            cerrarModal(modalAccionTemprana);
        });
    }

    // --- MOSTRAR DETALLES ---
    function mostrarDetalles(index) {
        const cita = misSolicitudes[index];
        if (!cita) return;
        
        badgeEstadoModal.className = `badge-estado-modal ${cita.estado.toLowerCase().replace(/\s/g, '-')}`;
        badgeEstadoModal.textContent = cita.estado;
        
        const modalidad = cita.modalidad || 'N/A';
        const modalidadClass = modalidad.toLowerCase().includes('meet') ? 'modalidad-meet' : 'modalidad-presencial';

        let contenido = `
            <div class="grupo-info">
                <span class="label-info">Cliente</span>
                <span class="valor-info">${cita.clienteNombre}</span>
            </div>
            
            <div class="grupo-info">
                <span class="label-info">Tipo de Asesoría</span>
                <span class="valor-info">${cita.servicioNombre}</span>
            </div>
            
            <div class="grupo-info">
                <span class="label-info">Fecha y Hora</span>
                <span class="valor-info">${formatearFecha(cita.fecha)} a las ${cita.hora}</span>
            </div>

            <div class="grupo-info ${modalidadClass}">
                <span class="label-info">Modalidad</span>
                <span class="valor-info" style="font-weight: 600;">${modalidad}</span>
            </div>
            
            <div class="grupo-info">
                <span class="label-info">Estado</span>
                <span class="valor-info">${cita.estado}</span>
            </div>
        `;
        
        if (cita.asesorNombre) {
            contenido += `
                <div class="grupo-info">
                    <span class="label-info">Asesor Asignado</span>
                    <span class="valor-info" style="color: #059669; font-weight: 600;">${cita.asesorNombre}</span>
                </div>
            `;
        }
        
        if (cita.notas && cita.notas !== 'Sin notas adicionales') {
            contenido += `
                <div class="comentario-destacado">
                    <span class="label-info">💬 Comentarios del Cliente</span>
                    <span class="valor-info">${cita.notas}</span>
                </div>
            `;
        }
        
        contenidoDetalles.innerHTML = contenido;
        
        abrirModal(modalDetalles);
    }

    // ===== CERRAR MODAL DETALLES =====
    if (cerrarModalDetalles) {
        cerrarModalDetalles.addEventListener('click', function() {
            cerrarModal(modalDetalles);
        });
    }
    
    // ===== LISTENERS VARIOS =====

    function setupEventListeners() {
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
        
        if (btnLogout) {
            btnLogout.addEventListener('click', function(e) {
                e.preventDefault();
                abrirModal(modalLogout);
            });
        }
        
        if (btnLogoutVolver) {
            btnLogoutVolver.addEventListener('click', function() {
                cerrarModal(modalLogout);
            });
        }
        
        if (btnLogoutConfirmar) {
            btnLogoutConfirmar.addEventListener('click', function() {
                localStorage.clear();
                window.location.href = '../paginas/Rol_Usuario.html';
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                    cerrarMenu();
                }
                if (modalConfirmar && modalConfirmar.classList.contains('activo')) {
                    cerrarModal(modalConfirmar);
                }
                if (modalRechazar && modalRechazar.classList.contains('activo')) {
                    cerrarModal(modalRechazar);
                }
                if (modalDetalles && modalDetalles.classList.contains('activo')) {
                    cerrarModal(modalDetalles);
                }
                if (modalLogout && modalLogout.classList.contains('activo')) {
                    cerrarModal(modalLogout);
                }
                if (modalAccionTemprana && modalAccionTemprana.classList.contains('activo')) {
                    cerrarModal(modalAccionTemprana);
                }
            }
        });
        
        window.addEventListener('resize', function() {
            if (!esMobile()) {
                cerrarMenu();
            }
        });
        
        [modalConfirmar, modalRechazar, modalDetalles, modalLogout, modalAccionTemprana].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        cerrarModal(modal);
                    }
                });
            }
        });
        
        if (cerrarAlertaConfirmar) {
            cerrarAlertaConfirmar.addEventListener('click', function() {
                ocultarAlerta(alertaConfirmar);
            });
        }
        
        if (cerrarAlertaRechazar) {
            cerrarAlertaRechazar.addEventListener('click', function() {
                ocultarAlerta(alertaRechazar);
            });
        }
    }
    
    // ===== UTILIDADES DE MENÚ Y MODALES =====
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
    
    function abrirModal(modal) {
        if (modal) {
            modal.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function cerrarModal(modal) {
        if (modal) {
            modal.classList.remove('activo');
            const modalesAbiertos = document.querySelectorAll('.modal-overlay.activo').length;
            if (modalesAbiertos === 0) {
                document.body.style.overflow = '';
            }
        }
    }
    
    function mostrarAlerta(alerta) {
        if (alerta) {
            alerta.classList.add('mostrar');
            setTimeout(() => {
                ocultarAlerta(alerta);
            }, 4000);
        }
    }
    
    function ocultarAlerta(alerta) {
        if (alerta) {
            alerta.classList.remove('mostrar');
        }
    }
    
    function animarFilas() {
        const filas = document.querySelectorAll('.tabla-solicitudes tbody tr:not(.fila-vacia)');
        filas.forEach((fila, index) => {
            fila.style.opacity = '0';
            fila.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                fila.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                fila.style.opacity = '1';
                fila.style.transform = 'translateX(0)';
            }, index * 80);
        });
    }
    
    console.log('✅ Control de Solicitudes del Asesor - Solo Pendientes y Confirmadas');
});