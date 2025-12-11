document.addEventListener('DOMContentLoaded', async function() {
    
    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');

    // ===== VERIFICACIÓN DE SESIÓN =====
    if (!token || !usuarioId) {
        alert('No has iniciado sesión.');
        window.location.href = '../paginas/Rol_Usuario.html'; 
        return;
    }

    let datosUsuarioOriginales = {}; 

    // ===== ELEMENTOS DEL DOM =====
    const nombreUsuarioHeader = document.getElementById('nombre-usuario');
    const imgPerfil = document.getElementById('imagen-perfil');
    
    // Botones Fotos
    const btnCambiarFoto = document.getElementById('btn-cambiar-foto');
    const btnEliminarFoto = document.getElementById('btn-eliminar-foto');
    
    // Crear input de foto dinámicamente si no existe
    let inputFoto = document.getElementById('input-foto-perfil');

   // ===== SUBIR FOTO DE PERFIL (ADAPTADO) =====
if (btnCambiarFoto) {
    btnCambiarFoto.addEventListener('click', () => inputFoto.click());
}

if (inputFoto) {
    inputFoto.addEventListener('change', async function () {
        if (this.files && this.files[0]) {
            const archivo = this.files[0];

            // Validar tipo
            if (!archivo.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (máx 5MB)
            if (archivo.size > 5 * 1024 * 1024) {
                alert("La imagen es muy pesada (Máx 5MB)");
                return;
            }

            // Previsualización local
            const reader = new FileReader();
            reader.onload = (e) => {
                if (imgPerfil) imgPerfil.src = e.target.result;
                if (fotoAmpliada) fotoAmpliada.src = e.target.result;
            };
            reader.readAsDataURL(archivo);

            // Enviar al servidor
            const formData = new FormData();
            formData.append("imagen", archivo);

            try {
                const response = await fetch(`${API_BASE_URL}/usuario/${usuarioId}/foto`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();

                    // Actualiza URL real del backend
                    if (imgPerfil) imgPerfil.src = `${API_BASE_URL}${data.url}`;
                    if (fotoAmpliada) fotoAmpliada.src = `${API_BASE_URL}${data.url}`;

                    urlFotoActual = data.url;

                    // Mostrar botón eliminar
                    if (btnEliminarFoto) btnEliminarFoto.style.display = 'flex';

                } else {
                    throw new Error("Error al subir foto");
                }
            } catch (error) {
                console.error(error);
                alert("No se pudo guardar la foto");
            }
        }
    });
}

    
    // Botones Editar
    const btnActualizarDatos = document.getElementById('btn-actualizar-datos');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnGuardar = document.getElementById('btn-guardar');
    const contenedorBotones = document.getElementById('contenedor-botones');
    
    // Menú hamburguesa
    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const enlacesMenu = document.querySelectorAll('.item-menu');
    
    // Logout
    const btnLogout = document.getElementById('logout-button');
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    
    // Modal foto ampliada
    const fotoPerfilClick = document.getElementById('foto-perfil-click');
    const modalFotoAmpliada = document.getElementById('modal-foto-ampliada');
    const fotoAmpliada = document.getElementById('foto-ampliada');
    const btnCerrarFoto = document.getElementById('btn-cerrar-foto');
    
    // Modal eliminar foto
    const modalEliminarFoto = document.getElementById('modal-eliminar-foto');
    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    
    // Campos del formulario
    const camposEntrada = document.querySelectorAll('.campo-entrada');
    const nombreCompleto = document.getElementById('nombre-completo');
    const rfc = document.getElementById('rfc');
    const curp = document.getElementById('curp');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');

    // Modales
    const modalCancelar = document.getElementById('modal-cancelar');
    const modalGuardar = document.getElementById('modal-guardar');
    const modalExito = document.getElementById('modal-exito');
    
    // Botones de modales
    const btnVolver = document.getElementById('btn-volver');
    const btnConfirmarCancelar = document.getElementById('btn-confirmar-cancelar');
    const btnRegresar = document.getElementById('btn-regresar');
    const btnConfirmarGuardar = document.getElementById('btn-confirmar-guardar');
    const btnCerrarExito = document.getElementById('btn-cerrar-exito');
    
    // ===== ESTADO DEL FORMULARIO =====
    let modoEdicion = false;
    let datosOriginales = {};
    let rolUsuarioActual = 2;
    let urlFotoActual = null;
    
    // ===== FUNCIONES DE VALIDACIÓN =====
    
    function validarRFC(valor) {
        const rfcLimpio = valor.trim().toUpperCase();
        const longitudActual = rfcLimpio.length;
        
        if (longitudActual === 0) {
            return { valido: false, mensaje: 'El RFC es obligatorio' };
        }
        
        if (longitudActual < 12) {
            return { 
                valido: false, 
                mensaje: `RFC incompleto: ${longitudActual}/12 caracteres (faltan ${12 - longitudActual})` 
            };
        }
        
        if (longitudActual === 12 || longitudActual === 13) {
            const formatoRFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/;
            if (!formatoRFC.test(rfcLimpio)) {
                return { 
                    valido: false, 
                    mensaje: 'Formato de RFC inválido (Ejemplo: XAXX010101000)' 
                };
            }
            return { valido: true, mensaje: '✓ RFC válido' };
        }
        
        if (longitudActual > 13) {
            return { 
                valido: false, 
                mensaje: `RFC demasiado largo: ${longitudActual}/13 caracteres (sobran ${longitudActual - 13})` 
            };
        }
        
        return { valido: false, mensaje: 'RFC inválido' };
    }
    
    function validarCURP(valor) {
        const curpLimpio = valor.trim().toUpperCase();
        const longitudActual = curpLimpio.length;
        
        if (longitudActual === 0) {
            return { valido: false, mensaje: 'El CURP es obligatorio' };
        }
        
        if (longitudActual < 18) {
            return { 
                valido: false, 
                mensaje: `CURP incompleto: ${longitudActual}/18 caracteres (faltan ${18 - longitudActual})` 
            };
        }
        
        if (longitudActual === 18) {
            const formatoCURP = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
            if (!formatoCURP.test(curpLimpio)) {
                return { 
                    valido: false, 
                    mensaje: 'Formato de CURP inválido (Ejemplo: XAXX010101HDFXXX09)' 
                };
            }
            return { valido: true, mensaje: '✓ CURP válida' };
        }
        
        if (longitudActual > 18) {
            return { 
                valido: false, 
                mensaje: `CURP demasiado larga: ${longitudActual}/18 caracteres (sobran ${longitudActual - 18})` 
            };
        }
        
        return { valido: false, mensaje: 'CURP inválida' };
    }
    
    function validarTelefono(valor) {
        const telefonoLimpio = valor.trim().replace(/\D/g, '');
        const longitudActual = telefonoLimpio.length;
        
        if (longitudActual === 0) {
            return { valido: false, mensaje: 'El teléfono es obligatorio' };
        }
        
        if (longitudActual < 10) {
            return { 
                valido: false, 
                mensaje: `Teléfono incompleto: ${longitudActual}/10 dígitos (faltan ${10 - longitudActual})` 
            };
        }
        
        if (longitudActual === 10) {
            return { valido: true, mensaje: '✓ Teléfono válido' };
        }
        
        if (longitudActual > 10) {
            return { 
                valido: false, 
                mensaje: `Teléfono demasiado largo: ${longitudActual}/10 dígitos (sobran ${longitudActual - 10})` 
            };
        }
        
        return { valido: false, mensaje: 'Teléfono inválido' };
    }
    
    function mostrarMensajeValidacion(campo, resultado) {
        let mensajeDiv = campo.parentElement.querySelector('.mensaje-validacion');
        
        if (!mensajeDiv) {
            mensajeDiv = document.createElement('div');
            mensajeDiv.className = 'mensaje-validacion';
            campo.parentElement.appendChild(mensajeDiv);
        }
        
        mensajeDiv.textContent = resultado.mensaje;
        mensajeDiv.style.cssText = `
            font-size: 0.875rem;
            margin-top: 0.25rem;
            min-height: 1.25rem;
            transition: all 0.3s ease;
        `;
        
        if (resultado.valido) {
            mensajeDiv.style.color = '#059669';
            campo.style.borderColor = '#10b981';
        } else {
            mensajeDiv.style.color = '#dc2626';
            campo.style.borderColor = '#ef4444';
        }
    }
    
    function limpiarMensajeValidacion(campo) {
        const mensajeDiv = campo.parentElement.querySelector('.mensaje-validacion');
        if (mensajeDiv) {
            mensajeDiv.textContent = '';
        }
        campo.style.borderColor = '';
    }
    
    // ===== FUNCIONES DE UTILIDAD =====
    function esMobile() {
        return window.innerWidth <= 768;
    }

    // ===== CARGAR DATOS DEL SERVIDOR =====
    async function cargarDatosDelServidor() {
        try {
            const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) throw new Error("Error al cargar perfil");
            
            const usuario = await response.json();
            
            console.log('Datos recibidos:', usuario);

            if (usuario.idRol) rolUsuarioActual = usuario.idRol;

            // Construir Nombre Completo
            const nombreCompletoStr = `${usuario.nombre || ''} ${usuario.apellido || ''} ${usuario.segundoApellido || ''}`.trim();

            // Llenar inputs
            if (nombreCompleto) nombreCompleto.value = nombreCompletoStr;
            if (email) email.value = usuario.correo || '';
            if (rfc) rfc.value = usuario.rfc || '';
            if (curp) curp.value = usuario.curp || '';
            if (telefono) telefono.value = usuario.telefono || '';

            // Actualizar encabezado
            if (nombreUsuarioHeader) nombreUsuarioHeader.textContent = nombreCompletoStr || 'Usuario';

            // CARGAR FOTO DE PERFIL
            if (usuario.img && imgPerfil) {
                urlFotoActual = usuario.img;
                if (usuario.img.startsWith('http')) {
                    imgPerfil.src = usuario.img;
                    if (fotoAmpliada) fotoAmpliada.src = usuario.img;
                } else {
                    imgPerfil.src = `${API_BASE_URL}${usuario.img}`;
                    if (fotoAmpliada) fotoAmpliada.src = `${API_BASE_URL}${usuario.img}`;
                }
                
                // Mostrar botón eliminar si tiene foto personalizada
                if (btnEliminarFoto && usuario.img !== '/uploads/default-avatar.png') {
                    btnEliminarFoto.style.display = 'flex';
                }
            }

            // Guardar respaldo
            guardarDatosOriginales();

        } catch (error) {
            console.error('Error al cargar perfil:', error);
            alert('Error al cargar los datos del perfil. Por favor recarga la página.');
        }
    }

    // ===== SUBIR FOTO DE PERFIL =====
    

    if (inputFoto) {
        inputFoto.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const archivo = this.files[0];

                // Validar tipo
                if (!archivo.type.startsWith('image/')) {
                    alert('Por favor selecciona un archivo de imagen válido');
                    return;
                }

                // Validar tamaño (máx 5MB)
                if (archivo.size > 5 * 1024 * 1024) {
                    alert("La imagen es muy pesada (Máx 5MB)");
                    return;
                }

                // Previsualización local
                const reader = new FileReader();
                reader.onload = (e) => { 
                    if (imgPerfil) imgPerfil.src = e.target.result;
                    if (fotoAmpliada) fotoAmpliada.src = e.target.result;
                };
                reader.readAsDataURL(archivo);

                // Enviar al servidor
                const formData = new FormData();
                formData.append("imagen", archivo);

                try {
                    const response = await fetch(`${API_BASE_URL}/usuario/${usuarioId}/foto`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });

                    if (response.ok) {
                        const data = await response.json();
                        urlFotoActual = data.url;
                        
                        // Actualizar con URL del servidor
                        if (imgPerfil) imgPerfil.src = `${API_BASE_URL}${data.url}`;
                        if (fotoAmpliada) fotoAmpliada.src = `${API_BASE_URL}${data.url}`;
                        
                        // Mostrar botón eliminar
                        if (btnEliminarFoto) btnEliminarFoto.style.display = 'flex';
                        
                    } else {
                        throw new Error("Error al subir foto");
                    }
                } catch (error) {
                    console.error(error);
                    alert("No se pudo guardar la foto");
                }
            }
        });
    }

    // ===== ELIMINAR FOTO DE PERFIL =====
    async function eliminarFotoDelServidor() {
        try {
            const response = await fetch(`${API_BASE_URL}/usuario/${usuarioId}/foto`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                // Restaurar foto por defecto
                const fotoDefault = '../src/avatar-default.png';
                if (imgPerfil) imgPerfil.src = fotoDefault;
                if (fotoAmpliada) fotoAmpliada.src = fotoDefault;
                urlFotoActual = null;
                
                // Ocultar botón eliminar
                if (btnEliminarFoto) btnEliminarFoto.style.display = 'none';
                
                cerrarModal(modalEliminarFoto);
            } else {
                throw new Error("Error al eliminar foto");
            }
        } catch (error) {
            console.error(error);
            alert("No se pudo eliminar la foto");
        }
    }

    // ===== GUARDAR DATOS EN SERVIDOR =====
    async function guardarDatosEnServidor() {
        try {
            const partesNombre = nombreCompleto.value.trim().split(/\s+/);
            const nombre = partesNombre[0] || '';
            const apellido = partesNombre[1] || '';
            const segundoApellido = partesNombre.slice(2).join(' ') || '';

            const datosAEnviar = {
                idUsuario: parseInt(usuarioId),
                nombre: nombre,
                apellido: apellido,
                segundoApellido: segundoApellido,
                rfc: rfc.value.trim().toUpperCase(),
                curp: curp.value.trim().toUpperCase(),
                telefono: telefono.value.trim().replace(/\D/g, ''),
                correo: email.value.trim(),
                idRol: rolUsuarioActual
            };

            console.log("Enviando al servidor:", datosAEnviar);

            const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosAEnviar)
            });
            
            if (!response.ok) throw new Error("Error al actualizar");
            
            console.log('Perfil actualizado correctamente');
            mostrarExito();

        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Error al guardar cambios: ' + error.message);
            cerrarModal(modalGuardar);
        }
    }

    // ===== LÓGICA DE UI =====
    function mostrarExito() {
        desactivarModoEdicion();
        cerrarModal(modalGuardar);
        guardarDatosOriginales();
        setTimeout(() => { abrirModal(modalExito); }, 300);
    }

    function guardarDatosOriginales() {
        datosOriginales = {
            nombreCompleto: nombreCompleto ? nombreCompleto.value : '',
            rfc: rfc ? rfc.value : '',
            curp: curp ? curp.value : '',
            telefono: telefono ? telefono.value : '',
            email: email ? email.value : ''
        };
    }

    function restaurarDatosOriginales() {
        if (nombreCompleto) nombreCompleto.value = datosOriginales.nombreCompleto || '';
        if (rfc) rfc.value = datosOriginales.rfc || '';
        if (curp) curp.value = datosOriginales.curp || '';
        if (telefono) telefono.value = datosOriginales.telefono || '';
        if (email) email.value = datosOriginales.email || '';
        
        limpiarMensajeValidacion(rfc);
        limpiarMensajeValidacion(curp);
        limpiarMensajeValidacion(telefono);
    }

    function activarModoEdicion() {
        modoEdicion = true;
        guardarDatosOriginales(); 
        
        camposEntrada.forEach(campo => {
            // El email podría seguir bloqueado si lo deseas
            if (campo.id !== 'email') campo.disabled = false;
        });
        
        if (contenedorBotones) contenedorBotones.style.display = 'flex';
        
        if (btnActualizarDatos) {
            btnActualizarDatos.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg> Editando...`;
            btnActualizarDatos.style.backgroundColor = '#fef3c7';
            btnActualizarDatos.style.color = '#92400e';
        }
    }

    function desactivarModoEdicion() {
        modoEdicion = false;
        
        camposEntrada.forEach(campo => campo.disabled = true);
        
        if (contenedorBotones) contenedorBotones.style.display = 'none';
        
        limpiarMensajeValidacion(rfc);
        limpiarMensajeValidacion(curp);
        limpiarMensajeValidacion(telefono);
        
        if (btnActualizarDatos) {
            btnActualizarDatos.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg> Actualizar datos`;
            btnActualizarDatos.style.backgroundColor = 'white';
            btnActualizarDatos.style.color = '#117a8b';
        }
    }

    function validarCampos() {
        const errores = [];
        
        if (!nombreCompleto.value.trim()) {
            errores.push('El nombre completo es obligatorio');
        }
        
        const resultadoRFC = validarRFC(rfc.value);
        if (!resultadoRFC.valido) {
            errores.push(resultadoRFC.mensaje);
            mostrarMensajeValidacion(rfc, resultadoRFC);
        }
        
        const resultadoCURP = validarCURP(curp.value);
        if (!resultadoCURP.valido) {
            errores.push(resultadoCURP.mensaje);
            mostrarMensajeValidacion(curp, resultadoCURP);
        }
        
        const resultadoTelefono = validarTelefono(telefono.value);
        if (!resultadoTelefono.valido) {
            errores.push(resultadoTelefono.mensaje);
            mostrarMensajeValidacion(telefono, resultadoTelefono);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
            errores.push('El correo electrónico no es válido');
        }
        
        if (errores.length > 0) {
            alert('Por favor corrige los siguientes errores:\n\n' + errores.join('\n'));
            return false;
        }
        
        return true;
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

    // ===== FUNCIONES FOTO AMPLIADA =====
    function abrirFotoAmpliada() {
        if (modalFotoAmpliada && fotoAmpliada && imgPerfil) {
            fotoAmpliada.src = imgPerfil.src;
            modalFotoAmpliada.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function cerrarFotoAmpliada() {
        if (modalFotoAmpliada) {
            modalFotoAmpliada.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }
    
    // ===== EVENT LISTENERS - VALIDACIÓN EN TIEMPO REAL =====
    if (rfc) {
        rfc.addEventListener('input', function() {
            if (modoEdicion) {
                const resultado = validarRFC(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
        
        rfc.addEventListener('blur', function() {
            if (modoEdicion && this.value.trim()) {
                const resultado = validarRFC(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
    }
    
    if (curp) {
        curp.addEventListener('input', function() {
            if (modoEdicion) {
                const resultado = validarCURP(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
        
        curp.addEventListener('blur', function() {
            if (modoEdicion && this.value.trim()) {
                const resultado = validarCURP(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
    }
    
    if (telefono) {
        telefono.addEventListener('input', function() {
            if (modoEdicion) {
                const resultado = validarTelefono(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
        
        telefono.addEventListener('blur', function() {
            if (modoEdicion && this.value.trim()) {
                const resultado = validarTelefono(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
    }
    
    // ===== EVENT LISTENERS - MENÚ =====
    if (botonHamburguesa) {
        botonHamburguesa.addEventListener('click', (e) => {
            e.stopPropagation();
            menuLateral.classList.contains('abierto') ? cerrarMenu() : abrirMenu();
        });
    }

    if (overlayMenu) overlayMenu.addEventListener('click', cerrarMenu);

    enlacesMenu.forEach(enlace => {
        enlace.addEventListener('click', function() {
            if (esMobile()) cerrarMenu();
        });
    });

    // ===== EVENT LISTENERS - FORMULARIO =====
    if (btnActualizarDatos) {
        btnActualizarDatos.addEventListener('click', () => {
            if (!modoEdicion) activarModoEdicion();
        });
    }

    if (btnCancelar) btnCancelar.addEventListener('click', () => abrirModal(modalCancelar));
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            if (validarCampos()) abrirModal(modalGuardar);
        });
    }

    // ===== EVENT LISTENERS - MODALES =====
    if (btnVolver) btnVolver.addEventListener('click', () => cerrarModal(modalCancelar));
    if (btnConfirmarCancelar) {
        btnConfirmarCancelar.addEventListener('click', () => {
            restaurarDatosOriginales();
            desactivarModoEdicion();
            cerrarModal(modalCancelar);
        });
    }

    if (btnRegresar) btnRegresar.addEventListener('click', () => cerrarModal(modalGuardar));
    if (btnConfirmarGuardar) {
        btnConfirmarGuardar.addEventListener('click', () => guardarDatosEnServidor());
    }

    if (btnCerrarExito) btnCerrarExito.addEventListener('click', () => cerrarModal(modalExito));

    // Cerrar modales al hacer clic fuera
    [modalCancelar, modalGuardar, modalExito].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) cerrarModal(modal);
            });
        }
    });

    // ===== EVENT LISTENERS - FOTO PERFIL =====
    if (btnEliminarFoto) {
        btnEliminarFoto.addEventListener('click', function(e) {
            e.stopPropagation();
            abrirModal(modalEliminarFoto);
        });
    }
    
    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', () => cerrarModal(modalEliminarFoto));
    }
    
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', eliminarFotoDelServidor);
    }
    
    if (modalEliminarFoto) {
        modalEliminarFoto.addEventListener('click', function(e) {
            if (e.target === modalEliminarFoto) cerrarModal(modalEliminarFoto);
        });
    }
    
    if (fotoPerfilClick) {
        fotoPerfilClick.addEventListener('click', function(e) {
            if (!e.target.closest('.boton-cambiar-foto') && !e.target.closest('.boton-eliminar-foto')) {
                abrirFotoAmpliada();
            }
        });
    }
    
    if (btnCerrarFoto) btnCerrarFoto.addEventListener('click', cerrarFotoAmpliada);
    
    if (modalFotoAmpliada) {
        modalFotoAmpliada.addEventListener('click', function(e) {
            if (e.target === modalFotoAmpliada) cerrarFotoAmpliada();
        });
    }

    // ===== EVENT LISTENERS - LOGOUT =====
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
            localStorage.removeItem('afgcorporacion_cliente_perfil');
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

    // ===== TECLA ESC =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                cerrarMenu();
            }
            if (modalLogout && modalLogout.classList.contains('activo')) {
                cerrarModal(modalLogout);
            }
            if (modalCancelar && modalCancelar.classList.contains('activo')) {
                cerrarModal(modalCancelar);
            }
            if (modalGuardar && modalGuardar.classList.contains('activo')) {
                cerrarModal(modalGuardar);
            }
            if (modalExito && modalExito.classList.contains('activo')) {
                cerrarModal(modalExito);
            }
            if (modalFotoAmpliada && modalFotoAmpliada.classList.contains('activo')) {
                cerrarFotoAmpliada();
            }
            if (modalEliminarFoto && modalEliminarFoto.classList.contains('activo')) {
                cerrarModal(modalEliminarFoto);
            }
        }
    });
    
    // ===== RESIZE =====
    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });
    
    // ===== INICIALIZACIÓN =====
    cargarDatosDelServidor();
    cargarFotoDeStorage();
    
    console.log('✅ Perfil de cliente AFGCORPORACIÓN cargado correctamente');
});