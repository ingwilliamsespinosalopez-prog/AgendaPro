document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN API ---
   const API_BASE_URL = 'http://localhost:7001';
    const token = localStorage.getItem('token');

    // --- ELEMENTOS DEL DOM ---
    const botonMenu = document.getElementById('boton-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const btnLogout = document.getElementById('logout-button');
    const tbodyPagos = document.getElementById('tbody-pagos');

    // Controles de tabla
    const inputBuscar = document.getElementById('input-buscar');
    const filtroEstadoPago = document.getElementById('filtro-estado-pago');
    const filtroServicio = document.getElementById('filtro-servicio');
    const btnExportar = document.getElementById('btn-exportar');

    // Tarjetas estadísticas
    const totalCobradoEl = document.getElementById('total-cobrado');
    const pagadasEl = document.getElementById('pagadas');
    const pendientesEl = document.getElementById('pendientes');
    const totalCitasEl = document.getElementById('total-citas');

    // Paginación
    const infoPaginacionEl = document.getElementById('info-paginacion');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const numerosPaginaEl = document.getElementById('numeros-pagina');

    // Modal Exportar
    const modalExportar = document.getElementById('modal-confirmar-exportar');
    const btnCancelarExportar = document.getElementById('btn-cancelar-exportar');
    const btnConfirmarExportar = document.getElementById('btn-confirmar-exportar');

    // Filtros de gráficas
    const filtroTipoGrafica = document.getElementById('filtro-tipo-grafica');
    const filtroMesGrafica = document.getElementById('filtro-mes-grafica');
    const filtroAnioGrafica = document.getElementById('filtro-anio-grafica');

    // Variables de estado
    let todosLosPagos = [];
    let pagosFiltrados = [];
    let paginaActual = 1;
    const filasPorPagina = 8;

    let chartFinanzas = null;
    let chartEstados = null;

    // Variables para filtros de gráficas
    let tipoFiltroGrafica = 'mes'; // 'mes' o 'anio'
    let mesSeleccionado = new Date().getMonth(); // Mes actual (0-11)
    let anioSeleccionado = new Date().getFullYear(); // Año actual

    // --- VALIDACIÓN SESIÓN ---
    if (!token) {
        alert("Sesión expirada");
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }

    // --- INICIALIZACIÓN ---
    Promise.all([cargarDatosDelBackend(), cargarServiciosFiltro()]);
    inicializarEventListeners();
    inicializarFiltrosGraficas();

    // -------------------------------------------------------
    // 0. INICIALIZAR FILTROS DE GRÁFICAS
    // -------------------------------------------------------
    function inicializarFiltrosGraficas() {
        // Llenar selector de años (últimos 5 años)
        const anioActual = new Date().getFullYear();
        for (let i = 0; i < 5; i++) {
            const anio = anioActual - i;
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            if (anio === anioActual) option.selected = true;
            filtroAnioGrafica.appendChild(option);
        }

        // Configurar eventos de filtros
        filtroTipoGrafica.addEventListener('change', cambiarTipoFiltroGrafica);
        filtroMesGrafica.addEventListener('change', () => {
            mesSeleccionado = parseInt(filtroMesGrafica.value);
            renderizarGraficas();
        });
        filtroAnioGrafica.addEventListener('change', () => {
            anioSeleccionado = parseInt(filtroAnioGrafica.value);
            renderizarGraficas();
        });

        // Mostrar/ocultar selector según tipo
        mostrarSelectorFiltroGrafica();
    }

    function cambiarTipoFiltroGrafica() {
        tipoFiltroGrafica = filtroTipoGrafica.value;
        mostrarSelectorFiltroGrafica();
        renderizarGraficas();
    }

    function mostrarSelectorFiltroGrafica() {
        if (tipoFiltroGrafica === 'mes') {
            filtroMesGrafica.style.display = 'block';
            filtroAnioGrafica.style.display = 'none';
        } else {
            filtroMesGrafica.style.display = 'none';
            filtroAnioGrafica.style.display = 'block';
        }
    }

    // -------------------------------------------------------
    // 1. CARGAR SERVICIOS PARA EL FILTRO
    // -------------------------------------------------------
    async function cargarServiciosFiltro() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/servicios`);
            if (response.ok) {
                const servicios = await response.json();
                filtroServicio.innerHTML = '<option value="todos">Todos los Servicios</option>';
                servicios.forEach(servicio => {
                    const option = document.createElement('option');
                    option.value = servicio.nombre;
                    option.textContent = servicio.nombre;
                    filtroServicio.appendChild(option);
                });
            }
        } catch (e) {
            console.error("Error cargando servicios para filtro:", e);
        }
    }

    // -------------------------------------------------------
    // 2. CARGAR DATOS DE PAGOS (FETCH)
    // -------------------------------------------------------
    async function cargarDatosDelBackend() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/pago/listar`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener pagos");

            const datos = await response.json();
            console.log("Pagos recibidos:", datos);

            todosLosPagos = datos;
            aplicarFiltrosYRenderizar();
            renderizarGraficas();

        } catch (error) {
            console.error(error);
            tbodyPagos.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
        }
    }

    // -------------------------------------------------------
    // 3. FILTROS Y RENDERIZADO
    // -------------------------------------------------------
    function aplicarFiltrosYRenderizar() {
        const termino = inputBuscar.value.toLowerCase();
        const estadoFiltro = filtroEstadoPago.value;
        const servicioFiltro = filtroServicio.value;

        pagosFiltrados = todosLosPagos.filter(pago => {
            let estadoReal = "Pendiente";
            if (pago.estadoPago === "COMPLETED") estadoReal = "Pagado";
            if (pago.estadoPago === "REFUNDED") estadoReal = "Reembolsado";

            const pasaEstado = (estadoFiltro === 'todos') || (estadoReal === estadoFiltro);
            const pasaServicio = (servicioFiltro === 'todos') ||
                (pago.servicioNombre && pago.servicioNombre === servicioFiltro);

            const textoBusqueda = `${pago.clienteNombre} ${pago.servicioNombre} ${pago.idCita} ${pago.paypalTransactionId}`.toLowerCase();
            const pasaBusqueda = (termino === '') || textoBusqueda.includes(termino);

            return pasaEstado && pasaBusqueda && pasaServicio;
        });

        actualizarEstadisticas();
        renderizarPaginacion();
        renderizarTabla();
    }

    function renderizarTabla() {
        tbodyPagos.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const datosPagina = pagosFiltrados.slice(inicio, fin);

        if (datosPagina.length === 0) {
            tbodyPagos.innerHTML = `<tr><td colspan="9" style="text-align: center;">No se encontraron registros.</td></tr>`;
            return;
        }

        datosPagina.forEach(pago => {
            const tr = document.createElement('tr');

            let claseEstado = 'pendiente';
            let textoEstado = 'Pendiente';
            let montoFormato = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(pago.monto);

            if (pago.estadoPago === 'COMPLETED') {
                claseEstado = 'pagado';
                textoEstado = 'Pagado';
            } else if (pago.estadoPago === 'REFUNDED') {
                claseEstado = 'cancelado';
                textoEstado = 'Reembolsado';
                montoFormato = `(${montoFormato})`;
            }

            tr.innerHTML = `
                <td>${pago.clienteNombre || 'Cliente Desconocido'}</td>
                <td>${pago.idCita}</td>
                <td>${pago.servicioNombre || 'General'}</td>
                <td>${pago.fechaCita}</td>
                <td>${pago.horaCita}</td>
                <td>${montoFormato}</td>
                <td>${pago.metodoPago || 'PayPal'}</td>
                <td><span class="badge-estado ${claseEstado}">${textoEstado}</span></td>
                <td>
                    <button class="btn-accion-ver" onclick="alert('ID Transacción: ${pago.paypalTransactionId}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        Ver
                    </button>
                </td>
            `;
            tbodyPagos.appendChild(tr);
        });
    }

    function actualizarEstadisticas() {
        let totalDinero = 0;
        let countPagadas = 0;
        let countReembolsadas = 0;
        let countPendientes = 0;

        todosLosPagos.forEach(p => {
            if (p.estadoPago === 'COMPLETED') {
                countPagadas++;
                totalDinero += parseFloat(p.monto);
            } else if (p.estadoPago === 'REFUNDED') {
                countReembolsadas++;
            } else {
                countPendientes++;
            }
        });

        totalCobradoEl.textContent = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalDinero);
        pagadasEl.textContent = countPagadas;
        totalCitasEl.textContent = todosLosPagos.length;
        pendientesEl.textContent = todosLosPagos.length - countPagadas;
    }

    // -------------------------------------------------------
    // 4. PAGINACIÓN Y EVENTOS
    // -------------------------------------------------------
    function renderizarPaginacion() {
        const totalPaginas = Math.ceil(pagosFiltrados.length / filasPorPagina) || 1;
        numerosPaginaEl.innerHTML = `<button class="btn-pagina activo">${paginaActual}</button>`;
        infoPaginacionEl.textContent = `Pagina ${paginaActual} de ${totalPaginas}`;
        btnAnterior.disabled = paginaActual === 1;
        btnSiguiente.disabled = paginaActual >= totalPaginas;
    }

    function inicializarEventListeners() {
        // Menú
        if (botonMenu) botonMenu.addEventListener('click', () => {
            menuLateral.classList.toggle('abierto');
            overlayMenu.classList.toggle('activo');
        });
        if (overlayMenu) overlayMenu.addEventListener('click', () => {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
        });

        // Logout
        const modalLogout = document.getElementById('modal-logout');
        const btnLogoutVolver = document.getElementById('btn-logout-volver');
        const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');

        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                modalLogout.classList.add('activo');
            });
        }

        if (btnLogoutVolver) {
            btnLogoutVolver.addEventListener('click', () => {
                modalLogout.classList.remove('activo');
            });
        }

        if (btnLogoutConfirmar) {
            btnLogoutConfirmar.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '../paginas/Rol_Usuario.html';
            });
        }

        if (modalLogout) {
            modalLogout.addEventListener('click', function(e) {
                if (e.target === modalLogout) {
                    modalLogout.classList.remove('activo');
                }
            });
        }

        // Filtros
        inputBuscar.addEventListener('input', () => { paginaActual = 1; aplicarFiltrosYRenderizar(); });
        filtroEstadoPago.addEventListener('change', () => { paginaActual = 1; aplicarFiltrosYRenderizar(); });
        filtroServicio.addEventListener('change', () => { paginaActual = 1; aplicarFiltrosYRenderizar(); });

        // Paginación
        btnAnterior.addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; aplicarFiltrosYRenderizar(); } });
        btnSiguiente.addEventListener('click', () => {
            const total = Math.ceil(pagosFiltrados.length / filasPorPagina);
            if (paginaActual < total) { paginaActual++; aplicarFiltrosYRenderizar(); }
        });

        // Exportar Excel
        if (btnExportar) btnExportar.addEventListener('click', () => {
            if (pagosFiltrados.length === 0) return alert("Nada para exportar");
            if (modalExportar) modalExportar.classList.add('activo');
            else exportarExcel();
        });

        if (btnCancelarExportar) btnCancelarExportar.onclick = () => modalExportar.classList.remove('activo');
        if (btnConfirmarExportar) btnConfirmarExportar.onclick = () => {
            exportarExcel();
            modalExportar.classList.remove('activo');
        };
    }

    function exportarExcel() {
        const datosExcel = pagosFiltrados.map(p => ({
            "Cliente": p.clienteNombre,
            "Servicio": p.servicioNombre,
            "Fecha": p.fechaCita,
            "Monto": p.monto,
            "Estado": p.estadoPago === 'COMPLETED' ? 'Pagado' : (p.estadoPago === 'REFUNDED' ? 'Reembolsado' : 'Pendiente'),
            "ID Transacción": p.paypalTransactionId
        }));

        if (typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.json_to_sheet(datosExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Pagos");
            XLSX.writeFile(wb, "Reporte_Pagos.xlsx");
        } else {
            alert("Librería XLSX no cargada");
        }
    }

    // -------------------------------------------------------
    // 5. GRÁFICAS CON FILTROS
    // -------------------------------------------------------
    function renderizarGraficas() {
        if (todosLosPagos.length === 0) return;

        // Filtrar pagos según el tipo de filtro seleccionado
        let pagosFiltradosGrafica = todosLosPagos;

        if (tipoFiltroGrafica === 'mes') {
            // Filtrar por mes y año actual
            pagosFiltradosGrafica = todosLosPagos.filter(pago => {
                const fecha = new Date(pago.fechaCita);
                return fecha.getMonth() === mesSeleccionado && fecha.getFullYear() === anioSeleccionado;
            });
        } else {
            // Filtrar solo por año
            pagosFiltradosGrafica = todosLosPagos.filter(pago => {
                const fecha = new Date(pago.fechaCita);
                return fecha.getFullYear() === anioSeleccionado;
            });
        }

        renderizarGraficaFinanzas(pagosFiltradosGrafica);
        renderizarGraficaServicios(pagosFiltradosGrafica);
    }

    function renderizarGraficaFinanzas(pagos) {
        const mapFinanzas = new Map();
        const pagosOrdenados = [...pagos].sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));

        pagosOrdenados.forEach(p => {
            let fecha = p.fechaCita;
            
            // Si es por año, agrupar por mes
            if (tipoFiltroGrafica === 'anio') {
                const fechaObj = new Date(p.fechaCita);
                const nombreMes = fechaObj.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
                fecha = nombreMes;
            }

            if (!mapFinanzas.has(fecha)) {
                mapFinanzas.set(fecha, { ingresos: 0, reembolsos: 0 });
            }

            const datosDia = mapFinanzas.get(fecha);
            const monto = parseFloat(p.monto);

            if (p.estadoPago === 'COMPLETED') {
                datosDia.ingresos += monto;
            } else if (p.estadoPago === 'REFUNDED') {
                datosDia.reembolsos += monto;
            }
        });

        const labelsFechas = Array.from(mapFinanzas.keys());
        const dataIngresos = Array.from(mapFinanzas.values()).map(d => d.ingresos);
        const dataReembolsos = Array.from(mapFinanzas.values()).map(d => d.reembolsos);

        const ctxFinanzas = document.getElementById('grafica-finanzas').getContext('2d');
        if (chartFinanzas) chartFinanzas.destroy();

        chartFinanzas = new Chart(ctxFinanzas, {
            type: 'line',
            data: {
                labels: labelsFechas,
                datasets: [
                    {
                        label: 'Ingresos ($)',
                        data: dataIngresos,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4
                    },
                    {
                        label: 'Reembolsos ($)',
                        data: dataReembolsos,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderizarGraficaServicios(pagos) {
        const conteoServicios = {};

        pagos.forEach(p => {
            if (p.estadoPago === 'COMPLETED') {
                const nombreServicio = p.servicioNombre || 'Otros';
                if (conteoServicios[nombreServicio]) {
                    conteoServicios[nombreServicio]++;
                } else {
                    conteoServicios[nombreServicio] = 1;
                }
            }
        });

        const labelsServicios = Object.keys(conteoServicios);
        const dataServicios = Object.values(conteoServicios);

        const coloresServicios = [
            '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6'
        ];

        const canvasServicios = document.getElementById('grafica-servicios');

        if (canvasServicios) {
            const ctxServicios = canvasServicios.getContext('2d');
            if (chartEstados) chartEstados.destroy();

            chartEstados = new Chart(ctxServicios, {
                type: 'doughnut',
                data: {
                    labels: labelsServicios,
                    datasets: [{
                        data: dataServicios,
                        backgroundColor: coloresServicios.slice(0, labelsServicios.length),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' },
                        title: { display: false }
                    }
                }
            });
        }
    }

});