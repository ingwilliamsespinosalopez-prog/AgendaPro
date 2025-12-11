document.addEventListener('DOMContentLoaded', async () => {

    // ===== CONFIGURACIÓN =====
    const API_BASE_URL = 'http://localhost:7001';
    const token = localStorage.getItem('token');

    // ===== ELEMENTOS DEL DOM =====
    const botonMenu = document.getElementById('boton-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const btnLogout = document.getElementById('logout-button');
    
    const tbody = document.getElementById('tbody-citas');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    const pestanas = document.querySelectorAll('.pestana');
    const indicadorPestana = document.getElementById('indicador');
    const infoPaginacion = document.getElementById('info-paginacion');

    // Estadísticas
    const statTotal = document.getElementById('total-citas');
    const statPendientes = document.getElementById('pendientes');
    const statCompletadas = document.getElementById('confirmadas');
    const statCanceladas = document.getElementById('reagendadas');

    // Modales
    const modalAsignar = document.getElementById('modal-asignar-asesor');
    const modalRechazar = document.getElementById('modal-rechazar');
    const modalDetalles = document.getElementById('modal-detalles');

    // Elementos de Asignación
    const selectAsesor = document.getElementById('select-asesor');
    const btnConfirmarAsignacion = document.getElementById('btn-confirmar-asignacion');
    const btnCancelarAsignacion = document.getElementById('btn-cancelar-asignacion');
    const infoClienteAsignacion = document.getElementById('info-cliente-asignacion');

    // Elementos de Rechazo
    const btnConfirmarRechazo = document.getElementById('btn-confirmar-rechazo');
    const btnCancelarRechazo = document.getElementById('btn-cancelar-rechazar');
    const infoClienteRechazo = document.getElementById('info-cliente-rechazar');
    const textoMotivoRechazo = document.getElementById('textarea-notas-rechazar');

    // Elementos de Detalles
    const contenidoDetalles = document.getElementById('contenido-modal-detalles');
    const btnCerrarDetalles = document.getElementById('cerrar-modal');
    const badgeEstadoModal = document.getElementById('badge-estado-modal');

    // ===== ESTADO =====
    let solicitudes = [];
    let solicitudesFiltradas = [];
    let listaAsesores = [];
    let idCitaSeleccionada = null;
    let filtroActual = 'todas';

    // ===== VALIDACIÓN SESIÓN =====
    if (!token) {
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }

    // ===== INICIALIZACIÓN =====
    init();

    async function init() {
        setupEventListeners();
        await cargarAsesores();
        await cargarSolicitudes();
    }

    // ==========================================
    // 1. CARGA DE DATOS
    // ==========================================

    async function cargarAsesores() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/usuarios/asesores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                listaAsesores = await response.json();
                llenarSelectAsesores();
            }
        } catch (e) {
            console.error("Error cargando asesores:", e);
        }
    }

    function llenarSelectAsesores() {
        selectAsesor.innerHTML = '<option value="">-- Seleccione un asesor --</option>';
        listaAsesores.forEach(asesor => {
            const option = document.createElement('option');
            option.value = asesor.idUsuario;
            option.textContent = `${asesor.nombre} ${asesor.apellido}`;
            selectAsesor.appendChild(option);
        });
    }

    async function cargarSolicitudes() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/cita/listar`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al obtener solicitudes");

            const data = await response.json();
            console.log("📊 Datos recibidos del backend:", data);

            solicitudes = data.map(cita => ({
                idCita: cita.idCita,
                cliente: cita.clienteNombre || 'Cliente Desconocido',
                servicio: cita.servicioNombre || 'Servicio General',
                fecha: cita.fecha || 'Fecha N/A',
                hora: cita.hora || 'Hora N/A',
                fechaHora: `${formatearFecha(cita.fecha)} ${cita.hora}`,
                modalidad: cita.modalidad || 'Presencial',
                estado: cita.estado || 'Pendiente',
                idEstado: cita.idEstado || 1, // ✅ Guardamos el ID del estado
                asesor: cita.asesorNombre || 'Por Asignar',
                notas: cita.notas || 'Sin notas'
            }));

            console.log("✅ Solicitudes procesadas:", solicitudes);
            
            // 🔍 Debug: Verificar qué citas tienen asesor asignado
            const citasConAsesor = solicitudes.filter(c => c.asesor && c.asesor !== 'Por Asignar');
            console.log("👤 Citas con asesor asignado:", citasConAsesor.length);
            citasConAsesor.forEach(c => {
                console.log(`  • ${c.cliente} - Asesor: ${c.asesor} - Estado BD: ${c.estado}`);
            });

            actualizarEstadisticas();
            filtrarSolicitudes(filtroActual);

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red">Error: ${error.message}</td></tr>`;
        }
    }

    // ==========================================
    // 2. RENDERIZADO
    // ==========================================

    function filtrarSolicitudes(filtro) {
        filtroActual = filtro;

        if (filtro === 'todas') {
            solicitudesFiltradas = solicitudes;
        } else {
            solicitudesFiltradas = solicitudes.filter(s => s.estado.toLowerCase() === filtro.toLowerCase());
        }

        renderizarTabla();
        actualizarContadorPaginacion();
    }

    function renderizarTabla() {
        tbody.innerHTML = '';

        if (solicitudesFiltradas.length === 0) {
            if (mensajeVacio) mensajeVacio.style.display = 'block';
            return;
        }
        if (mensajeVacio) mensajeVacio.style.display = 'none';

        solicitudesFiltradas.forEach(cita => {
            const tr = document.createElement('tr');

            // ✅ LÓGICA MEJORADA: Si tiene asesor asignado → "Asignando"
            let claseEstado = 'pendiente';
            let textoEstado = cita.estado;
            
            // 🔥 Si el estado es Pendiente PERO tiene asesor, mostrar como "Asignando"
            const tieneAsesorAsignado = cita.asesor && cita.asesor !== 'Por Asignar';
            
            if (textoEstado === 'Pendiente' && tieneAsesorAsignado) {
                textoEstado = 'Asignando';
                claseEstado = 'asignando';
            } else if (textoEstado === 'Confirmada') {
                claseEstado = 'confirmada';
            } else if (textoEstado === 'Asignando') {
                claseEstado = 'asignando';
            } else if (textoEstado === 'Completada') {
                claseEstado = 'completada';
            } else if (textoEstado === 'Cancelada') {
                claseEstado = 'cancelada';
            }

            const esPendiente = (cita.estado === 'Pendiente' && !tieneAsesorAsignado);

            // Modalidad
            const modalidadLower = cita.modalidad.toLowerCase();
            let icono = '🏢';
            let textoModalidad = 'Presencial';
            
            if (modalidadLower.includes('linea') || modalidadLower.includes('meet') || modalidadLower.includes('online')) {
                icono = '💻';
                textoModalidad = 'Online';
            }

            // Asesor
            const htmlAsesor = (cita.asesor === 'Por Asignar' || !cita.asesor)
                ? `<span style="color: #999; font-style: italic;">Por Asignar</span>`
                : `<span style="font-weight: 600; color: #333;">${cita.asesor}</span>`;

            // Acciones
            let htmlAcciones = '';
            if (esPendiente) {
                htmlAcciones = `
                    <div class="acciones-grupo">
                        <button class="btn-accion btn-asignar" onclick="abrirModalAsignar(${cita.idCita})" title="Asignar Asesor">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <line x1="19" y1="8" x2="19" y2="14"></line>
                                <line x1="22" y1="11" x2="16" y2="11"></line>
                            </svg>
                        </button>
                        <button class="btn-accion btn-rechazar" onclick="abrirModalRechazar(${cita.idCita})" title="Cancelar Solicitud">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </button>
                    </div>
                `;
            } else {
                htmlAcciones = `<span style="color:#aaa; font-size:13px;">Sin acciones</span>`;
            }

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: #2c3e50;">${cita.cliente}</div>
                </td>
                <td>${cita.servicio}</td>
                <td>
                    <div style="font-size: 14px;">${formatearFecha(cita.fecha)}</div>
                    <div style="font-size: 12px; color: #666;">${cita.hora}</div>
                </td>
                <td>
                    <span class="badge-modalidad" style="display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px;">
                        <span style="font-size: 20px;">${icono}</span>
                        <span>${textoModalidad}</span>
                    </span>
                </td>
                <td><span class="badge-estado ${claseEstado}">${textoEstado}</span></td>
                <td>${htmlAsesor}</td>
                <td>${htmlAcciones}</td>
                <td>
                    <button class="btn-ver-detalles" onclick="abrirModalDetalles(${cita.idCita})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function actualizarEstadisticas() {
        const total = solicitudes.length;
        const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length;
        const completadas = solicitudes.filter(s => s.estado === 'Completada').length;
        const canceladas = solicitudes.filter(s => s.estado === 'Cancelada').length;

        if (statTotal) statTotal.textContent = total;
        if (statPendientes) statPendientes.textContent = pendientes;
        if (statCompletadas) statCompletadas.textContent = completadas;
        if (statCanceladas) statCanceladas.textContent = canceladas;
    }

    function actualizarContadorPaginacion() {
        if (infoPaginacion) {
            infoPaginacion.textContent = `Mostrando ${solicitudesFiltradas.length} de ${solicitudes.length} registros`;
        }
    }

    // ==========================================
    // 3. MODALES Y ACCIONES
    // ==========================================

    window.abrirModalAsignar = (idCita) => {
        idCitaSeleccionada = idCita;
        const cita = solicitudes.find(c => c.idCita === idCita);

        if (!cita) return;

        infoClienteAsignacion.innerHTML = `
            <p><strong>Cliente:</strong> ${cita.cliente}</p>
            <p><strong>Servicio:</strong> ${cita.servicio}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(cita.fecha)} - ${cita.hora}</p>
        `;
        selectAsesor.value = "";
        modalAsignar.classList.add('activo');
    };

    if (btnConfirmarAsignacion) {
        btnConfirmarAsignacion.addEventListener('click', async () => {
            const idAsesor = selectAsesor.value;

            if (!idAsesor) {
                mostrarNotificacion('Por favor selecciona un asesor', 'error');
                return;
            }

            btnConfirmarAsignacion.disabled = true;
            btnConfirmarAsignacion.textContent = "Asignando...";

            try {
                console.log('🔄 Iniciando asignación de asesor...');
                
                // 1️⃣ ASIGNAR ASESOR
                const responseAsignar = await fetch(`${API_BASE_URL}/admin/citas/asignar/${idCitaSeleccionada}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ idAsesor: parseInt(idAsesor) })
                });

                const resultadoAsignar = await responseAsignar.json();
                console.log('📤 Respuesta asignar:', resultadoAsignar);

                if (!responseAsignar.ok) {
                    throw new Error(resultadoAsignar.error || 'Error al asignar asesor');
                }

                // 2️⃣ CAMBIAR ESTADO A "ASIGNANDO" (idEstado = 6)
                console.log('🔄 Cambiando estado a Asignando (id=6)...');
                
                const responseEstado = await fetch(`${API_BASE_URL}/admin/citas/estado/${idCitaSeleccionada}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ idEstado: 6 })
                });

                const resultadoEstado = await responseEstado.json();
                console.log('📤 Respuesta cambio estado:', resultadoEstado);

                if (!responseEstado.ok) {
                    console.warn('⚠️ No se pudo cambiar el estado, pero el asesor fue asignado');
                }

                // 3️⃣ ACTUALIZAR FRONTEND Y RECARGAR
                modalAsignar.classList.remove('activo');
                await cargarSolicitudes(); // Recargar desde el backend
                
                mostrarNotificacion('✅ Asesor asignado exitosamente. Estado: Asignando', 'success');

            } catch (e) {
                console.error("❌ Error:", e);
                mostrarNotificacion('Error: ' + e.message, 'error');
            } finally {
                btnConfirmarAsignacion.disabled = false;
                btnConfirmarAsignacion.textContent = "Confirmar y Asignar";
            }
        });
    }

    window.abrirModalRechazar = (idCita) => {
        idCitaSeleccionada = idCita;
        const cita = solicitudes.find(c => c.idCita === idCita);

        if (!cita) return;

        infoClienteRechazo.innerHTML = `
            <p><strong>Cliente:</strong> ${cita.cliente}</p>
            <p><strong>Servicio:</strong> ${cita.servicio}</p>
            <p class="alerta-cancelacion">⚠️ Esta acción cancelará la cita y liberará el horario.</p>
        `;
        if (textoMotivoRechazo) textoMotivoRechazo.value = "";
        modalRechazar.classList.add('activo');
    };

    if (btnConfirmarRechazo) {
        btnConfirmarRechazo.addEventListener('click', async () => {
            btnConfirmarRechazo.disabled = true;
            btnConfirmarRechazo.textContent = "Cancelando...";

            try {
                const response = await fetch(`${API_BASE_URL}/cita/cancelar/${idCitaSeleccionada}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    modalRechazar.classList.remove('activo');
                    await cargarSolicitudes();
                    mostrarNotificacion('Cita cancelada exitosamente', 'success');
                } else {
                    const data = await response.json();
                    mostrarNotificacion(data.error || "No se pudo cancelar la cita", 'error');
                }
            } catch (e) {
                console.error(e);
                mostrarNotificacion('Error de conexión al cancelar', 'error');
            } finally {
                btnConfirmarRechazo.disabled = false;
                btnConfirmarRechazo.textContent = "Confirmar Cancelación";
            }
        });
    }

    window.abrirModalDetalles = (idCita) => {
        const cita = solicitudes.find(c => c.idCita === idCita);
        if (!cita) return;

        badgeEstadoModal.textContent = cita.estado;
        badgeEstadoModal.className = `badge-estado-modal ${cita.estado.toLowerCase()}`;

        const modalidadLower = cita.modalidad.toLowerCase();
        let textoModalidadDetalle = cita.modalidad;
        
        if (modalidadLower.includes('linea') || modalidadLower.includes('meet') || modalidadLower.includes('online')) {
            textoModalidadDetalle = '💻 ' + cita.modalidad;
        } else {
            textoModalidadDetalle = '🏢 ' + cita.modalidad;
        }

        contenidoDetalles.innerHTML = `
            <div class="detalle-item">
                <span class="label">Cliente:</span>
                <span class="valor">${cita.cliente}</span>
            </div>
            <div class="detalle-item">
                <span class="label">Servicio:</span>
                <span class="valor">${cita.servicio}</span>
            </div>
            <div class="detalle-item">
                <span class="label">Fecha y Hora:</span>
                <span class="valor">${formatearFecha(cita.fecha)} a las ${cita.hora}</span>
            </div>
            <div class="detalle-item">
                <span class="label">Modalidad:</span>
                <span class="valor">${textoModalidadDetalle}</span>
            </div>
            <div class="detalle-item">
                <span class="label">Asesor:</span>
                <span class="valor">${cita.asesor}</span>
            </div>
            <div class="detalle-item full-width">
                <span class="label">Notas del Cliente:</span>
                <p class="valor notas-texto">${cita.notas}</p>
            </div>
        `;

        modalDetalles.classList.add('activo');
    };

    // ==========================================
    // 4. UTILIDADES
    // ==========================================

    function mostrarNotificacion(mensaje, tipo = 'success') {
        const notif = document.createElement('div');
        notif.className = `notificacion-toast ${tipo}`;
        notif.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">
                    ${tipo === 'error' ? '❌' : tipo === 'success' ? '✅' : 'ℹ️'}
                </span>
                <span>${mensaje}</span>
            </div>
        `;
        
        Object.assign(notif.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease',
            fontWeight: '500',
            maxWidth: '400px'
        });
        
        if (tipo === 'error') {
            notif.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            notif.style.color = 'white';
        } else if (tipo === 'success') {
            notif.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            notif.style.color = 'white';
        }
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            
            /* Estilos para badges de estado */
            .badge-estado {
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                display: inline-block;
            }
            
            .badge-estado.pendiente {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: #78350f;
            }
            
            .badge-estado.asignando {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }
            
            .badge-estado.confirmada {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }
            
            .badge-estado.completada {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
            }
            
            .badge-estado.cancelada {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    function formatearFecha(fechaISO) {
        if (!fechaISO) return "-";
        const [y, m, d] = fechaISO.split('-');
        return `${d}/${m}/${y}`;
    }

    function setupEventListeners() {
        if (botonMenu) botonMenu.addEventListener('click', () => {
            menuLateral.classList.toggle('abierto');
            overlayMenu.classList.toggle('activo');
            botonMenu.classList.toggle('activo');
        });
        
        if (overlayMenu) overlayMenu.addEventListener('click', () => {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
            if (botonMenu) botonMenu.classList.remove('activo');
        });

        if (btnLogout) btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            const modalLogout = document.getElementById('modal-logout');
            if (modalLogout) {
                modalLogout.classList.add('activo');
            } else {
                if (confirm("¿Cerrar sesión?")) {
                    localStorage.clear();
                    window.location.href = '../paginas/Rol_Usuario.html';
                }
            }
        });

        pestanas.forEach(pestana => {
            pestana.addEventListener('click', () => {
                pestanas.forEach(p => p.classList.remove('activa'));
                pestana.classList.add('activa');

                if (indicadorPestana) {
                    const width = pestana.offsetWidth;
                    const left = pestana.offsetLeft;
                    indicadorPestana.style.width = `${width}px`;
                    indicadorPestana.style.transform = `translateX(${left}px)`;
                }

                const filtro = pestana.getAttribute('data-filtro');
                filtrarSolicitudes(filtro);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('activo');
            });
        });

        if (btnCerrarDetalles) btnCerrarDetalles.onclick = () => modalDetalles.classList.remove('activo');
        
        const cerrarModalAsignacion = document.getElementById('cerrar-modal-asignacion');
        if (cerrarModalAsignacion) cerrarModalAsignacion.onclick = () => modalAsignar.classList.remove('activo');
        if (btnCancelarAsignacion) btnCancelarAsignacion.onclick = () => modalAsignar.classList.remove('activo');
        
        const cerrarModalRechazar = document.getElementById('cerrar-modal-rechazar');
        if (cerrarModalRechazar) cerrarModalRechazar.onclick = () => modalRechazar.classList.remove('activo');
        if (btnCancelarRechazo) btnCancelarRechazo.onclick = () => modalRechazar.classList.remove('activo');

        const modalLogout = document.getElementById('modal-logout');
        const btnLogoutVolver = document.getElementById('btn-logout-volver');
        const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
        
        if (btnLogoutVolver) {
            btnLogoutVolver.onclick = () => modalLogout.classList.remove('activo');
        }
        
        if (btnLogoutConfirmar) {
            btnLogoutConfirmar.onclick = () => {
                localStorage.clear();
                window.location.href = '../paginas/Rol_Usuario.html';
            };
        }
    }

    console.log('✅ Gestor de Solicitudes Admin cargado correctamente');
});