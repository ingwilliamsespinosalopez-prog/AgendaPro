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
    
    // Estadísticas
    const totalClientes = document.getElementById('total-clientes');
    const citasHoy = document.getElementById('citas-hoy');
    const documentos = document.getElementById('documentos');
    const ingresos = document.getElementById('ingresos');
    
    // Listas
    const listaActividad = document.getElementById('lista-actividad');
    const listaCitas = document.getElementById('lista-citas');
    
    // Logout
    const btnLogout = document.getElementById('logout-button');
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    
    // ===== ESTADO =====
    let misCitas = [];
    
    // ===== INICIALIZACIÓN =====
    await cargarDatosDashboard();
    setupEventListeners();
    setTimeout(animarTarjetas, 100);
    
    // ==========================================
    // 1. CARGAR DATOS (BACKEND)
    // ==========================================
    async function cargarDatosDashboard() {
        try {
            console.log("Cargando datos del dashboard para asesor ID:", usuarioId);

            const response = await fetch(`${API_BASE_URL}/cita/asesor/${usuarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error("Error al cargar citas del asesor");
            
            misCitas = await response.json();

            console.log("Citas cargadas:", misCitas);

            actualizarEstadisticas();
            renderizarProximasCitas();
            renderizarActividadReciente();

        } catch (error) {
            console.error("Error:", error);
            if(listaCitas) listaCitas.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error de conexión</p>`;
            if(listaActividad) listaActividad.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error de conexión</p>`;
        }
    }

    // ==========================================
    // 2. LÓGICA DE ESTADÍSTICAS
    // ==========================================
    function actualizarEstadisticas() {
        const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // A. Citas Hoy (Pendientes o Confirmadas para hoy)
        const citasDeHoy = misCitas.filter(c => 
            (c.fecha === hoy) && 
            (c.estado === 'Pendiente' || c.estado === 'Confirmada')
        ).length;
        
        animarNumero(citasHoy, citasDeHoy);

        // B. Total Clientes (Clientes únicos atendidos)
        const clientesUnicos = new Set(misCitas.map(c => c.clienteNombre)).size;
        animarNumero(totalClientes, clientesUnicos);

        // C. Documentos procesados (simulación basada en citas completadas)
        const completadas = misCitas.filter(c => c.estado === 'Completada').length;
        animarNumero(documentos, completadas);

        // D. Ingresos estimados (basado en citas completadas)
        // Simulamos $500 por cita completada
        const ingresosEstimados = completadas * 500; 
        
        if(ingresos) {
            // Animación especial para ingresos
            animarNumero(ingresos, completadas);
        }
    }

    // ==========================================
    // 3. RENDERIZAR PRÓXIMAS CITAS
    // ==========================================
    function renderizarProximasCitas() {
        if (!listaCitas) return;
        
        listaCitas.innerHTML = '';

        const hoy = new Date().toISOString().split('T')[0];
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        const mananaTxt = manana.toISOString().split('T')[0];

        // Filtramos pendientes/confirmadas desde hoy en adelante
        const futuras = misCitas
            .filter(c => (c.estado === 'Pendiente' || c.estado === 'Confirmada') && c.fecha >= hoy)
            .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`))
            .slice(0, 3); // Top 3

        if (futuras.length === 0) {
            listaCitas.innerHTML = `
                <div class="item-cita" style="justify-content:center; color:#888; padding: 30px;">
                    <p>📅 No tienes citas próximas</p>
                </div>`;
            return;
        }

        futuras.forEach((cita, index) => {
            const item = crearItemCita(cita, hoy, mananaTxt);
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            listaCitas.appendChild(item);
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    function crearItemCita(cita, hoy, manana) {
        const div = document.createElement('div');
        div.className = 'item-cita';
        
        let textoEtiqueta = formatearFechaDiaMes(cita.fecha);
        let claseEtiqueta = 'etiqueta-manana';
        
        if (cita.fecha === hoy) {
            textoEtiqueta = 'Hoy';
            claseEtiqueta = 'etiqueta-hoy';
        } else if (cita.fecha === manana) {
            textoEtiqueta = 'Mañana';
            claseEtiqueta = 'etiqueta-manana';
        }
        
        div.innerHTML = `
            <div class="info-cita">
                <p class="nombre-cliente">${cita.clienteNombre || 'Cliente'}</p>
                <p class="tipo-cita">${cita.servicioNombre || 'Servicio'}</p>
                <p class="hora-cita">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${cita.hora}
                </p>
            </div>
            <span class="etiqueta-cita ${claseEtiqueta}">${textoEtiqueta}</span>
        `;
        
        return div;
    }

    // ==========================================
    // 4. RENDERIZAR ACTIVIDAD RECIENTE
    // ==========================================
    function renderizarActividadReciente() {
        if (!listaActividad) return;
        
        listaActividad.innerHTML = '';

        // Usamos las últimas citas ordenadas por fecha
        const recientes = [...misCitas]
            .sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`))
            .slice(0, 4);

        if (recientes.length === 0) {
            listaActividad.innerHTML = `
                <p style="text-align:center; padding:20px; color:#888">
                    📊 Sin actividad reciente
                </p>`;
            return;
        }

        recientes.forEach((cita, index) => {
            const item = crearItemActividad(cita);
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            listaActividad.appendChild(item);
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    function crearItemActividad(cita) {
        const div = document.createElement('div');
        div.className = 'item-actividad';
        
        let color = 'azul';
        let texto = 'Cita agendada';
        
        if (cita.estado === 'Completada') { 
            color = 'verde'; 
            texto = 'Asesoría finalizada'; 
        }
        if (cita.estado === 'Cancelada') { 
            color = 'naranja'; 
            texto = 'Cita cancelada'; 
        }
        if (cita.estado === 'Confirmada') { 
            color = 'morado'; 
            texto = 'Cita confirmada'; 
        }
        if (cita.estado === 'Pendiente') { 
            color = 'azul'; 
            texto = 'Cita pendiente'; 
        }
        
        div.innerHTML = `
            <div class="indicador-actividad indicador-${color}"></div>
            <div class="contenido-actividad">
                <p class="titulo-actividad">${texto}</p>
                <p class="subtitulo-actividad">${cita.clienteNombre || 'Cliente'}</p>
            </div>
            <span class="tiempo-actividad">${formatearFechaDiaMes(cita.fecha)}</span>
        `;
        
        return div;
    }
    
    // ==========================================
    // 5. UTILS
    // ==========================================
    function animarNumero(elemento, valorFinal) {
        if (!elemento) return;
        
        const duracion = 1000;
        const pasos = 30;
        const intervalo = duracion / pasos;
        const incremento = valorFinal / pasos;
        let valorActual = 0;
        
        if (valorFinal === 0) { 
            elemento.textContent = "0"; 
            return; 
        }
        
        const timer = setInterval(() => {
            valorActual += incremento;
            if (valorActual >= valorFinal) {
                elemento.textContent = valorFinal;
                clearInterval(timer);
            } else {
                elemento.textContent = Math.floor(valorActual);
            }
        }, intervalo);
    }

    function formatearFechaDiaMes(fechaISO) {
        if (!fechaISO) return "";
        const [y, m, d] = fechaISO.split('-');
        return `${d}/${m}`;
    }
    
    function animarTarjetas() {
        const tarjetas = document.querySelectorAll('.tarjeta-estadistica');
        tarjetas.forEach((tarjeta, index) => {
            tarjeta.style.opacity = '0';
            tarjeta.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                tarjeta.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                tarjeta.style.opacity = '1';
                tarjeta.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
    
    // ==========================================
    // 6. EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        // Menú Hamburguesa
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
        
        // Logout
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
        
        // Tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                    cerrarMenu();
                }
                if (modalLogout && modalLogout.classList.contains('activo')) {
                    cerrarModalLogout();
                }
            }
        });
        
        window.addEventListener('resize', function() {
            if (!esMobile()) {
                cerrarMenu();
            }
        });
        
        // Cerrar modal al hacer clic fuera
        if (modalLogout) {
            modalLogout.addEventListener('click', function(e) {
                if (e.target === modalLogout) {
                    cerrarModalLogout();
                }
            });
        }
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
    
    // ===== MODALES LOGOUT =====
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
    
    // ===== ACTUALIZACIÓN PERIÓDICA =====
    setInterval(async () => {
        console.log('Actualizando dashboard...');
        await cargarDatosDashboard();
    }, 300000); // 5 minutos
    
    console.log('✅ Dashboard Asesor AFGCORPORACIÓN cargado correctamente con Backend');
});