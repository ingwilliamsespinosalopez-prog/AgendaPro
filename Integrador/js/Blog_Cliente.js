document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CONSTANTES =====
    const STORAGE_KEY = 'afgcorporacion_blog';
    
    // ===== VARIABLES GLOBALES =====
    let publicaciones = [];
    
    // ===== ELEMENTOS DEL DOM =====
    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const gridPublicaciones = document.getElementById('grid-publicaciones');
    const modalPublicacion = document.getElementById('modal-publicacion');
    const cerrarModal = document.getElementById('cerrar-modal');
    const contenidoModal = document.getElementById('contenido-modal');
    const enlacesMenu = document.querySelectorAll('.item-menu');
    const logoutButton = document.getElementById('logout-button');
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    

    botonHamburguesa.addEventListener('click', () => {
        menuLateral.classList.add('activo');
        overlayMenu.classList.add('activo');
        botonHamburguesa.classList.add('activo');
    });

    overlayMenu.addEventListener('click', () => {
        menuLateral.classList.remove('activo');
        overlayMenu.classList.remove('activo');
        botonHamburguesa.classList.remove('activo');
    });

    // ===== FUNCIONES DE UTILIDAD =====
    function esMobile() {
        return window.innerWidth <= 768;
    }

    function formatearFecha(fecha) {
        const date = new Date(fecha + 'T00:00:00');
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-MX', opciones);
    }

    function obtenerPreview(contenido, maxLength) {
        if (contenido.length <= maxLength) {
            return contenido;
        }
        return contenido.substring(0, maxLength) + '...';
    }

    // ===== FUNCIONES DE MENÚ =====
    function abrirMenu() {
        if (menuLateral && overlayMenu && botonHamburguesa) {
            menuLateral.classList.add('abierto');
            overlayMenu.classList.add('activo');
            botonHamburguesa.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    function cerrarMenu() {
        if (menuLateral && overlayMenu && botonHamburguesa) {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
            botonHamburguesa.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }

    // ===== FUNCIONES DE MODALES =====
    function abrirModalPublicacion() {
        if (modalPublicacion) {
            modalPublicacion.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    function cerrarModalPublicacion() {
        if (modalPublicacion) {
            modalPublicacion.classList.remove('activo');
            document.body.style.overflow = '';
        }
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

    // ===== CARGAR PUBLICACIONES =====
    function cargarPublicaciones() {
        const publicacionesGuardadas = localStorage.getItem(STORAGE_KEY);
        if (publicacionesGuardadas) {
            publicaciones = JSON.parse(publicacionesGuardadas);
        } else {
            publicaciones = [];
        }
        renderizarPublicaciones();
    }

    // ===== RENDERIZAR PUBLICACIONES =====
    function renderizarPublicaciones() {
        if (!gridPublicaciones) return;
        
        gridPublicaciones.innerHTML = '';
        
        if (publicaciones.length === 0) {
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
        
        publicaciones.forEach(publicacion => {
            const tarjeta = crearTarjetaPublicacion(publicacion);
            gridPublicaciones.appendChild(tarjeta);
        });
    }

    // ===== CREAR TARJETA DE PUBLICACIÓN =====
    function crearTarjetaPublicacion(publicacion) {
        const article = document.createElement('article');
        article.className = 'tarjeta-publicacion' + (publicacion.destacado ? ' destacado' : '');
        
        const contenidoImagen = publicacion.imagen 
            ? `<img src="${publicacion.imagen}" alt="${publicacion.titulo}">`
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
        
        article.addEventListener('click', function() {
            mostrarDetallesPublicacion(publicacion);
        });
        
        return article;
    }

    // ===== MOSTRAR DETALLES DE PUBLICACIÓN =====
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

    // ===== ANIMACIONES =====
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

    // ===== EVENT LISTENERS - MENÚ HAMBURGUESA =====
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

    // ===== EVENT LISTENERS - MODAL PUBLICACIÓN =====
    if (cerrarModal) {
        cerrarModal.addEventListener('click', cerrarModalPublicacion);
    }

    if (modalPublicacion) {
        modalPublicacion.addEventListener('click', function(e) {
            if (e.target === modalPublicacion) {
                cerrarModalPublicacion();
            }
        });
    }

    // ===== EVENT LISTENERS - LOGOUT =====
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModalLogout();
        });
    }

    if (btnLogoutVolver) {
        btnLogoutVolver.addEventListener('click', cerrarModalLogout);
    }

    if (btnLogoutConfirmar) {
        btnLogoutConfirmar.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioId');
            localStorage.removeItem('afgcorporacion_cliente_perfil');
            localStorage.removeItem('afgcorporacion_asesorias_cliente');
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

    // ===== EVENT LISTENERS - TECLADO =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                cerrarMenu();
            }
            if (modalPublicacion && modalPublicacion.classList.contains('activo')) {
                cerrarModalPublicacion();
            }
            if (modalLogout && modalLogout.classList.contains('activo')) {
                cerrarModalLogout();
            }
        }
    });

    // ===== EVENT LISTENERS - RESIZE =====
    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });

    // ===== SINCRONIZACIÓN CON ADMIN =====
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            cargarPublicaciones();
            setTimeout(animarPublicaciones, 100);
        }
    });

    // ===== INICIALIZACIÓN =====
    cargarPublicaciones();
    setTimeout(animarPublicaciones, 100);
    
    console.log('✅ Blog Cliente AFGCORPORACIÓN cargado correctamente');
    console.log('📰 Publicaciones cargadas:', publicaciones.length);
});document.addEventListener('DOMContentLoaded', () => {
    
    // ===== CONFIGURACIÃ“N API =====
    const API_BASE_URL = 'http://100.31.17.110:7001';
    
    // ===== VARIABLES DE ESTADO =====
    let publicaciones = [];

    // ===== ELEMENTOS DEL DOM =====
    const gridPublicaciones = document.getElementById('grid-publicaciones');
    const inputBuscar = document.getElementById('input-buscar');
    
    // MenÃº y Logout
    const botonMenu = document.getElementById('boton-hamburguesa'); // Ajusta ID si es necesario
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const btnLogout = document.getElementById('logout-button');

    // ===== INICIALIZACIÃ“N =====
    init();

    function init() {
        setupEventListeners();
        cargarPublicaciones();
    }

    // ==========================================
    // 1. CARGAR DATOS
    // ==========================================
    async function cargarPublicaciones() {
        try {
            const response = await fetch(`${API_BASE_URL}/blog/listar`);
            if (!response.ok) throw new Error("Error al cargar el blog");

            const data = await response.json();
            
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
            
            renderizarPublicaciones(publicaciones);
        } catch (error) {
            console.error(error);
            if(gridPublicaciones) 
                gridPublicaciones.innerHTML = `<p style="text-align:center; color:red;">No se pudieron cargar las noticias.</p>`;
        }
    }

    // ==========================================
    // 2. RENDERIZADO
    // ==========================================
    function renderizarPublicaciones(lista) {
        if (!gridPublicaciones) return;
        gridPublicaciones.innerHTML = '';

        if (lista.length === 0) {
            gridPublicaciones.innerHTML = `<p style="text-align:center;">No hay publicaciones disponibles.</p>`;
            return;
        }

        lista.forEach(pub => {
            const tarjeta = document.createElement('article');
            tarjeta.className = 'tarjeta-publicacion' + (pub.destacado ? ' destacado' : '');
            
            const contenidoImagen = pub.imagen 
                ? `<img src="${pub.imagen}" alt="${pub.titulo}" loading="lazy">`
                : `<div style="height:100%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; color:#9ca3af;">ðŸ“·</div>`;
            
            const fechaFormateada = formatearFechaParaMostrar(pub.fecha);
            const preview = pub.contenido.length > 120 ? pub.contenido.substring(0, 120) + '...' : pub.contenido;
            
            tarjeta.innerHTML = `
                ${pub.destacado ? '<span class="etiqueta-destacado-tarjeta">â­ Destacada</span>' : ''}
                
                <div class="imagen-publicacion">
                    ${contenidoImagen}
                </div>
                <div class="contenido-publicacion">
                    <span class="etiqueta-categoria">${pub.categoria}</span>
                    <h3 class="titulo-publicacion">${pub.titulo}</h3>
                    <p class="preview-contenido">${preview}</p>
                    <div class="info-meta-publicacion">
                        <span>ðŸ“… ${fechaFormateada}</span>
                    </div>
                </div>
            `;
            
            // CLICK: Mostrar Detalles
            tarjeta.addEventListener('click', () => {
                mostrarDetallesPublicacion(pub);
            });
            
            gridPublicaciones.appendChild(tarjeta);
        });
    }

    // ==========================================
    // 3. DETALLES (MODAL)
    // ==========================================
    function mostrarDetallesPublicacion(pub) {
        const modal = document.getElementById('modal-detalles-publicacion');
        const contenido = modal ? modal.querySelector('.contenido-modal-detalles') : null;
        
        if (!modal || !contenido) {
            console.error("No se encontrÃ³ el modal de detalles en el HTML");
            return;
        }
        
        const fechaFormateada = formatearFechaParaMostrar(pub.fecha);
        
        const contenidoImagen = pub.imagen 
            ? `<img src="${pub.imagen}" alt="${pub.titulo}" style="width:100%; height:100%; object-fit:cover;">`
            : `<div style="height:100%; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">Sin imagen</div>`;
        
        const contenidoFormateado = pub.contenido.replace(/\n/g, '<br>');
        
        contenido.innerHTML = `
            <div class="header-detalle-publicacion" style="height:300px; overflow:hidden; border-radius:12px 12px 0 0; position:relative;">
                ${contenidoImagen}
            </div>
            <div class="cuerpo-detalle-publicacion" style="padding:30px;">
                <div class="etiquetas-superior" style="margin-bottom:15px;">
                    <span class="etiqueta-categoria" style="background:#e0f2fe; color:#0284c7; padding:4px 12px; border-radius:20px; font-size:0.85rem; font-weight:600; display:inline-block;">${pub.categoria}</span>
                    ${pub.destacado ? '<span class="etiqueta-destacado-tarjeta" style="margin-left:10px; font-size:0.85rem;">â­ Destacada</span>' : ''}
                </div>
                
                <h2 class="titulo-detalle-publicacion" style="font-size:1.8rem; color:#111827; margin-bottom:10px; font-weight:700;">${pub.titulo}</h2>
                
                <div class="info-fecha-detalle" style="color:#6b7280; margin-bottom:20px; font-size:0.9rem;">
                    <span>ðŸ“… ${fechaFormateada}</span>
                </div>
                
                <div class="contenido-completo-publicacion" style="line-height:1.8; color:#374151; font-size:1rem;">
                    ${contenidoFormateado}
                </div>
            </div>
        `;
        
        // Listener para el botÃ³n de cerrar flotante que acabamos de crear
        setTimeout(() => {
            const btnCerrar = document.getElementById('btn-cerrar-flotante');
            if(btnCerrar) btnCerrar.onclick = () => cerrarModal(modal);
        }, 0);

        abrirModal(modal);
    }

    // ==========================================
    // 4. HELPERS Y LISTENERS
    // ==========================================
    function setupEventListeners() {
        // Buscador
        if(inputBuscar) {
            inputBuscar.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = publicaciones.filter(p => p.titulo.toLowerCase().includes(term));
                renderizarPublicaciones(filtered);
            });
        }

        
        const cerrarBtn = document.getElementById('cerrar-modal-detalles');
        if(cerrarBtn) {
            cerrarBtn.addEventListener('click', () => cerrarModal(document.getElementById('modal-detalles-publicacion')));
        }

        // Clic fuera
        window.onclick = (e) => {
            if (e.target.classList.contains('modal-overlay')) cerrarModal(e.target);
        };

        // MenÃº
        if (botonMenu) {
            botonMenu.addEventListener('click', () => {
                menuLateral.classList.toggle('abierto');
                overlayMenu.classList.toggle('activo');
                botonMenu.classList.toggle('activo');
            });
        }
        if (overlayMenu) {
            overlayMenu.addEventListener('click', () => {
                menuLateral.classList.remove('abierto');
                overlayMenu.classList.remove('activo');
                if(botonMenu) botonMenu.classList.remove('activo');
            });
        }
        
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Â¿Cerrar sesiÃ³n?")) {
                    localStorage.clear();
                    window.location.href = '../paginas/Rol_Usuario.html';
                }
            });
        }
    }

    // Utilidades
    function formatearFechaParaMostrar(fechaInput) {
        if (!fechaInput) return 'Sin fecha';
        let fechaObj;
        if (Array.isArray(fechaInput)) {
            fechaObj = new Date(fechaInput[0], fechaInput[1] - 1, fechaInput[2]);
        } else {
            fechaObj = new Date(fechaInput + (String(fechaInput).includes('T') ? '' : 'T00:00:00'));
        }
        if (isNaN(fechaObj.getTime())) return 'Fecha invÃ¡lida';
        return fechaObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function abrirModal(m) { if(m) { m.classList.add('activo'); document.body.style.overflow = 'hidden'; }}
    function cerrarModal(m) { if(m) { m.classList.remove('activo'); document.body.style.overflow = ''; }}
});