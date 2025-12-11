document.addEventListener('DOMContentLoaded', async function() {
    
    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');

    // Verificar sesión
    if (!token || !usuarioId) {
        alert('No has iniciado sesión.');
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }

    // ===== VARIABLES GLOBALES =====
    let publicaciones = [];
    let publicacionEditando = null;
    let tarjetaAEliminar = null;
    let imagenSeleccionada = null;

    // ===== ELEMENTOS DEL DOM =====
    const gridPublicaciones = document.getElementById('grid-publicaciones');
    
    // Modales
    const modalCrearBlog = document.getElementById('modal-crear-blog');
    const modalConfirmarCancelar = document.getElementById('modal-confirmar-cancelar');
    const modalDatosCorrectos = document.getElementById('modal-datos-correctos');
    const modalConfirmarEliminar = document.getElementById('modal-confirmar-eliminar');
    const modalDetallesPublicacion = document.getElementById('modal-detalles-publicacion');
    
    const btnAgregarPublicacion = document.getElementById('btn-agregar-publicacion');
    const cerrarModalCrear = document.getElementById('cerrar-modal-crear');
    const btnCancelarCrear = document.getElementById('btn-cancelar-crear');
    const formCrearBlog = document.getElementById('form-crear-blog');
    
    const btnVolver = document.getElementById('btn-volver');
    const btnConfirmarCancelar = document.getElementById('btn-confirmar-cancelar');
    
    const btnRegresar = document.getElementById('btn-regresar');
    const btnConfirmarCrear = document.getElementById('btn-confirmar-crear');
    
    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    
    const cerrarModalDetalles = document.getElementById('cerrar-modal-detalles');

    // Imagen
    const inputImagen = document.getElementById('input-imagen');
    const areaSubirImagen = document.getElementById('area-subir-imagen');
    const previewImagen = document.getElementById('preview-imagen');
    const imagenPreview = document.getElementById('imagen-preview');
    const btnEliminarImagen = document.getElementById('btn-eliminar-imagen');

    // Filtros
    const inputBuscar = document.getElementById('input-buscar-blog');
    const filtroOrden = document.getElementById('filtro-orden');

    // ===== CARGAR PUBLICACIONES DESDE EL BACKEND =====
    async function cargarPublicaciones() {
        try {
            const response = await fetch(`${API_BASE_URL}/blog/listar`);

            if (!response.ok) throw new Error("Error al cargar el blog");

            const data = await response.json();

            // Mapear datos del backend a la estructura local
            publicaciones = data.map(p => ({
                id: p.idBlog,
                titulo: p.titulo,
                contenido: p.contenido,
                categoria: p.categoria,
                fecha: formatearFechaParaInput(p.fechaPublicacion),
                destacado: p.destacado,
                imagen: p.img ? (p.img.startsWith('http') ? p.img : `${API_BASE_URL}${p.img}`) : null,
                fechaCreacion: p.fechaPublicacion
            }));

            renderizarPublicaciones();
            actualizarEstadisticas();

        } catch (error) {
            console.error(error);
            mostrarNotificacion('Error al cargar publicaciones: ' + error.message);
        }
    }

    // ===== RENDERIZAR PUBLICACIONES (TU DISEÑO EXACTO) =====
    function renderizarPublicaciones() {
        const grid = gridPublicaciones;
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (publicaciones.length === 0) {
            grid.innerHTML = `
                <div class="tarjeta-vacia">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <p>No hay publicaciones en el blog</p>
                    <p class="texto-secundario">Haz clic en "Agregar Publicación" para crear una nueva</p>
                </div>
            `;
            return;
        }
        
        publicaciones.forEach(publicacion => {
            const tarjeta = crearTarjetaPublicacion(publicacion);
            grid.appendChild(tarjeta);
        });
    }

    // ===== CREAR TARJETA DE PUBLICACIÓN (TU DISEÑO) =====
    function crearTarjetaPublicacion(publicacion) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta-publicacion' + (publicacion.destacado ? ' destacado' : '');
        tarjeta.dataset.publicacionId = publicacion.id;
        
        const contenidoImagen = publicacion.imagen 
            ? `<img src="${publicacion.imagen}" alt="${publicacion.titulo}">`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>`;
        
        const fechaFormateada = formatearFecha(publicacion.fecha);
        const preview = obtenerPreview(publicacion.contenido, 120);
        
        tarjeta.innerHTML = `
            ${publicacion.destacado ? '<span class="etiqueta-destacado-tarjeta">⭐ Destacada</span>' : ''}
            <button class="boton-eliminar-publicacion" title="Eliminar publicación">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
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
        
        // Event listener para ver detalles
        tarjeta.addEventListener('click', function(e) {
            if (!e.target.closest('.boton-eliminar-publicacion')) {
                mostrarDetallesPublicacion(publicacion);
            }
        });
        
        // Event listener para eliminar
        const btnEliminar = tarjeta.querySelector('.boton-eliminar-publicacion');
        btnEliminar.addEventListener('click', function(e) {
            e.stopPropagation();
            tarjetaAEliminar = publicacion;
            abrirModal(modalConfirmarEliminar);
        });
        
        return tarjeta;
    }

    // ===== OBTENER PREVIEW DEL CONTENIDO =====
    function obtenerPreview(contenido, maxLength) {
        if (!contenido) return '';
        if (contenido.length <= maxLength) return contenido;
        return contenido.substring(0, maxLength) + '...';
    }

    // ===== MOSTRAR DETALLES DE LA PUBLICACIÓN =====
    function mostrarDetallesPublicacion(publicacion) {
        const contenido = document.querySelector('.contenido-modal-detalles');
        if (!contenido) return;
        
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
        
        contenido.innerHTML = `
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
                
                <div class="footer-detalle-publicacion">
                    <button class="boton-editar-publicacion" onclick="editarPublicacion(${publicacion.id})">Editar Publicación</button>
                </div>
            </div>
        `;
        
        abrirModal(modalDetallesPublicacion);
    }

    // ===== EDITAR PUBLICACIÓN =====
    window.editarPublicacion = function(publicacionId) {
        const publicacion = publicaciones.find(p => p.id === publicacionId);
        if (!publicacion) return;
        
        publicacionEditando = publicacion;
        
        // Llenar formulario
        document.getElementById('input-titulo').value = publicacion.titulo;
        document.getElementById('input-contenido').value = publicacion.contenido;
        document.getElementById('input-categoria').value = publicacion.categoria;
        document.getElementById('input-fecha').value = publicacion.fecha;
        document.getElementById('input-destacado').checked = publicacion.destacado;
        
        if (publicacion.imagen) {
            imagenSeleccionada = publicacion.imagen;
            imagenPreview.src = publicacion.imagen;
            areaSubirImagen.querySelector('.label-subir-imagen').style.display = 'none';
            previewImagen.style.display = 'block';
        }
        
        cerrarModal(modalDetallesPublicacion);
        abrirModal(modalCrearBlog);
    };

    // ===== SUBMIT DEL FORMULARIO =====
    if (formCrearBlog) {
        formCrearBlog.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titulo = document.getElementById('input-titulo').value.trim();
            const contenido = document.getElementById('input-contenido').value.trim();
            const categoria = document.getElementById('input-categoria').value;
            const fecha = document.getElementById('input-fecha').value;
            
            if (!titulo || !contenido || !categoria || !fecha) {
                alert('Por favor completa todos los campos obligatorios');
                return;
            }
            
            abrirModal(modalDatosCorrectos);
        });
    }

    // ===== CONFIRMAR CREACIÓN/EDICIÓN =====
    if (btnConfirmarCrear) {
        btnConfirmarCrear.addEventListener('click', async function() {
            const btnSubmit = this;
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Guardando...";

            try {
                const formData = new FormData();
                formData.append('titulo', document.getElementById('input-titulo').value.trim());
                formData.append('contenido', document.getElementById('input-contenido').value.trim());
                formData.append('categoria', document.getElementById('input-categoria').value);
                formData.append('fechaPublicacion', document.getElementById('input-fecha').value);
                formData.append('destacado', document.getElementById('input-destacado').checked);

                // Solo agregar imagen si se seleccionó una nueva
                if (inputImagen.files[0]) {
                    formData.append('imagen', inputImagen.files[0]);
                }

                let url = `${API_BASE_URL}/admin/blog/crear`;
                let method = 'POST';

                if (publicacionEditando) {
                    url = `${API_BASE_URL}/admin/blog/editar/${publicacionEditando.id}`;
                    method = 'PUT';
                }

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    mostrarNotificacion(publicacionEditando ? 'Publicación actualizada correctamente' : 'Publicación creada correctamente');
                    cerrarModal(modalDatosCorrectos);
                    cerrarModal(modalCrearBlog);
                    limpiarFormulario();
                    await cargarPublicaciones();
                } else {
                    throw new Error("Error en la operación");
                }
            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Aceptar";
            }
        });
    }

    // ===== ELIMINAR PUBLICACIÓN =====
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', async function() {
            if (!tarjetaAEliminar) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/admin/blog/eliminar/${tarjetaAEliminar.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    mostrarNotificacion('Publicación eliminada correctamente');
                    cerrarModal(modalConfirmarEliminar);
                    tarjetaAEliminar = null;
                    await cargarPublicaciones();
                } else {
                    throw new Error("No se pudo eliminar");
                }
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }

    // ===== LIMPIAR FORMULARIO =====
    function limpiarFormulario() {
        if (formCrearBlog) {
            formCrearBlog.reset();
            if (btnEliminarImagen) {
                btnEliminarImagen.click();
            }
            imagenSeleccionada = null;
            publicacionEditando = null;
        }
    }

    // ===== SUBIR IMAGEN =====
    if (inputImagen) {
        inputImagen.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagenPreview.src = event.target.result;
                    imagenSeleccionada = event.target.result;
                    areaSubirImagen.querySelector('.label-subir-imagen').style.display = 'none';
                    previewImagen.style.display = 'block';
                };
                reader.readAsDataURL(archivo);
            }
        });
    }

    if (btnEliminarImagen) {
        btnEliminarImagen.addEventListener('click', function() {
            inputImagen.value = '';
            imagenSeleccionada = null;
            imagenPreview.src = '';
            previewImagen.style.display = 'none';
            areaSubirImagen.querySelector('.label-subir-imagen').style.display = 'flex';
        });
    }

    // ===== ACTUALIZAR ESTADÍSTICAS =====
    function actualizarEstadisticas() {
        const total = document.getElementById('total-publicaciones');
        const destacados = document.getElementById('total-destacados');
        const categorias = document.getElementById('total-categorias');
        
        if (total) total.textContent = publicaciones.length;
        if (destacados) destacados.textContent = publicaciones.filter(p => p.destacado).length;
        if (categorias) {
            const categoriasUnicas = new Set(publicaciones.map(p => p.categoria));
            categorias.textContent = categoriasUnicas.size;
        }
    }

    // ===== BUSCADOR =====
    if (inputBuscar) {
        inputBuscar.addEventListener('input', function() {
            const termino = this.value.toLowerCase();
            const tarjetas = document.querySelectorAll('.tarjeta-publicacion');
            
            tarjetas.forEach(tarjeta => {
                const titulo = tarjeta.querySelector('.titulo-publicacion').textContent.toLowerCase();
                const categoria = tarjeta.querySelector('.etiqueta-categoria').textContent.toLowerCase();
                const preview = tarjeta.querySelector('.preview-contenido')?.textContent.toLowerCase() || '';
                
                if (titulo.includes(termino) || categoria.includes(termino) || preview.includes(termino)) {
                    tarjeta.style.display = '';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
        });
    }

    // ===== FILTRO DE ORDEN =====
    if (filtroOrden) {
        filtroOrden.addEventListener('change', function() {
            const orden = this.value;
            
            if (orden === 'reciente') {
                publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            } else if (orden === 'antiguo') {
                publicaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            } else if (orden === 'titulo') {
                publicaciones.sort((a, b) => a.titulo.localeCompare(b.titulo));
            }
            
            renderizarPublicaciones();
        });
    }

    // ===== FUNCIONES AUXILIARES =====
    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';
        const date = new Date(fecha + 'T00:00:00');
        const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('es-MX', opciones);
    }

    function formatearFechaParaInput(fechaInput) {
        if (!fechaInput) return '';
        
        if (Array.isArray(fechaInput)) {
            const anio = fechaInput[0];
            const mes = String(fechaInput[1]).padStart(2, '0');
            const dia = String(fechaInput[2]).padStart(2, '0');
            return `${anio}-${mes}-${dia}`;
        }
        
        if (typeof fechaInput === 'string') {
            return fechaInput.split('T')[0];
        }
        
        return '';
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

    // ===== NOTIFICACIÓN BANNER =====
    const notificacionBanner = document.getElementById('notificacion-banner');
    const notificacionMensaje = document.getElementById('notificacion-mensaje');
    const cerrarNotificacion = document.getElementById('cerrar-notificacion');
    let timeoutNotificacion = null;

    function mostrarNotificacion(mensaje) {
        if (!notificacionBanner || !notificacionMensaje) return;
        
        if (timeoutNotificacion) {
            clearTimeout(timeoutNotificacion);
        }
        
        notificacionMensaje.textContent = mensaje;
        notificacionBanner.classList.add('mostrar');
        
        timeoutNotificacion = setTimeout(() => {
            ocultarNotificacion();
        }, 5000);
    }

    function ocultarNotificacion() {
        if (notificacionBanner) {
            notificacionBanner.classList.remove('mostrar');
        }
        if (timeoutNotificacion) {
            clearTimeout(timeoutNotificacion);
            timeoutNotificacion = null;
        }
    }

    if (cerrarNotificacion) {
        cerrarNotificacion.addEventListener('click', ocultarNotificacion);
    }

    // ===== EVENT LISTENERS DE MODALES =====
    if (btnAgregarPublicacion) {
        btnAgregarPublicacion.addEventListener('click', function() {
            publicacionEditando = null;
            limpiarFormulario();
            abrirModal(modalCrearBlog);
        });
    }

    if (cerrarModalCrear) {
        cerrarModalCrear.addEventListener('click', function() {
            abrirModal(modalConfirmarCancelar);
        });
    }

    if (btnCancelarCrear) {
        btnCancelarCrear.addEventListener('click', function() {
            abrirModal(modalConfirmarCancelar);
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener('click', function() {
            cerrarModal(modalConfirmarCancelar);
        });
    }

    

    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', function() {
            cerrarModal(modalConfirmarEliminar);
            tarjetaAEliminar = null;
        });
    }

    if (cerrarModalDetalles) {
        cerrarModalDetalles.addEventListener('click', function() {
            cerrarModal(modalDetallesPublicacion);
        });
    }

    // ===== MENÚ LATERAL =====
    const botonMenu = document.getElementById('boton-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const itemsMenu = document.querySelectorAll('.item-menu');

    function esMobile() {
        return window.innerWidth <= 768;
    }

    function abrirMenu() {
        if (esMobile()) {
            menuLateral.classList.add('abierto');
            overlayMenu.classList.add('activo');
            botonMenu.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    function cerrarMenu() {
        menuLateral.classList.remove('abierto');
        overlayMenu.classList.remove('activo');
        botonMenu.classList.remove('activo');
        document.body.style.overflow = '';
    }

    if (botonMenu) {
        botonMenu.addEventListener('click', function(e) {
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

    itemsMenu.forEach(item => {
        item.addEventListener('click', function() {
            if (esMobile()) {
                cerrarMenu();
            }
        });
    });

    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });

    // ===== CERRAR MODALES CON ESCAPE Y CLICK FUERA =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modalDetallesPublicacion && modalDetallesPublicacion.classList.contains('activo')) {
                cerrarModal(modalDetallesPublicacion);
            } else if (modalDatosCorrectos && modalDatosCorrectos.classList.contains('activo')) {
                cerrarModal(modalDatosCorrectos);
            } else if (modalConfirmarEliminar && modalConfirmarEliminar.classList.contains('activo')) {
                cerrarModal(modalConfirmarEliminar);
                tarjetaAEliminar = null;
            } else if (modalConfirmarCancelar && modalConfirmarCancelar.classList.contains('activo')) {
                cerrarModal(modalConfirmarCancelar);
            } else if (modalCrearBlog && modalCrearBlog.classList.contains('activo')) {
                abrirModal(modalConfirmarCancelar);
            }
        }
    });

    [modalCrearBlog, modalConfirmarCancelar, modalDatosCorrectos, modalConfirmarEliminar, modalDetallesPublicacion].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    if (modal === modalCrearBlog) {
                        abrirModal(modalConfirmarCancelar);
                    } else if (modal === modalConfirmarEliminar) {
                        cerrarModal(modal);
                        tarjetaAEliminar = null;
                    } else {
                        cerrarModal(modal);
                    }
                }
            });
        }
    });

    // ===== LOGOUT =====
    

    // ===== INICIALIZAR =====
    await cargarPublicaciones();
    console.log('✅ Blog Admin con Backend Iniciado');
});