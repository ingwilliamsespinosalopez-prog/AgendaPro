document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const STORAGE_KEY = 'afgcorporacion_blog'; // Mantener por compatibilidad
    
    // Variables
    let publicaciones = [];
    
    // Elementos del DOM
    const botonMenu = document.getElementById('boton-menu');
    const navbarMenu = document.getElementById('navbar-menu');
    const overlayMenu = document.getElementById('overlay-menu');
    const gridPublicaciones = document.getElementById('grid-publicaciones');
    const modalPublicacion = document.getElementById('modal-publicacion');
    const cerrarModal = document.getElementById('cerrar-modal');
    const contenidoModal = document.getElementById('contenido-modal');
    const enlacesNav = document.querySelectorAll('.nav-link');
    const inputBuscar = document.getElementById('input-buscar');

    // ===== MENÚ HAMBURGUESA =====
    function esMobile() {
        return window.innerWidth <= 768;
    }

    function abrirMenu() {
        if (esMobile()) {
            navbarMenu.classList.add('abierto');
            overlayMenu.classList.add('activo');
            botonMenu.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    function cerrarMenu() {
        navbarMenu.classList.remove('abierto');
        overlayMenu.classList.remove('activo');
        botonMenu.classList.remove('activo');
        document.body.style.overflow = '';
    }

    if (botonMenu) {
        botonMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navbarMenu.classList.contains('abierto')) {
                cerrarMenu();
            } else {
                abrirMenu();
            }
        });
    }

    if (overlayMenu) {
        overlayMenu.addEventListener('click', cerrarMenu);
    }

    enlacesNav.forEach(enlace => {
        enlace.addEventListener('click', function() {
            if (esMobile()) {
                cerrarMenu();
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbarMenu.classList.contains('abierto') && esMobile()) {
            cerrarMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });

    // ===== CARGAR PUBLICACIONES DESDE API =====
    async function cargarPublicaciones() {
        try {
            // Mostrar indicador de carga
            if (gridPublicaciones) {
                gridPublicaciones.innerHTML = `
                    <div class="mensaje-vacio">
                        <p>⏳ Cargando publicaciones...</p>
                    </div>
                `;
            }

            const response = await fetch(`${API_BASE_URL}/blog/listar`);
            
            if (!response.ok) {
                throw new Error(`Error al cargar el blog: ${response.status}`);
            }

            const data = await response.json();
            
            // Mapear los datos de la API al formato esperado
            publicaciones = data.map(p => ({
                id: p.idBlog,
                titulo: p.titulo,
                contenido: p.contenido,
                categoria: p.categoria,
                fecha: p.fechaPublicacion,
                destacado: p.destacado,
                imagen: p.img ? (p.img.startsWith('http') ? p.img : `${API_BASE_URL}${p.img}`) : null,
                fechaCreacion: p.fechaPublicacion
            }));
            
            // Guardar en localStorage como respaldo
            localStorage.setItem(STORAGE_KEY, JSON.stringify(publicaciones));
            
            renderizarPublicaciones(publicaciones);
            console.log('✅ Publicaciones cargadas desde API:', publicaciones.length);
            
        } catch (error) {
            console.error('❌ Error al cargar publicaciones:', error);
            
            // Intentar cargar desde localStorage como fallback
            const publicacionesGuardadas = localStorage.getItem(STORAGE_KEY);
            if (publicacionesGuardadas) {
                publicaciones = JSON.parse(publicacionesGuardadas);
                renderizarPublicaciones(publicaciones);
                console.log('⚠️ Publicaciones cargadas desde localStorage (fallback)');
            } else {
                mostrarErrorCarga();
            }
        }
    }

    // ===== MOSTRAR ERROR DE CARGA =====
    function mostrarErrorCarga() {
        if (gridPublicaciones) {
            gridPublicaciones.innerHTML = `
                <div class="mensaje-vacio">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p style="color: #ef4444;">❌ Error al cargar las publicaciones</p>
                    <p class="texto-secundario">Por favor, intenta recargar la página</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Recargar página
                    </button>
                </div>
            `;
        }
    }

    // ===== RENDERIZAR PUBLICACIONES =====
    function renderizarPublicaciones(lista) {
        if (!gridPublicaciones) return;
        
        gridPublicaciones.innerHTML = '';
        
        if (lista.length === 0) {
            gridPublicaciones.innerHTML = `
                <div class="mensaje-vacio">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <p>📄 No hay publicaciones disponibles</p>
                    <p class="texto-secundario">Próximamente agregaremos nuevos artículos</p>
                </div>
            `;
            return;
        }
        
        lista.forEach(publicacion => {
            const tarjeta = crearTarjetaPublicacion(publicacion);
            gridPublicaciones.appendChild(tarjeta);
        });

        // Animar después de renderizar
        setTimeout(animarPublicaciones, 100);
    }

    // ===== CREAR TARJETA DE PUBLICACIÓN =====
    function crearTarjetaPublicacion(publicacion) {
        const article = document.createElement('article');
        article.className = 'tarjeta-publicacion' + (publicacion.destacado ? ' destacado' : '');
        
        const contenidoImagen = publicacion.imagen 
            ? `<img src="${publicacion.imagen}" alt="${publicacion.titulo}" loading="lazy">`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>`;
        
        const fechaFormateada = formatearFecha(publicacion.fecha);
        const preview = obtenerPreview(publicacion.contenido, 120);
        
        article.innerHTML = `
            ${publicacion.destacado ? '<span class="etiqueta-destacado-tarjeta">⭐ Destacada</span>' : ''}
            <div class="imagen-publicacion">
                ${contenidoImagen}
            </div>
            <div class="contenido-publicacion">
                <span class="etiqueta-categoria">${publicacion.categoria}</span>
                <h3 class="titulo-publicacion">${publicacion.titulo}</h3>
                <p class="preview-contenido">${preview}</p>
                <div class="info-meta-publicacion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${fechaFormateada}</span>
                </div>
            </div>
        `;
        
        // Event listener para abrir modal
        article.addEventListener('click', function() {
            mostrarDetallesPublicacion(publicacion);
        });
        
        return article;
    }

    // ===== OBTENER PREVIEW DEL CONTENIDO =====
    function obtenerPreview(contenido, maxLength) {
        if (contenido.length <= maxLength) {
            return contenido;
        }
        return contenido.substring(0, maxLength) + '...';
    }

    // ===== MOSTRAR DETALLES DE LA PUBLICACIÓN EN MODAL =====
    function mostrarDetallesPublicacion(publicacion) {
        if (!contenidoModal) return;
        
        const fechaFormateada = formatearFecha(publicacion.fecha);
        
        const contenidoImagen = publicacion.imagen 
            ? `<img src="${publicacion.imagen}" alt="${publicacion.titulo}">`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>`;
        
        // Formatear contenido con saltos de línea
        const contenidoFormateado = publicacion.contenido.split('\n').map(parrafo => {
            if (parrafo.trim()) {
                return `<p>${parrafo}</p>`;
            }
            return '';
        }).join('');
        
        contenidoModal.innerHTML = `
            <div class="header-detalle-publicacion">
                ${contenidoImagen}
            </div>
            <div class="cuerpo-detalle-publicacion">
                <div class="etiquetas-superior">
                    <span class="etiqueta-categoria">${publicacion.categoria}</span>
                    ${publicacion.destacado ? '<span class="etiqueta-destacado-tarjeta">⭐ Destacada</span>' : ''}
                </div>
                
                <h2 class="titulo-detalle-publicacion">${publicacion.titulo}</h2>
                
                <div class="info-fecha-detalle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${fechaFormateada}</span>
                </div>
                
                <div class="contenido-completo-publicacion">
                    ${contenidoFormateado}
                </div>
            </div>
        `;
        
        abrirModalPublicacion();
    }

    // ===== ABRIR MODAL =====
    function abrirModalPublicacion() {
        if (modalPublicacion) {
            modalPublicacion.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    // ===== CERRAR MODAL =====
    function cerrarModalPublicacion() {
        if (modalPublicacion) {
            modalPublicacion.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }

    // Event listener para cerrar modal
    if (cerrarModal) {
        cerrarModal.addEventListener('click', cerrarModalPublicacion);
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalPublicacion && modalPublicacion.classList.contains('activo')) {
            cerrarModalPublicacion();
        }
    });

    // Cerrar modal al hacer clic fuera
    if (modalPublicacion) {
        modalPublicacion.addEventListener('click', function(e) {
            if (e.target === modalPublicacion) {
                cerrarModalPublicacion();
            }
        });
    }

    // ===== FORMATEAR FECHA =====
    function formatearFecha(fechaInput) {
        if (!fechaInput) return 'Sin fecha';
        
        let fechaObj;
        
        // Si es un array [año, mes, día] de la API
        if (Array.isArray(fechaInput)) {
            fechaObj = new Date(fechaInput[0], fechaInput[1] - 1, fechaInput[2]);
        } else {
            // Si es una cadena de texto
            fechaObj = new Date(fechaInput + (String(fechaInput).includes('T') ? '' : 'T00:00:00'));
        }
        
        if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
        
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        return fechaObj.toLocaleDateString('es-MX', opciones);
    }

    // ===== ANIMACIONES DE ENTRADA =====
    function animarPublicaciones() {
        const tarjetas = document.querySelectorAll('.tarjeta-publicacion');
        tarjetas.forEach((tarjeta, index) => {
            tarjeta.style.opacity = '0';
            tarjeta.style.transform = 'translateY(30px)';
            setTimeout(() => {
                tarjeta.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                tarjeta.style.opacity = '1';
                tarjeta.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // ===== BUSCADOR =====
    if (inputBuscar) {
        inputBuscar.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase().trim();
            
            if (termino === '') {
                renderizarPublicaciones(publicaciones);
            } else {
                const filtradas = publicaciones.filter(pub => 
                    pub.titulo.toLowerCase().includes(termino) ||
                    pub.contenido.toLowerCase().includes(termino) ||
                    pub.categoria.toLowerCase().includes(termino)
                );
                renderizarPublicaciones(filtradas);
            }
        });
    }

    // ===== SINCRONIZACIÓN CON ADMIN (mantener por compatibilidad) =====
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            const publicacionesGuardadas = localStorage.getItem(STORAGE_KEY);
            if (publicacionesGuardadas) {
                publicaciones = JSON.parse(publicacionesGuardadas);
                renderizarPublicaciones(publicaciones);
            }
        }
    });

    // ===== RECARGAR PUBLICACIONES PERIÓDICAMENTE (OPCIONAL) =====
    // Recargar cada 5 minutos para mantener sincronizado
    setInterval(() => {
        console.log('🔄 Recargando publicaciones...');
        cargarPublicaciones();
    }, 5 * 60 * 1000); // 5 minutos

    // ===== INICIALIZAR =====
    cargarPublicaciones();
    
    console.log(' Blog Cliente inicializado correctamente');
});