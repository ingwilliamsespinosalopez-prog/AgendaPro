document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const usuarioId = localStorage.getItem('usuarioId'); 
    const token = localStorage.getItem('token'); 

    // ===== ELEMENTOS DEL DOM =====
    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const tbodyAsesorias = document.getElementById('tbody-asesorias');
    const filtroBuscar = document.getElementById('filtro-buscar');
    const filtroEstado = document.getElementById('filtro-estado');
    const btnLogout = document.getElementById('logout-button');
    
    // Elementos del modal logout
    const modalLogout = document.getElementById("modal-logout");
    const btnCerrarModalLogout = document.getElementById("btn-cancelar-logout");
    const btnLogoutConfirmar = document.getElementById("btn-logout-confirmar");
    
    // Elementos del modal reagendar
    const modalReagendar = document.getElementById('modal-reagendar');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarReagendar = document.getElementById('btn-cancelar-reagendar');
    const btnConfirmarReagendacion = document.getElementById('btn-confirmar-reagendacion');
    const infoCitaActual = document.getElementById('info-cita-actual');
    const inputNuevaFecha = document.getElementById('nueva-fecha');
    const inputNuevaHora = document.getElementById('nueva-hora');
    const inputMotivoReagendar = document.getElementById('motivo-reagendar');
    
    // ===== DATOS EN MEMORIA =====
    let asesorias = [];
    let asesoriasOriginales = [];
    let listaServicios = {};
    let idCitaSeleccionada = null;
    let fechaHoraActualCita = null;
    
    // ===== VALIDACIÓN DE SESIÓN =====
    if (!usuarioId || !token) {
        mostrarNotificacion('No has iniciado sesión', 'error');
        setTimeout(() => {
            window.location.href = '../paginas/Rol_Usuario.html';
        }, 1500);
        return;
    }

    // ==========================================
    // 0. CARGAR CATÁLOGO DE SERVICIOS
    // ==========================================
    async function cargarCatalogoServicios() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/servicios`);
            if (response.ok) {
                const servicios = await response.json();
                servicios.forEach(s => {
                    listaServicios[s.idServicio] = s.nombre;
                });
            }
        } catch (e) {
            console.error("Error cargando servicios:", e);
        }
    }

    // ==========================================
    // UTILIDADES DE MAPEO - COMPLETO ✅
    // ==========================================
    function mapearEstadoTexto(idEstado) {
        switch(idEstado) {
            case 1: return "Pendiente";
            case 2: return "Confirmada";
            case 3: return "Cancelada";
            case 4: return "Completada";
            case 5: return "No Asistió";
            case 6: return "Asignando";
            default: return "Desconocido";
        }
    }

    function mapearServicio(idServicio) {
        return listaServicios[idServicio] || `Servicio ${idServicio}`;
    }

    // ==========================================
    // 1. CARGAR HISTORIAL
    // ==========================================
    async function cargarAsesorias() {
        try {
            const response = await fetch(`${API_BASE_URL}/cita/cliente/${usuarioId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener el historial");

            const datosBackend = await response.json();
            
            // ✅ DEBUG: Ver datos RAW del backend
            console.log('📦 DATOS COMPLETOS DEL BACKEND:', datosBackend);
            
            asesoriasOriginales = datosBackend.map(cita => {
                // Debug: Verificar qué estado viene del backend
                console.log(`🔍 Cita ${cita.idCita}:`, {
                    idEstadoRecibido: cita.idEstado,
                    tipoIdEstado: typeof cita.idEstado,
                    estadoMapeado: mapearEstadoTexto(cita.idEstado)
                });
                
                return {
                    idCita: cita.idCita,
                    fecha: cita.fechaCita,
                    hora: cita.horaCita,
                    tipo: mapearServicio(cita.idServicio),
                    asesor: (cita.idAsesor && cita.idAsesor > 0) ? "Asignado" : "Por Asignar",
                    estadoTexto: mapearEstadoTexto(cita.idEstado),
                    estadoCodigo: cita.idEstado,
                    pagado: cita.pagado,
                    notas: cita.notas || ''
                };
            });

            asesorias = [...asesoriasOriginales];
            
            // ✅ DEBUG: Ver datos procesados
            console.log('✅ DATOS PROCESADOS:', asesorias);
            
            renderizarAsesorias();

        } catch (error) {
            console.error(error);
            tbodyAsesorias.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
        }
    }

    // ==========================================
    // RENDERIZADO DE TABLA
    // ==========================================
    function renderizarAsesorias() {
        if (!tbodyAsesorias) return;
        tbodyAsesorias.innerHTML = '';
        
        if (asesorias.length === 0) {
            tbodyAsesorias.innerHTML = `<tr><td colspan="7" class="mensaje-vacio"><p>📅 No tienes citas registradas</p></td></tr>`;
            return;
        }
        
        asesorias.forEach((asesoria, index) => {
            const tr = document.createElement('tr');
            
            // ✅ Colores según TODOS los estados del sistema
            let claseEstado = "pendiente"; // Por defecto
            
            // Mapeo explícito de cada estado
            switch(asesoria.estadoCodigo) {
                case 1: claseEstado = "pendiente"; break;
                case 2: claseEstado = "confirmada"; break;
                case 3: claseEstado = "cancelada"; break;
                case 4: claseEstado = "completada"; break;
                case 5: claseEstado = "no-asistio"; break;
                case 6: claseEstado = "asignando"; break;
                default: claseEstado = "pendiente";
            }
            
            // Debug en consola
            console.log(`Renderizando cita ${asesoria.idCita}: estadoCodigo=${asesoria.estadoCodigo}, clase="${claseEstado}", texto="${asesoria.estadoTexto}"`);
            
            // ✅ NUEVA LÓGICA: Completada también puede reagendar
            const puedeReagendar = (asesoria.estadoCodigo === 1 || asesoria.estadoCodigo === 2 || 
                                    asesoria.estadoCodigo === 4 || asesoria.estadoCodigo === 6);
            
            const puedeCancelar = (asesoria.estadoCodigo === 1 || asesoria.estadoCodigo === 2 || asesoria.estadoCodigo === 6);

            tr.innerHTML = `
                <td>${formatearFechaVisual(asesoria.fecha)}</td>
                <td>${asesoria.hora}</td>
                <td>${asesoria.tipo}</td>
                <td>${asesoria.asesor}</td>
                <td>
                    <span class="badge-estado ${claseEstado}" data-estado-id="${asesoria.estadoCodigo}" title="Estado ID: ${asesoria.estadoCodigo}">
                        ${asesoria.estadoTexto}
                    </span>
                </td>
                <td class="columna-notas" title="${asesoria.notas}">${recortarTexto(asesoria.notas, 20)}</td>
                <td>
                    <div class="acciones-celda">
                        <button class="btn-accion btn-reagendar" 
                            ${!puedeReagendar ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} 
                            title="${puedeReagendar ? 'Reagendar cita' : 'No se puede reagendar'}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                <polyline points="23 4 23 10 17 10"></polyline>
                            </svg>
                        </button>
                        <button class="btn-accion btn-cancelar" 
                            ${!puedeCancelar ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
                            title="${puedeCancelar ? 'Cancelar cita' : 'No se puede cancelar'}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            const btnReagendar = tr.querySelector('.btn-reagendar');
            const btnCancelar = tr.querySelector('.btn-cancelar');
            
            if (puedeReagendar) {
                btnReagendar.addEventListener('click', () => abrirModalReagendar(index));
            }
            if (puedeCancelar) {
                btnCancelar.addEventListener('click', () => cancelarCita(index));
            }
            
            tbodyAsesorias.appendChild(tr);
        });
        
        animarFilas();
    }

    // ==========================================
    // 2. CANCELAR CITA
    // ==========================================
    async function cancelarCita(index) {
        const asesoria = asesorias[index];
        const confirmar = confirm(`¿Seguro que deseas cancelar la cita del ${formatearFechaVisual(asesoria.fecha)}?\n\n⚠️ Si ya pagaste, se iniciará el proceso de reembolso automático.`);
        
        if (!confirmar) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cita/cancelar/${asesoria.idCita}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                mostrarNotificacion('✅ ' + data.mensaje, 'success');
                await cargarAsesorias(); 
            } else {
                mostrarNotificacion("❌ " + (data.error || "No se pudo cancelar"), 'error');
            }
        } catch (e) {
            console.error(e);
            mostrarNotificacion("Error de conexión al cancelar", 'error');
        }
    }

    // ==========================================
    // 3. REAGENDAR CITA
    // ==========================================
    function abrirModalReagendar(index) {
        const asesoria = asesorias[index];
        idCitaSeleccionada = asesoria.idCita;
        
        fechaHoraActualCita = `${asesoria.fecha} ${asesoria.hora.substring(0, 5)}`;
        
        let mensajeAdicional = '';
        if (asesoria.estadoCodigo === 4) {
            mensajeAdicional = `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-top: 10px; font-size: 13px;">
                    <strong>ℹ️ Nota:</strong> Esta cita está marcada como <strong>Completada</strong>. 
                    Al reagendarla, el estado cambiará automáticamente a <strong>Pendiente</strong>.
                </div>
            `;
        }
        
        infoCitaActual.innerHTML = `
            <p><strong>Servicio:</strong> ${asesoria.tipo}</p>
            <p><strong>Fecha actual:</strong> ${formatearFechaVisual(asesoria.fecha)} - ${asesoria.hora}</p>
            <p><strong>Estado actual:</strong> <span class="badge-estado ${asesoria.estadoCodigo === 4 ? 'completada' : asesoria.estadoCodigo === 2 ? 'confirmada' : 'pendiente'}">${asesoria.estadoTexto}</span></p>
            ${mensajeAdicional}
        `;
        
        const hoy = new Date();
        inputNuevaFecha.min = hoy.toISOString().split('T')[0];
        
        inputNuevaFecha.addEventListener('input', function() {
            const fechaSeleccionada = new Date(this.value + 'T00:00:00');
            if (fechaSeleccionada.getDay() === 0) {
                mostrarNotificacion('❌ No se permiten citas los domingos. Selecciona otro día.', 'error');
                this.value = '';
            }
        });
        
        inputNuevaHora.min = "09:00";
        inputNuevaHora.max = "17:00";
        inputNuevaHora.step = "1800";
        
        inputNuevaFecha.value = '';
        inputNuevaHora.value = '';
        inputMotivoReagendar.value = '';
        
        modalReagendar.classList.add('activo');
    }

    async function enviarReagendacion(e) {
        if (e) e.preventDefault();
        if (idCitaSeleccionada === null) return;

        const nuevaFecha = inputNuevaFecha.value;
        const nuevaHora = inputNuevaHora.value;
        const motivo = inputMotivoReagendar.value.trim();

        if (!nuevaFecha || !nuevaHora || !motivo) {
            mostrarAlertaDetallada(
                '❌ Campos Incompletos',
                'Debes completar todos los campos requeridos:',
                ['• Nueva fecha de la cita', '• Nueva hora de la cita', '• Motivo de la reagendación']
            );
            return;
        }

        const nuevaFechaHoraStr = `${nuevaFecha} ${nuevaHora}`;
        if (nuevaFechaHoraStr === fechaHoraActualCita) {
            mostrarAlertaDetallada(
                '❌ Fecha y Hora Duplicada',
                'La nueva fecha y hora debe ser diferente a la cita actual.',
                [
                    `Fecha actual: ${formatearFechaVisual(fechaHoraActualCita.split(' ')[0])}`,
                    `Hora actual: ${fechaHoraActualCita.split(' ')[1]}`,
                    '',
                    '💡 Por favor, selecciona una fecha u hora diferente.'
                ]
            );
            return;
        }

        const fechaHoraNueva = new Date(`${nuevaFecha}T${nuevaHora}:00`);
        const ahora = new Date();

        if (fechaHoraNueva <= ahora) {
            mostrarAlertaDetallada(
                '❌ Fecha No Válida',
                'No puedes reagendar a una fecha u hora pasada.',
                [
                    `Fecha seleccionada: ${formatearFechaVisual(nuevaFecha)} a las ${nuevaHora}`,
                    `Fecha actual: ${formatearFechaVisual(ahora.toISOString().split('T')[0])} a las ${ahora.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}`,
                    '',
                    '💡 Selecciona una fecha y hora futura.'
                ]
            );
            return;
        }

        const diaSemana = fechaHoraNueva.getDay();
        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        if (diaSemana === 0) {
            mostrarAlertaDetallada(
                '❌ Día No Permitido',
                'No se pueden agendar citas los domingos.',
                [
                    `Día seleccionado: ${nombresDias[diaSemana]} ${formatearFechaVisual(nuevaFecha)}`,
                    '',
                    '📅 Días disponibles:',
                    '• Lunes a Sábado',
                    '',
                    '💡 Por favor, selecciona otro día de la semana.'
                ]
            );
            return;
        }

        const horaNumero = fechaHoraNueva.getHours();
        const minutoNumero = fechaHoraNueva.getMinutes();
        
        if (horaNumero < 9 || horaNumero > 17 || (horaNumero === 17 && minutoNumero > 0)) {
            const horaSeleccionada = `${horaNumero.toString().padStart(2, '0')}:${minutoNumero.toString().padStart(2, '0')}`;
            
            let razonRechazo = '';
            if (horaNumero < 9) {
                razonRechazo = 'La hora seleccionada es antes de las 9:00 AM.';
            } else if (horaNumero > 17 || (horaNumero === 17 && minutoNumero > 0)) {
                razonRechazo = 'La hora seleccionada es después de las 5:00 PM.';
            }
            
            mostrarAlertaDetallada(
                '⏰ Horario No Permitido',
                'No se puede reagendar en el horario seleccionado.',
                [
                    `Hora seleccionada: ${horaSeleccionada}`,
                    `Motivo: ${razonRechazo}`,
                    '',
                    '🕒 Horario de atención:',
                    '• Lunes a Sábado',
                    '• De 9:00 AM a 5:00 PM',
                    '',
                    '💡 Por favor, selecciona una hora dentro del horario de atención.'
                ]
            );
            return;
        }
        
        btnConfirmarReagendacion.disabled = true;
        btnConfirmarReagendacion.textContent = "Reagendando...";

        const nuevaHoraFinal = nuevaHora.length === 5 ? nuevaHora + ":00" : nuevaHora;

        try {
            const response = await fetch(`${API_BASE_URL}/cita/reagendar/${idCitaSeleccionada}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    fecha: nuevaFecha, 
                    hora: nuevaHoraFinal, 
                    motivo: motivo 
                })
            });

            const data = await response.json();

            if (response.ok) {
                const citaActual = asesorias.find(a => a.idCita === idCitaSeleccionada);
                
                if (citaActual && citaActual.estadoCodigo === 4) {
                    try {
                        await fetch(`${API_BASE_URL}/admin/citas/estado/${idCitaSeleccionada}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ idEstado: 1 })
                        });
                        
                        mostrarNotificacion('✅ Cita reagendada y estado cambiado a Pendiente.', 'success');
                    } catch (errorEstado) {
                        console.warn('No se pudo cambiar el estado automáticamente:', errorEstado);
                        mostrarNotificacion('✅ Cita reagendada. Nota: Verifica el estado manualmente.', 'success');
                    }
                } else {
                    mostrarNotificacion('✅ ' + data.mensaje, 'success');
                }
                
                cerrarModalReagendar();
                await cargarAsesorias();
            } else {
                mostrarNotificacion('❌ ' + (data.error || "No se pudo reagendar"), 'error');
            }
        } catch (e) {
            console.error('Error al reagendar:', e);
            mostrarNotificacion('❌ Error de conexión al reagendar.', 'error');
        } finally {
            btnConfirmarReagendacion.disabled = false;
            btnConfirmarReagendacion.textContent = "Confirmar Reagendación";
        }
    }

    if (btnConfirmarReagendacion) {
        btnConfirmarReagendacion.addEventListener('click', enviarReagendacion);
    }

    function cerrarModalReagendar() {
        if (modalReagendar) modalReagendar.classList.remove('activo');
        inputNuevaFecha.value = '';
        inputNuevaHora.value = '';
        inputMotivoReagendar.value = '';
        idCitaSeleccionada = null;
        fechaHoraActualCita = null;
    }

    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalReagendar);
    if (btnCancelarReagendar) btnCancelarReagendar.addEventListener('click', cerrarModalReagendar);

    // ==========================================
    // FILTROS
    // ==========================================
    function filtrarTabla() {
        const texto = filtroBuscar.value.toLowerCase();
        const estado = filtroEstado.value;
        
        asesorias = asesoriasOriginales.filter(item => {
            const matchTexto = item.tipo.toLowerCase().includes(texto) || 
                              item.asesor.toLowerCase().includes(texto);
            const matchEstado = estado === "" || item.estadoTexto === estado;
            return matchTexto && matchEstado;
        });
        
        renderizarAsesorias();
    }

    if (filtroBuscar) filtroBuscar.addEventListener('input', filtrarTabla);
    if (filtroEstado) filtroEstado.addEventListener('change', filtrarTabla);

    // ==========================================
    // UTILIDADES
    // ==========================================
    function formatearFechaVisual(fechaISO) {
        if (!fechaISO) return "";
        const [y, m, d] = fechaISO.split('-');
        return `${d}/${m}/${y}`;
    }

    function recortarTexto(texto, max) {
        if (!texto) return "-";
        return texto.length > max ? texto.substring(0, max) + '...' : texto;
    }

    function animarFilas() {
        const filas = document.querySelectorAll('#tbody-asesorias tr');
        filas.forEach((fila, i) => {
            fila.style.opacity = '0';
            fila.style.animation = `fadeIn 0.3s ease forwards ${i * 0.05}s`;
        });
    }

    function mostrarNotificacion(mensaje, tipo = 'success') {
        const notif = document.createElement('div');
        notif.className = `notificacion-toast ${tipo}`;
        
        const icono = tipo === 'error' ? '❌' : tipo === 'success' ? '✅' : 'ℹ️';
        
        notif.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">${icono}</span>
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
            maxWidth: '400px',
            color: 'white'
        });
        
        if (tipo === 'error') {
            notif.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        } else if (tipo === 'success') {
            notif.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        } else {
            notif.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        }
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    function mostrarAlertaDetallada(titulo, descripcion, detalles = []) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7); display: flex;
            justify-content: center; align-items: center;
            z-index: 10001; animation: fadeIn 0.2s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 12px; padding: 30px;
            max-width: 500px; width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideInModal 0.3s ease;
        `;

        const detallesHTML = detalles.map(d => `<div style="color: #555; line-height: 1.8;">${d}</div>`).join('');

        modal.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                <h3 style="color: #dc2626; margin: 0; font-size: 20px;">${titulo}</h3>
            </div>
            <p style="color: #333; font-size: 15px; margin-bottom: 15px; text-align: center;">${descripcion}</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-family: monospace; font-size: 13px;">
                ${detallesHTML}
            </div>
            <button id="btn-cerrar-alerta" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
                Entendido
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const btnCerrar = modal.querySelector('#btn-cerrar-alerta');
        btnCerrar.addEventListener('mouseenter', () => btnCerrar.style.transform = 'scale(1.02)');
        btnCerrar.addEventListener('mouseleave', () => btnCerrar.style.transform = 'scale(1)');

        function cerrarAlerta() {
            overlay.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => overlay.remove(), 200);
        }

        btnCerrar.addEventListener('click', cerrarAlerta);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarAlerta();
        });

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                cerrarAlerta();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    // Agregar animaciones CSS
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes slideInModal { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            .badge-estado { padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; text-align: center; }
            .badge-estado.pendiente { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #78350f; }
            .badge-estado.confirmada { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
            .badge-estado.asignando { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
            .badge-estado.cancelada { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
            .badge-estado.completada { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; }
            .badge-estado.no-asistio { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MENÚ Y LOGOUT
    // ==========================================
    function toggleMenu() {
        if (!menuLateral) return;
        const estaAbierto = menuLateral.classList.contains('abierto');
        
        if (estaAbierto) {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
            if (botonHamburguesa) botonHamburguesa.classList.remove('activo');
            document.body.style.overflow = '';
        } else {
            menuLateral.classList.add('abierto');
            overlayMenu.classList.add('activo');
            if (botonHamburguesa) botonHamburguesa.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    if (botonHamburguesa) {
        botonHamburguesa.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (overlayMenu) {
        overlayMenu.addEventListener('click', toggleMenu);
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            if (modalLogout) modalLogout.classList.add("activo");
        });
    }

    if (btnCerrarModalLogout) {
        btnCerrarModalLogout.addEventListener("click", () => {
            if (modalLogout) modalLogout.classList.remove("activo");
        });
    }

    if (btnLogoutConfirmar) {
        btnLogoutConfirmar.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = '../paginas/Rol_Usuario.html';
        });
    }

    if (modalReagendar) {
        modalReagendar.addEventListener('click', (e) => {
            if (e.target === modalReagendar) cerrarModalReagendar();
        });
    }

    if (modalLogout) {
        modalLogout.addEventListener('click', (e) => {
            if (e.target === modalLogout) modalLogout.classList.remove('activo');
        });
    }

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    cargarCatalogoServicios().then(() => {
        cargarAsesorias();
    });

    console.log('✅ Sistema de historial de citas cargado correctamente');
});