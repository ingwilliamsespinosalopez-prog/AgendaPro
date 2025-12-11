document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:7001';
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }

    // ===== ELEMENTOS DOM =====
    const tbodyAsesores = document.getElementById('tbody-asesores');
    const tbodyClientes = document.getElementById('tbody-clientes');
    const tabsBotones = document.querySelectorAll('.tab-boton');
    const tabsPaneles = document.querySelectorAll('.tab-panel');

    // Modales
    const modalCrear = document.getElementById('modal-crear-usuario');
    const formCrear = document.getElementById('form-crear-usuario');
    const btnAgregar = document.getElementById('btn-agregar-usuario');
    const btnGenerarPass = document.getElementById('btn-generar-password');
    const inputPass = document.getElementById('input-password');
    
    const modalConfirmarEliminar = document.getElementById('modal-confirmar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    
    const modalCambiarEstado = document.getElementById('modal-cambiar-estado');
    const btnConfirmarCambioEstado = document.getElementById('btn-confirmar-cambio-estado');
    const btnCancelarCambioEstado = document.getElementById('btn-cancelar-cambio-estado');
    
    const cerrarModalCrear = document.getElementById('cerrar-modal-crear');
    const btnCancelarCrear = document.getElementById('btn-cancelar-crear');
    const modalDatosCorrectos = document.getElementById('modal-datos-correctos');
    const btnRevisar = document.getElementById('btn-revisar');
    const btnConfirmarCrearFinal = document.getElementById('btn-confirmar-crear');
    const modalVerDetalles = document.getElementById('modal-ver-detalles');
    const cerrarModalDetalles = document.getElementById('cerrar-modal-detalles');
    const btnCancelarEditar = document.getElementById('btn-cancelar-editar');
    const formEditarUsuario = document.getElementById('form-editar-usuario');

    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');

    function abrirMenu() {
        menuLateral.classList.add('activo');
        overlayMenu.classList.add('activo');
    }

    function cerrarMenu() {
        menuLateral.classList.remove('activo');
        overlayMenu.classList.remove('activo');
    }

    botonHamburguesa.addEventListener('click', abrirMenu);
    overlayMenu.addEventListener('click', cerrarMenu);

    // Estado
    let usuarioAEliminar = null;
    let usuarioACambiarEstado = null;
    let usuariosGlobales = [];
    let usuarioActualEditar = null;

    // ===== INICIALIZACIÓN =====
    init();

    function init() {
        setupTabs();
        setupFilters();
        cargarUsuarios();
        setupModalEvents();
    }

    // ==========================================
    // SISTEMA DE NOTIFICACIONES
    // ==========================================
    function mostrarNotificacion(mensaje, tipo = 'success') {
        const notif = document.createElement('div');
        notif.className = `notificacion-toast ${tipo}`;
        notif.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">
                    ${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}
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
        
        if (tipo === 'success') {
            notif.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            notif.style.color = 'white';
        } else if (tipo === 'error') {
            notif.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
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
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // SISTEMA DE PESTAÑAS
    // ==========================================
    function setupTabs() {
        tabsBotones.forEach(boton => {
            boton.addEventListener('click', () => {
                tabsBotones.forEach(btn => btn.classList.remove('activo'));
                tabsPaneles.forEach(panel => panel.classList.remove('activo'));
                boton.classList.add('activo');
                const tabId = boton.getAttribute('data-tab');
                const panelActivo = document.getElementById(`panel-${tabId}`);
                if (panelActivo) panelActivo.classList.add('activo');
            });
        });
    }

    // ==========================================
    // SISTEMA DE FILTROS
    // ==========================================
    function setupFilters() {
        const inputsBuscar = document.querySelectorAll('.input-buscar');
        inputsBuscar.forEach(input => {
            input.addEventListener('input', (e) => filtrarTablaLocalmente(e.target));
        });

        const selectsEstado = document.querySelectorAll('.filtro-estado');
        selectsEstado.forEach(select => {
            select.addEventListener('change', (e) => filtrarTablaLocalmente(e.target));
        });
    }

    function filtrarTablaLocalmente(elementoDisparador) {
        const panelPadre = elementoDisparador.closest('.tab-panel');
        if (!panelPadre) return;

        const inputBusqueda = panelPadre.querySelector('.input-buscar');
        const selectEstado = panelPadre.querySelector('.filtro-estado');
        const texto = inputBusqueda.value.toLowerCase();
        const estado = selectEstado.value;
        const filas = panelPadre.querySelectorAll('tbody tr');

        filas.forEach(fila => {
            const nombreFila = fila.getAttribute('data-nombre').toLowerCase();
            const emailFila = fila.getAttribute('data-email').toLowerCase();
            const estadoFila = fila.getAttribute('data-estado');

            const matchTexto = nombreFila.includes(texto) || emailFila.includes(texto);
            const matchEstado = (estado === 'todos') || (estadoFila === estado);

            fila.style.display = (matchTexto && matchEstado) ? '' : 'none';
        });
    }

    // ==========================================
    // CARGAR USUARIOS DEL BACKEND
    // ==========================================
    async function cargarUsuarios() {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al cargar usuarios");

            const usuarios = await res.json();
            usuariosGlobales = usuarios;

            tbodyAsesores.innerHTML = '';
            tbodyClientes.innerHTML = '';

            let countActivos = 0;
            let countAsesores = 0;
            let countClientes = 0;

            usuarios.forEach(u => {
                const esAsesor = u.idRol === 3;
                const esCliente = u.idRol === 2;

                if (!esAsesor && !esCliente) return;

                const estadoReal = u.estado ? u.estado.toLowerCase() : 'activo';

                if (esAsesor) countAsesores++; 
                else countClientes++;

                if (estadoReal === 'activo') countActivos++;

                const nombreCompleto = `${u.nombre} ${u.apellido}`.trim();
                const iniciales = (u.nombre[0] + (u.apellido ? u.apellido[0] : '')).toUpperCase();
                const estadoClass = estadoReal === 'activo' ? 'activo' : 'inactivo';

                let avatarHTML = '';
                if (u.img) {
                    const srcImagen = u.img.startsWith('http') ? u.img : `${API_BASE_URL}${u.img}`;
                    avatarHTML = `<img src="${srcImagen}" alt="${iniciales}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
                } else {
                    avatarHTML = `<div class="avatar-usuario" style="background-color: ${esAsesor ? '#1a6b8a' : '#e67e22'};">${iniciales}</div>`;
                }

                const tr = document.createElement('tr');
                tr.setAttribute('data-id', u.idUsuario);
                tr.setAttribute('data-nombre', nombreCompleto);
                tr.setAttribute('data-email', u.correo);
                tr.setAttribute('data-estado', estadoReal);
                tr.setAttribute('data-rol', esAsesor ? 'asesor' : 'cliente');

                tr.innerHTML = `
                    <td>${u.idUsuario}</td>
                    <td>
                        <div class="celda-usuario">
                            ${avatarHTML}
                            <div style="display:flex; flex-direction:column; margin-left: 10px;">
                                <span style="font-weight:600;">${nombreCompleto}</span>
                                <span style="font-size:12px; color:#666;">${u.correo}</span>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge-rol ${esAsesor ? '' : 'badge-cliente'}">${esAsesor ? 'Asesor' : 'Cliente'}</span></td>
                    <td><span class="badge-estado ${estadoClass}">${estadoReal}</span></td>
                    <td>
                        <div class="acciones">
                            <button class="btn-accion btn-ver" onclick="abrirModalDetalles(${u.idUsuario})" title="Ver detalles">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                            <button class="btn-accion btn-estado" onclick="abrirModalCambiarEstado(${u.idUsuario}, '${nombreCompleto}', '${estadoReal}')" title="Cambiar Estado">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </button>
                            <button class="btn-accion btn-eliminar" onclick="confirmarEliminar(${u.idUsuario}, '${nombreCompleto}')" title="Eliminar Usuario">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                `;

                if (esAsesor) tbodyAsesores.appendChild(tr);
                else tbodyClientes.appendChild(tr);
            });

            document.getElementById('total-usuarios').textContent = countAsesores + countClientes;
            document.getElementById('usuarios-activos').textContent = countActivos;
            document.getElementById('usuarios-inactivos').textContent = (countAsesores + countClientes) - countActivos;

            const countAsesoresEl = document.getElementById('total-asesores');
            const countClientesEl = document.getElementById('total-clientes');
            if (countAsesoresEl) countAsesoresEl.textContent = countAsesores;
            if (countClientesEl) countClientesEl.textContent = countClientes;

        } catch (e) {
            console.error(e);
            mostrarNotificacion("Error de conexión al cargar usuarios", 'error');
        }
    }

    // ==========================================
    // CREAR ASESOR
    // ==========================================
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            formCrear.reset();
            document.getElementById('input-id-auto').value = "Auto";
            const rolInput = document.getElementById('input-rol');
            if (rolInput) rolInput.value = "asesor";
            modalCrear.classList.add('activo');
        });
    }

    if (btnGenerarPass && inputPass) {
    btnGenerarPass.addEventListener('click', () => {
        inputPass.value = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();
    });
}

    if (formCrear) {
        formCrear.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('input-email').value;
            document.getElementById('email-confirmacion').textContent = email;
            modalDatosCorrectos.classList.add('activo');
        });
    }

    if (btnConfirmarCrearFinal) {
        btnConfirmarCrearFinal.addEventListener('click', async () => {
            const nombreCompleto = document.getElementById('input-usuario').value;
            const partes = nombreCompleto.split(' ');

            const nuevoUsuario = {
                nombre: partes[0],
                apellido: partes.slice(1).join(' ') || 'Apellido',
                segundoApellido: '',
                correo: document.getElementById('input-email').value,
                contrasena: document.getElementById('input-password').value,
                idRol: 3,
                telefono: "0000000000",
                rfc: "XAXX010101000",
                curp: "XAXX010101HXXXXX00"
            };

            btnConfirmarCrearFinal.disabled = true;
            btnConfirmarCrearFinal.textContent = "Creando...";

            try {
                const res = await fetch(`${API_BASE_URL}/registro`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevoUsuario)
                });

                if (res.ok) {
                    mostrarNotificacion("Usuario creado exitosamente", 'success');
                    cerrarTodosModales();
                    await cargarUsuarios();
                } else {
                    mostrarNotificacion("Error al crear usuario. Verifica el correo", 'error');
                }
            } catch (error) {
                console.error(error);
                mostrarNotificacion("Error de conexión", 'error');
            } finally {
                btnConfirmarCrearFinal.disabled = false;
                btnConfirmarCrearFinal.textContent = "Confirmar y Crear";
            }
        });
    }

    // ==========================================
    // CAMBIAR ESTADO (NUEVO)
    // ==========================================
    window.abrirModalCambiarEstado = (id, nombre, estadoActual) => {
        usuarioACambiarEstado = { id, nombre, estadoActual };
        const nombreEstado = document.getElementById('nombre-cambiar-estado');
        const mensajeEstado = document.getElementById('mensaje-cambiar-estado');
        
        if (nombreEstado) nombreEstado.textContent = nombre;
        if (mensajeEstado) {
            mensajeEstado.textContent = estadoActual === 'activo' 
                ? '¿Deseas desactivar este usuario?' 
                : '¿Deseas activar este usuario?';
        }
        
        modalCambiarEstado.classList.add('activo');
    };

    if (btnConfirmarCambioEstado) {
        btnConfirmarCambioEstado.addEventListener('click', async () => {
            if (!usuarioACambiarEstado) return;

            btnConfirmarCambioEstado.disabled = true;
            btnConfirmarCambioEstado.textContent = "Procesando...";

            const nuevoEstado = usuarioACambiarEstado.estadoActual === 'activo' ? 'inactivo' : 'activo';

            try {
                const res = await fetch(`${API_BASE_URL}/usuario/estado/${usuarioACambiarEstado.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });

                if (res.ok) {
                    modalCambiarEstado.classList.remove('activo');
                    mostrarNotificacion(`Estado cambiado a ${nuevoEstado}`, 'success');
                    await cargarUsuarios();
                } else {
                    mostrarNotificacion("Error al cambiar estado", 'error');
                }
            } catch (e) {
                console.error(e);
                mostrarNotificacion("Error de conexión", 'error');
            } finally {
                btnConfirmarCambioEstado.disabled = false;
                btnConfirmarCambioEstado.textContent = "Confirmar";
                usuarioACambiarEstado = null;
            }
        });
    }

    if (btnCancelarCambioEstado) {
        btnCancelarCambioEstado.addEventListener('click', () => {
            modalCambiarEstado.classList.remove('activo');
        });
    }

    // ==========================================
    // ELIMINAR USUARIO
    // ==========================================
    window.confirmarEliminar = (id, nombre) => {
        usuarioAEliminar = id;
        const nombreElem = document.getElementById('nombre-eliminar');
        if (nombreElem) nombreElem.textContent = nombre;
        modalConfirmarEliminar.classList.add('activo');
    };

    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', async () => {
            if (!usuarioAEliminar) return;

            btnConfirmarEliminar.disabled = true;
            btnConfirmarEliminar.textContent = "Eliminando...";

            try {
                const res = await fetch(`${API_BASE_URL}/usuario/eliminar/${usuarioAEliminar}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    modalConfirmarEliminar.classList.remove('activo');
                    mostrarNotificacion("Usuario eliminado correctamente", 'success');
                    await cargarUsuarios();
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    mostrarNotificacion("Error al eliminar: " + (errorData.error || "Error desconocido"), 'error');
                }
            } catch (e) {
                console.error(e);
                mostrarNotificacion("Error de conexión al intentar eliminar", 'error');
            } finally {
                btnConfirmarEliminar.disabled = false;
                btnConfirmarEliminar.textContent = "Confirmar";
                usuarioAEliminar = null;
            }
        });
    }

    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', () => {
            modalConfirmarEliminar.classList.remove('activo');
        });
    }

    // ==========================================
    // VER DETALLES
    // ==========================================
    window.abrirModalDetalles = (idUsuario) => {
        const usuario = usuariosGlobales.find(u => u.idUsuario === idUsuario);
        if (!usuario) return;

        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
        const esAsesor = usuario.idRol === 3;
        const estadoReal = usuario.estado ? usuario.estado.toLowerCase() : 'activo';

        usuarioActualEditar = usuario;

        document.getElementById('detalle-id').value = usuario.idUsuario;
        document.getElementById('detalle-nombre').value = nombreCompleto;
        document.getElementById('detalle-email').value = usuario.correo;
        document.getElementById('detalle-rol').value = esAsesor ? 'asesor' : 'cliente';
        document.getElementById('detalle-estado').value = estadoReal;
        document.getElementById('detalle-password').value = '';

        const iniciales = (usuario.nombre[0] + (usuario.apellido ? usuario.apellido[0] : '')).toUpperCase();
        const avatarDetalle = document.getElementById('avatar-detalle');
        const inicialesDetalle = document.getElementById('iniciales-detalle');
        
        if (avatarDetalle) avatarDetalle.style.backgroundColor = esAsesor ? '#1a6b8a' : '#e67e22';
        if (inicialesDetalle) inicialesDetalle.textContent = iniciales;

        const badgeRol = document.getElementById('badge-rol-detalle');
        const badgeEstado = document.getElementById('badge-estado-detalle');
        
        if (badgeRol) {
            badgeRol.textContent = esAsesor ? 'Asesor' : 'Cliente';
            badgeRol.classList.toggle('badge-cliente', !esAsesor);
        }
        
        if (badgeEstado) {
            badgeEstado.textContent = estadoReal === 'activo' ? 'Activo' : 'Inactivo';
            badgeEstado.className = `badge-estado-detalle ${estadoReal}`;
        }

        modalVerDetalles.classList.add('activo');
    };

    if (formEditarUsuario) {
    formEditarUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!usuarioActualEditar) return;

        const password = document.getElementById('detalle-password').value;
        
        if (!password) {
            mostrarNotificacion('Genera una nueva contraseña antes de guardar', 'error');
            return;
        }

        try {
            const correo = usuarioActualEditar.correo;

            const respuesta = await fetch(`${API_BASE_URL}/usuarios/update-password`, {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    correo: correo,
                    nuevaPassword: password
                })
            });

            if (!respuesta.ok) {
                const error = await respuesta.text();
                mostrarNotificacion(`Error: ${error}`, 'error');
                return;
            }

            mostrarNotificacion(`Nueva contraseña enviada y guardada para ${correo}`, 'success');
            console.log('📧 Nueva contraseña:', password);
            
            modalVerDetalles.classList.remove('activo');

        } catch (error) {
            mostrarNotificacion('Error al conectar con el servidor', 'error');
            console.error(error);
        }
    });
}


    // ==========================================
    // UTILS Y EVENTOS GENERALES
    // ==========================================
    function cerrarTodosModales() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('activo'));
    }

    function setupModalEvents() {
        const cerrarBtns = [cerrarModalCrear, btnCancelarCrear, btnRevisar, cerrarModalDetalles, btnCancelarEditar];
        cerrarBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', cerrarTodosModales);
        });

        const btnLogout = document.getElementById('logout-button');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                const modalLogout = document.getElementById('modal-logout');
                if (modalLogout) {
                    modalLogout.classList.add('activo');
                } else {
                    if (confirm('¿Cerrar sesión?')) {
                        localStorage.clear();
                        window.location.href = '../paginas/Rol_Usuario.html';
                    }
                }
            });
        }

        // Botones generador de password en modal de detalles
        const btnGenerarPasswordDetalle = document.getElementById('btn-generar-password-detalle'); 
        const inputPasswordDetalle = document.getElementById('detalle-password'); 

            if (btnGenerarPasswordDetalle && inputPasswordDetalle) {
                btnGenerarPasswordDetalle.addEventListener('click', () => {
                const parteMin = Math.random().toString(36).slice(-8);
                const parteMay = Math.random().toString(36).slice(-2).toUpperCase();
                inputPasswordDetalle.value = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();
                });
            }

    }

    console.log('✅ Control de Usuarios con Backend cargado correctamente');
});