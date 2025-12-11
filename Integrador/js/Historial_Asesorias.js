document.addEventListener('DOMContentLoaded', () => {

    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const token = localStorage.getItem('token');

    // ===== VALIDACIÓN SESIÓN =====
    if (!token) {
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }

    // ===== ELEMENTOS DEL DOM =====
    const botonMenu = document.getElementById('boton-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const btnLogout = document.getElementById('logout-button');

    // Modal Logout
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');

    const tbody = document.getElementById('tbody-historial');
    const pestanas = document.querySelectorAll('.pestana-historial');
    const indicador = document.getElementById('indicador-historial');
    const contenedorPestanas = document.querySelector('.contenedor-pestanas-historial');
    
    const inputBuscar = document.getElementById('input-buscar');
    const filtroTipo = document.getElementById('filtro-tipo-asesoria');
    const btnOrdenarFecha = document.getElementById('btn-ordenar-fecha');
    const btnExportar = document.getElementById('btn-exportar-historial');
    const infoPaginacion = document.getElementById('info-paginacion');

    const statTotal = document.getElementById('total-asesorias');
    const statCompletadas = document.getElementById('completadas');
    const statCanceladas = document.getElementById('canceladas');
    const statPendientes = document.getElementById('pendientes'); 

    const modalExportar = document.getElementById('modal-confirmar-exportar-historial');
    const btnCancelarExportar = document.getElementById('btn-cancelar-exportar-historial');
    const btnConfirmarExportar = document.getElementById('btn-confirmar-exportar-historial');

    // ===== ELEMENTOS FILTROS GRÁFICAS =====
    const filtroTipoGrafica = document.getElementById('filtro-tipo-grafica');
    const filtroMesGrafica = document.getElementById('filtro-mes-grafica');
    const filtroAnioGrafica = document.getElementById('filtro-anio-grafica');
    const btnResetearFiltros = document.querySelector('.btn-actualizar-graficas');

    // ===== ESTADO =====
    let historialGlobal = [];
    let historialFiltrado = [];
    let ordenAscendente = false;
    
    // Variables para gráficas
    let chartEstados = null;
    let chartModalidad = null;

    // ===== INICIALIZACIÓN =====
    init();

    async function init() {
        inicializarFiltrosGraficas();
        setupEventListeners();
        await cargarServiciosFiltro(); 
        await cargarHistorial();
        setTimeout(posicionarIndicador, 100);
    }

    // ==========================================
    // INICIALIZAR FILTROS DE GRÁFICAS
    // ==========================================
    function inicializarFiltrosGraficas() {
        if (!filtroAnioGrafica) return;

        // Llenar select de años (últimos 5 años)
        const anioActual = new Date().getFullYear();
        filtroAnioGrafica.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const anio = anioActual - i;
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            filtroAnioGrafica.appendChild(option);
        }

        // Establecer mes y año actuales
        const mesActual = new Date().getMonth();
        if (filtroMesGrafica) filtroMesGrafica.value = mesActual;
        if (filtroAnioGrafica) filtroAnioGrafica.value = anioActual;

        // Por defecto mostrar filtros de mes (ambos visibles)
        if (filtroMesGrafica) filtroMesGrafica.parentElement.style.display = 'flex';
        if (filtroAnioGrafica) filtroAnioGrafica.parentElement.style.display = 'flex';
    }

    // ==========================================
    // 0. CARGAR SERVICIOS (FILTRO)
    // ==========================================
    async function cargarServiciosFiltro() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/servicios`);
            if (response.ok) {
                const servicios = await response.json();
                filtroTipo.innerHTML = '<option value="todos">Todos los Servicios</option>';
                servicios.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.nombre;
                    option.textContent = s.nombre;
                    filtroTipo.appendChild(option);
                });
            }
        } catch (e) {
            console.error("Error cargando servicios:", e);
        }
    }

    // ==========================================
    // 1. CARGAR HISTORIAL (BACKEND)
    // ==========================================
    async function cargarHistorial() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/cita/listar`, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al obtener historial");

            const data = await response.json();
            console.log("Historial recibido:", data);

            historialGlobal = data.map(cita => ({
                id: `C-${cita.idCita}`,
                idReal: cita.idCita,
                cliente: cita.clienteNombre || 'Desconocido',
                servicio: cita.servicioNombre || 'General',
                fecha: cita.fecha,
                hora: cita.hora,
                fechaHora: new Date(`${cita.fecha}T${cita.hora}`),
                modalidad: cita.modalidad || 'Presencial',
                estado: cita.estado || 'Pendiente',
                notas: cita.notas || ''
            }));

            // Orden inicial (Más recientes primero)
            historialGlobal.sort((a, b) => b.fechaHora - a.fechaHora);

            historialFiltrado = [...historialGlobal];
            
            actualizarEstadisticas();
            aplicarFiltros(); 
            renderizarGraficas();

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red">Error: ${error.message}</td></tr>`;
        }
    }

    // ==========================================
    // 2. RENDERIZADO Y FILTROS
    // ==========================================
    function renderizarTabla() {
        tbody.innerHTML = '';

        if (historialFiltrado.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: #999;">No se encontraron asesorías</td></tr>`;
            return;
        }

        historialFiltrado.forEach(cita => {
            const tr = document.createElement('tr');
            
            let claseEstado = 'pendiente';
            if (cita.estado === 'Completada') claseEstado = 'completada';
            if (cita.estado === 'Confirmada') claseEstado = 'completada';
            if (cita.estado === 'Cancelada') claseEstado = 'cancelada';

            const modalidadLower = cita.modalidad.toLowerCase();
            let icono = '🏢';
            let textoModalidad = 'Presencial';
            
            if (modalidadLower.includes('linea') || modalidadLower.includes('meet') || modalidadLower.includes('online')) {
                icono = '💻';
                textoModalidad = 'Online';
            }

            tr.innerHTML = `
                <td>${cita.id}</td>
                <td><strong>${cita.cliente}</strong></td>
                <td>${cita.servicio}</td>
                <td>
                    <span class="badge-modalidad" style="display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px;">
                        <span style="font-size: 20px;">${icono}</span>
                        <span>${textoModalidad}</span>
                    </span>
                </td>
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${cita.hora}</td>
                <td><span class="badge-estado-historial ${claseEstado}">${cita.estado}</span></td>
                <td>
                    <button class="btn-detalles-historial" onclick="verDetalles(${cita.idReal})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        actualizarPaginacionTexto();
    }

    function aplicarFiltros() {
        const texto = inputBuscar.value.toLowerCase();
        const tipoServicio = filtroTipo.value;
        const pestanaActiva = document.querySelector('.pestana-historial.activa');
        const filtroEstado = pestanaActiva ? pestanaActiva.getAttribute('data-filtro') : 'todas';

        historialFiltrado = historialGlobal.filter(cita => {
            const matchTexto = cita.cliente.toLowerCase().includes(texto) || cita.id.toLowerCase().includes(texto);
            const matchTipo = (tipoServicio === 'todos') || (cita.servicio === tipoServicio);

            let matchEstado = true;
            if (filtroEstado === 'completada') matchEstado = (cita.estado === 'Completada' || cita.estado === 'Confirmada');
            if (filtroEstado === 'cancelada') matchEstado = cita.estado === 'Cancelada';
            if (filtroEstado === 'pendiente') matchEstado = cita.estado === 'Pendiente';

            return matchTexto && matchTipo && matchEstado;
        });

        renderizarTabla();
    }

    function actualizarEstadisticas() {
        const total = historialGlobal.length;
        const completadas = historialGlobal.filter(c => c.estado === 'Completada' || c.estado === 'Confirmada').length;
        const canceladas = historialGlobal.filter(c => c.estado === 'Cancelada').length;
        const pendientes = historialGlobal.filter(c => c.estado === 'Pendiente').length;

        if(statTotal) statTotal.textContent = total;
        if(statCompletadas) statCompletadas.textContent = completadas;
        if(statCanceladas) statCanceladas.textContent = canceladas;
        if(statPendientes) statPendientes.textContent = pendientes;
    }

    // ==========================================
    // 3. FILTRAR DATOS PARA GRÁFICAS
    // ==========================================
    function filtrarDatosGraficas() {
        if (!filtroTipoGrafica) return historialGlobal;

        const tipoFiltro = filtroTipoGrafica.value;
        const mesSeleccionado = filtroMesGrafica ? parseInt(filtroMesGrafica.value) : new Date().getMonth();
        const anioSeleccionado = filtroAnioGrafica ? parseInt(filtroAnioGrafica.value) : new Date().getFullYear();
        
        return historialGlobal.filter(cita => {
            const fecha = new Date(cita.fechaHora);
            const mes = fecha.getMonth();
            const anio = fecha.getFullYear();
            
            if (tipoFiltro === 'mes') {
                return mes === mesSeleccionado && anio === anioSeleccionado;
            } else if (tipoFiltro === 'anio') {
                return anio === anioSeleccionado;
            }
            
            return true;
        });
    }

    // ==========================================
    // 4. GRÁFICAS (CHART.JS)
    // ==========================================
    function renderizarGraficas() {
        const datosFiltrados = filtrarDatosGraficas();
        
        console.log(`📊 Renderizando gráficas con ${datosFiltrados.length} registros filtrados`);

        // --- PREPARAR DATOS ESTADOS ---
        let countCompletadas = 0;
        let countCanceladas = 0;
        let countPendientes = 0;

        datosFiltrados.forEach(cita => {
            if (cita.estado === 'Completada' || cita.estado === 'Confirmada') countCompletadas++;
            else if (cita.estado === 'Cancelada') countCanceladas++;
            else countPendientes++;
        });

        // --- PREPARAR DATOS MODALIDAD ---
        let countOnline = 0;
        let countPresencial = 0;

        datosFiltrados.forEach(cita => {
            const modalidadLower = cita.modalidad.toLowerCase();
            if (modalidadLower.includes('linea') || modalidadLower.includes('meet') || modalidadLower.includes('online')) {
                countOnline++;
            } else {
                countPresencial++;
            }
        });

        // --- RENDERIZAR GRÁFICA ESTADOS ---
        const ctxEstados = document.getElementById('grafica-estados');
        if (ctxEstados) {
            if (chartEstados) chartEstados.destroy();

            chartEstados = new Chart(ctxEstados.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Completadas', 'Canceladas', 'Pendientes'],
                    datasets: [{
                        data: [countCompletadas, countCanceladas, countPendientes],
                        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    if (total === 0) return `${label}: 0`;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // --- RENDERIZAR GRÁFICA MODALIDAD ---
        const ctxModalidad = document.getElementById('grafica-modalidad');
        if (ctxModalidad) {
            if (chartModalidad) chartModalidad.destroy();

            chartModalidad = new Chart(ctxModalidad.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['En Línea', 'Presencial'],
                    datasets: [{
                        data: [countOnline, countPresencial],
                        backgroundColor: ['#3b82f6', '#8b5cf6'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    if (total === 0) return `${label}: 0`;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // ==========================================
    // 5. UTILS & LISTENERS
    // ==========================================
    function actualizarPaginacionTexto() {
        if(infoPaginacion) {
            infoPaginacion.textContent = `Mostrando ${historialFiltrado.length} registros`;
        }
    }

    window.verDetalles = (idReal) => {
        const cita = historialGlobal.find(c => c.idReal === idReal);
        if (cita) {
            alert(`
                DETALLES DE LA ASESORÍA
                -----------------------
                ID: ${cita.id}
                Cliente: ${cita.cliente}
                Servicio: ${cita.servicio}
                Modalidad: ${cita.modalidad}
                Fecha: ${cita.fecha}
                Hora: ${cita.hora}
                Estado: ${cita.estado}
                Notas: ${cita.notas}
            `);
        }
    };

    function exportarExcel() {
        if (typeof XLSX === 'undefined') return alert('Librería XLSX no cargada');
        const datosExcel = historialFiltrado.map(c => ({
            "ID": c.id,
            "Cliente": c.cliente,
            "Servicio": c.servicio,
            "Modalidad": c.modalidad,
            "Fecha": c.fecha,
            "Hora": c.hora,
            "Estado": c.estado
        }));
        const ws = XLSX.utils.json_to_sheet(datosExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial");
        XLSX.writeFile(wb, `Historial_AFG_${new Date().toISOString().slice(0,10)}.xlsx`);
    }

    function formatearFecha(fechaISO) {
        if (!fechaISO) return "-";
        const [y, m, d] = fechaISO.split('-');
        return `${d}/${m}/${y}`;
    }

    function posicionarIndicador() {
        const activa = document.querySelector('.pestana-historial.activa');
        if (activa && indicador && !esMobile()) {
            const rect = activa.getBoundingClientRect();
            const contRect = contenedorPestanas.getBoundingClientRect();
            indicador.style.width = `${rect.width}px`;
            indicador.style.left = `${rect.left - contRect.left}px`;
        }
    }

    // ==========================================
    // 6. FUNCIONES DE MODALES
    // ==========================================
    function abrirModal(modal) {
        if (modal) {
            modal.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function cerrarModal(modal) {
        if (modal) {
            modal.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }

    // ==========================================
    // 7. EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        pestanas.forEach(pestana => {
            pestana.addEventListener('click', function() {
                pestanas.forEach(p => p.classList.remove('activa'));
                this.classList.add('activa');
                posicionarIndicador();
                aplicarFiltros();
            });
        });

        if(inputBuscar) inputBuscar.addEventListener('input', aplicarFiltros);
        if(filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);

        if(btnOrdenarFecha) btnOrdenarFecha.addEventListener('click', () => {
            ordenAscendente = !ordenAscendente;
            historialFiltrado.sort((a, b) => {
                return ordenAscendente ? a.fechaHora - b.fechaHora : b.fechaHora - a.fechaHora;
            });
            renderizarTabla();
            btnOrdenarFecha.style.transform = ordenAscendente ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        if (btnExportar) btnExportar.addEventListener('click', () => {
            if(historialFiltrado.length === 0) return alert("No hay datos para exportar");
            abrirModal(modalExportar);
        });
        if (btnCancelarExportar) btnCancelarExportar.onclick = () => cerrarModal(modalExportar);
        if (btnConfirmarExportar) btnConfirmarExportar.onclick = () => {
            exportarExcel();
            cerrarModal(modalExportar);
        };

        // ===== EVENT LISTENERS FILTROS GRÁFICAS =====
        if (filtroTipoGrafica) {
            filtroTipoGrafica.addEventListener('change', () => {
                const tipo = filtroTipoGrafica.value;
                
                // Mostrar/ocultar filtros según la selección
                if (tipo === 'mes') {
                    if (filtroMesGrafica) filtroMesGrafica.parentElement.style.display = 'flex';
                    if (filtroAnioGrafica) filtroAnioGrafica.parentElement.style.display = 'flex';
                } else if (tipo === 'anio') {
                    if (filtroMesGrafica) filtroMesGrafica.parentElement.style.display = 'none';
                    if (filtroAnioGrafica) filtroAnioGrafica.parentElement.style.display = 'flex';
                }
                
                renderizarGraficas();
            });
        }

        if (filtroMesGrafica) {
            filtroMesGrafica.addEventListener('change', renderizarGraficas);
        }

        if (filtroAnioGrafica) {
            filtroAnioGrafica.addEventListener('change', renderizarGraficas);
        }

        if (btnResetearFiltros) {
            btnResetearFiltros.addEventListener('click', (e) => {
                e.preventDefault();
                if (filtroTipoGrafica) filtroTipoGrafica.value = 'mes';
                if (filtroMesGrafica) filtroMesGrafica.value = new Date().getMonth();
                if (filtroAnioGrafica) filtroAnioGrafica.value = new Date().getFullYear();
                if (filtroMesGrafica) filtroMesGrafica.parentElement.style.display = 'flex';
                if (filtroAnioGrafica) filtroAnioGrafica.parentElement.style.display = 'flex';
                renderizarGraficas();
            });
        }

        window.onclick = (e) => {
            if (e.target.classList.contains('modal-overlay')) cerrarModal(e.target);
        };

        setupMenuYLogout();
    }

    // ==========================================
    // 8. MENÚ Y LOGOUT
    // ==========================================
    function setupMenuYLogout() {
        if(botonMenu) {
            botonMenu.addEventListener('click', () => {
                menuLateral.classList.toggle('abierto');
                overlayMenu.classList.toggle('activo');
            });
        }

        if(overlayMenu) {
            overlayMenu.addEventListener('click', () => {
                menuLateral.classList.remove('abierto');
                overlayMenu.classList.remove('activo');
            });
        }

        if (btnLogout) {
            btnLogout.addEventListener('click', function(e) {
                e.preventDefault();
                abrirModal(modalLogout);
            });
        }
        
        if (btnLogoutVolver) {
            btnLogoutVolver.addEventListener('click', () => cerrarModal(modalLogout));
        }
        
        if (btnLogoutConfirmar) {
            btnLogoutConfirmar.addEventListener('click', function() {
                localStorage.removeItem('token');
                localStorage.removeItem('usuarioId');
                localStorage.removeItem('usuarioRol');
                window.location.href = '../paginas/Rol_Usuario.html';
            });
        }
        
        if (modalLogout) {
            modalLogout.addEventListener('click', function(e) {
                if (e.target === modalLogout) {
                    cerrarModal(modalLogout);
                }
            });
        }
    }

    function esMobile() { 
        return window.innerWidth <= 768; 
    }

    // ===== TECLA ESC PARA CERRAR MODALES =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                menuLateral.classList.remove('abierto');
                overlayMenu.classList.remove('activo');
            }
            if (modalLogout && modalLogout.classList.contains('activo')) {
                cerrarModal(modalLogout);
            }
            if (modalExportar && modalExportar.classList.contains('activo')) {
                cerrarModal(modalExportar);
            }
        }
    });

    window.addEventListener('resize', () => { 
        if(!esMobile()) { 
            menuLateral.classList.remove('abierto'); 
            overlayMenu.classList.remove('activo'); 
        } 
        posicionarIndicador(); 
    });

    console.log('✅ Historial AFGCORPORACIÓN con filtros de gráficas cargado correctamente');
});