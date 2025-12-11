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
    const listaAsesorias = document.getElementById('lista-asesorias');
    const btnLogout = document.getElementById('logout-button');
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    
    // Estadísticas
    const totalRealizadas = document.getElementById('total-realizadas');
    const totalClientes = document.getElementById('total-clientes');
    
    // ===== INICIALIZACIÓN =====
    await cargarAsesorias();
    setupEventListeners();
    
    // ===== 1. CARGAR ASESORÍAS (CONECTADO AL BACKEND) =====
    async function cargarAsesorias() {
        try {
            console.log("Cargando historial de asesorías para asesor ID:", usuarioId);

            const response = await fetch(`${API_BASE_URL}/cita/asesor/${usuarioId}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al cargar historial del asesor");

            const datos = await response.json();
            
            // FILTRO DE NEGOCIO:
            // Para el historial, generalmente queremos ver las "Completadas".
            const historial = datos.filter(c => c.estado === 'Completada');

            // Mapeamos los datos para que coincidan con lo que espera tu UI
            const asesoriasFormateadas = historial.map(c => ({
                id: c.idCita,
                tipo: c.servicioNombre || 'Servicio General',
                cliente: c.clienteNombre || 'Cliente Desconocido',
                fecha: formatearFecha(c.fecha),
                hora: c.hora || 'N/A',
                notas: c.notas || 'Sin notas adicionales',
                estado: c.estado
            }));

            renderizarAsesorias(asesoriasFormateadas);
            calcularEstadisticas(asesoriasFormateadas);

        } catch (error) {
            console.error("Error:", error);
            if(listaAsesorias) {
                listaAsesorias.innerHTML = `
                    <div class="mensaje-vacio">
                        <p style="text-align:center; color:red; padding:20px;">
                            Error al cargar historial: ${error.message}
                        </p>
                    </div>
                `;
            }
        }
    }
    
    // ===== 2. RENDERIZAR ASESORÍAS =====
    function renderizarAsesorias(asesorias) {
        if (!listaAsesorias) return;
        
        listaAsesorias.innerHTML = '';
        
        if (asesorias.length === 0) {
            listaAsesorias.innerHTML = `
                <div class="mensaje-vacio">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <p>📋 No hay asesorías completadas aún</p>
                    <p class="texto-secundario" style="font-size: 14px; color: #999; margin-top: 10px;">
                        Las asesorías completadas aparecerán aquí
                    </p>
                </div>
            `;
            return;
        }
        
        asesorias.forEach((asesoria, index) => {
            const tarjeta = crearTarjetaAsesoria(asesoria);
            // Estilos iniciales para animación
            tarjeta.style.opacity = '0';
            tarjeta.style.transform = 'translateY(20px)';
            listaAsesorias.appendChild(tarjeta);
            
            // Animación de entrada
            setTimeout(() => {
                tarjeta.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                tarjeta.style.opacity = '1';
                tarjeta.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // ===== 3. CREAR TARJETA (HTML) =====
    function crearTarjetaAsesoria(asesoria) {
        const div = document.createElement('div');
        div.className = 'tarjeta-asesoria';
        
        div.innerHTML = `
            <div class="encabezado-tarjeta">
                <h3 class="titulo-asesoria">${asesoria.tipo}</h3>
                <span class="badge-estado completada">${asesoria.estado}</span> 
            </div>
            
            <p class="descripcion-asesoria" style="margin-bottom:15px; color:#666;">
                ${asesoria.notas}
            </p>
            
            <div class="detalles-asesoria">
                <div class="detalle-item">
                    <svg class="icono-detalle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <div class="info-detalle">
                        <span class="label-detalle">Cliente</span>
                        <span class="valor-detalle">${asesoria.cliente}</span>
                    </div>
                </div>
                <div class="detalle-item">
                    <svg class="icono-detalle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <div class="info-detalle">
                        <span class="label-detalle">Fecha</span>
                        <span class="valor-detalle">${asesoria.fecha}</span>
                    </div>
                </div>
                <div class="detalle-item">
                    <svg class="icono-detalle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <div class="info-detalle">
                        <span class="label-detalle">Hora</span>
                        <span class="valor-detalle">${asesoria.hora}</span>
                    </div>
                </div>
            </div>
        `;
        return div;
    }
    
    // ===== 4. ESTADÍSTICAS =====
    function calcularEstadisticas(asesorias) {
        // Total de asesorías completadas
        const total = asesorias.length;
        
        // Clientes únicos
        const clientesUnicos = new Set(asesorias.map(a => a.cliente)).size;
        
        if (totalRealizadas) animarNumero(totalRealizadas, total);
        if (totalClientes) animarNumero(totalClientes, clientesUnicos);
    }
    
    function animarNumero(elemento, valorFinal) {
        const duracion = 1000;
        const pasos = 30;
        const intervalo = duracion / pasos;
        const incremento = valorFinal / pasos;
        let valorActual = 0;
        
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
    
    // ===== UTILS =====
    function formatearFecha(fechaISO) {
        if (!fechaISO) return "-";
        // Si viene YYYY-MM-DD
        const [y, m, d] = fechaISO.split('-');
        if(d && m && y) return `${d}/${m}/${y}`;
        return fechaISO;
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Menú Hamburguesa
        if (botonHamburguesa) {
            botonHamburguesa.addEventListener('click', function(e) {
                e.stopPropagation();
                menuLateral.classList.contains('abierto') ? cerrarMenu() : abrirMenu();
            });
        }
        
        if (overlayMenu) {
            overlayMenu.addEventListener('click', cerrarMenu);
        }
        
        enlacesMenu.forEach(enlace => {
            enlace.addEventListener('click', () => { 
                if (esMobile()) cerrarMenu(); 
            });
        });
        
        // Logout
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
        
        // Tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                    cerrarMenu();
                }
                if (modalLogout && modalLogout.classList.contains('activo')) {
                    cerrarModal(modalLogout);
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
                    cerrarModal(modalLogout);
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
    
    // ===== MODALES =====
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
    
    console.log('✅ Historial de Asesorías AFGCORPORACIÓN cargado correctamente con Backend');
});