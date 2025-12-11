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

    // ===== VARIABLES GLOBALES =====
    let datosUsuarioOriginales = {}; 
    let rolUsuarioActual = 1; // Default Admin
    let estadisticas = {
        publicaciones: 0,
        asesorias: 0,
        clientes: 0
    };
    let modoEdicionActivo = false;

    // ===== ELEMENTOS DEL DOM =====
    const nombreUsuarioHeader = document.querySelector('.nombre-usuario');
    const rolUsuarioHeader = document.querySelector('.rol-usuario');
    const notificacion = document.getElementById('mi-notificacion');
    const mensajeNotificacion = document.getElementById('notificacion-mensaje');
    const cerrarNotificacionBtn = document.getElementById('notificacion-cerrar');
    
    // Botones Editar
    const btnEditarDatos = document.getElementById('btn-editar-datos-personales');
    const btnEditarContacto = document.getElementById('btn-editar-informacion-contacto');
    
    // Contenedores
    const contenedorDatos = document.getElementById('contenido-datos-personales');
    const contenedorContacto = document.getElementById('contenido-informacion-contacto');
    
    // Botones de Acción
    const btnsDatos = document.getElementById('botones-datos-personales');
    const btnsContacto = document.getElementById('botones-informacion-contacto');
    
    const btnGuardarDatos = document.getElementById('btn-guardar-datos-personales');
    const btnCancelarDatos = document.getElementById('btn-cancelar-datos-personales');
    const btnGuardarContacto = document.getElementById('btn-guardar-informacion-contacto');
    const btnCancelarContacto = document.getElementById('btn-cancelar-informacion-contacto');

    // Modal
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    const modalLogout = document.getElementById('modal-logout');
    const btnModalVolver = document.getElementById('btn-volver');
    const btnModalConfirmar = document.getElementById('btn-confirmar-cancelar');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    let seccionEditandoActual = null;

    // Foto de perfil
    const btnEditarFoto = document.getElementById('btn-editar-foto');
    const btnEliminarFoto = document.getElementById('btn-eliminar-foto');
    const inputFoto = document.getElementById('input-foto');
    const imagenPerfil = document.getElementById('imagen-perfil');
    const fotoPerfilClick = document.getElementById('foto-perfil-click');
    const modalFotoGrande = document.getElementById('modal-foto-grande');
    const modalImagenGrande = document.getElementById('modal-imagen-grande');
    const cerrarModalFoto = document.getElementById('cerrar-modal-foto');
    const modalEliminarFoto = document.getElementById('modal-eliminar-foto');
    const btnCancelarEliminarFoto = document.getElementById('btn-cancelar-eliminar-foto');
    const btnConfirmarEliminarFoto = document.getElementById('btn-confirmar-eliminar-foto');
    
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

    function validarCampos() {
        const errores = [];
        
        const inputNombre = document.querySelector('.input-edicion[data-campo="nombre"]');
        if (inputNombre && !inputNombre.value.trim()) {
            errores.push('El nombre completo es obligatorio');
        }
        
        const inputRFC = document.querySelector('.input-edicion[data-campo="rfc"]');
        if (inputRFC) {
            const resultadoRFC = validarRFC(inputRFC.value);
            if (!resultadoRFC.valido) {
                errores.push(resultadoRFC.mensaje);
                mostrarMensajeValidacion(inputRFC, resultadoRFC);
            }
        }
        
        const inputCURP = document.querySelector('.input-edicion[data-campo="curp"]');
        if (inputCURP) {
            const resultadoCURP = validarCURP(inputCURP.value);
            if (!resultadoCURP.valido) {
                errores.push(resultadoCURP.mensaje);
                mostrarMensajeValidacion(inputCURP, resultadoCURP);
            }
        }
        
        const inputTelefono = document.querySelector('.input-edicion[data-campo="telefono"]');
        if (inputTelefono) {
            const resultadoTelefono = validarTelefono(inputTelefono.value);
            if (!resultadoTelefono.valido) {
                errores.push(resultadoTelefono.mensaje);
                mostrarMensajeValidacion(inputTelefono, resultadoTelefono);
            }
        }
        
        if (errores.length > 0) {
            alert('Por favor corrige los siguientes errores:\n\n' + errores.join('\n'));
            return false;
        }
        
        return true;
    }

    // ===== 1. CARGAR DATOS DEL BACKEND =====
    async function cargarPerfil() {
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
            console.log("Datos Admin recibidos:", usuario);

            rolUsuarioActual = usuario.idRol || 1;

            actualizarInterfaz(usuario);
            datosUsuarioOriginales = { ...usuario };
            
            // Cargar foto de perfil si existe
            if (usuario.img && usuario.img.trim() !== "") {
                let urlFoto;
                if (usuario.img.startsWith('http')) {
                    urlFoto = usuario.img;
                } else {
                    const rutaLimpia = usuario.img.startsWith('/') ? usuario.img : `/${usuario.img}`;
                    urlFoto = `${API_BASE_URL}${rutaLimpia}`;
                }
                
                if (imagenPerfil) imagenPerfil.src = urlFoto;
                if (modalImagenGrande) modalImagenGrande.src = urlFoto;
                
                // Mostrar botón eliminar solo si no es la foto por defecto
                if (btnEliminarFoto && !usuario.img.includes('default') && !usuario.img.includes('avatar-default')) {
                    btnEliminarFoto.style.display = 'flex';
                }
            } else {
                const fotoDefault = '../src/avatar-default.png';
                if (imagenPerfil) imagenPerfil.src = fotoDefault;
                if (modalImagenGrande) modalImagenGrande.src = fotoDefault;
            }

            // Cargar estadísticas
            await cargarEstadisticas();

        } catch (error) {
            console.error(error);
            mostrarNotificacion("Error cargando datos: " + error.message, 'error');
        }
    }

    // ===== CARGAR ESTADÍSTICAS =====
    async function cargarEstadisticas() {
        try {
            const response = await fetch(`${API_BASE_URL}/estadisticas/${usuarioId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const datos = await response.json();
                console.log("Estadísticas recibidas:", datos);
                
                // Actualizar las tarjetas de estadísticas
                actualizarEstadisticas(datos);
            } else {
                console.warn("No se pudieron cargar estadísticas, usando valores por defecto");
            }
        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
            // No mostramos error al usuario, simplemente dejamos los valores en 0
        }
    }

    function actualizarEstadisticas(datos) {
        // Actualizar objeto de estadísticas
        estadisticas = {
            publicaciones: datos.publicaciones || 0,
            asesorias: datos.asesorias || 0,
            clientes: datos.clientes || 0
        };

        // Actualizar el DOM
        const numerosEstadisticas = document.querySelectorAll('.numero-estadistica');
        if (numerosEstadisticas.length >= 3) {
            numerosEstadisticas[0].textContent = estadisticas.publicaciones;
            numerosEstadisticas[1].textContent = estadisticas.asesorias;
            numerosEstadisticas[2].textContent = estadisticas.clientes;
        }
    }

    function actualizarInterfaz(usuario) {
        // Concatenar nombre completo para mostrar
        const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''} ${usuario.segundoApellido || ''}`.trim();
        
        // 1. Encabezado
        if(nombreUsuarioHeader) nombreUsuarioHeader.textContent = nombreCompleto;
        if(rolUsuarioHeader) rolUsuarioHeader.textContent = obtenerNombreRol(usuario.idRol);
        
        // 2. Datos Personales
        setTexto('nombre', nombreCompleto);
        setInput('nombre', nombreCompleto);
        
        setTexto('rfc', usuario.rfc || '');
        setInput('rfc', usuario.rfc || '');

        setTexto('curp', usuario.curp || '');
        setInput('curp', usuario.curp || '');
        
        // 3. Información de Contacto
        setTexto('telefono', usuario.telefono || '');
        setInput('telefono', usuario.telefono || '');
        
        setTexto('email', usuario.correo || '');
        setInput('email', usuario.correo || '');
    }

    function obtenerNombreRol(idRol) {
        const roles = {
            1: 'Administrador',
            2: 'Asesor',
            3: 'Cliente'
        };
        return roles[idRol] || 'Usuario';
    }

    // Helpers
    function setTexto(dataCampo, valor) {
        const el = document.querySelector(`.valor-campo[data-campo="${dataCampo}"]`);
        if (el) el.textContent = valor;
    }
    function setInput(dataCampo, valor) {
        const el = document.querySelector(`.input-edicion[data-campo="${dataCampo}"]`);
        if (el) el.value = valor;
    }

    // ===== 2. GUARDAR DATOS (PUT) =====
    async function guardarCambios() {
        // Validar campos antes de guardar
        if (!validarCampos()) {
            return;
        }

        try {
            // 1. Obtener datos
            const nombreCompleto = document.querySelector('.input-edicion[data-campo="nombre"]').value.trim();
            const partes = nombreCompleto.split(/\s+/); 
            const nombre = partes[0] || "";
            const apellido = partes[1] || "";
            const segundoApellido = partes.slice(2).join(" ") || ""; 

            const payload = {
                idUsuario: parseInt(usuarioId),
                nombre: nombre,
                apellido: apellido,
                segundoApellido: segundoApellido,
                rfc: document.querySelector('.input-edicion[data-campo="rfc"]').value.trim().toUpperCase(),
                curp: document.querySelector('.input-edicion[data-campo="curp"]').value.trim().toUpperCase(),
                telefono: document.querySelector('.input-edicion[data-campo="telefono"]').value.trim().replace(/\D/g, ''),
                correo: document.querySelector('.input-edicion[data-campo="email"]').value.trim(),
                idRol: rolUsuarioActual,
                estado: datosUsuarioOriginales.estado || 'activo'
            };

            console.log("📤 Enviando actualización:", payload);

            const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            // Capturar respuesta cruda para detectar errores
            const textoRespuesta = await response.text();
            console.log("Respuesta CRUDA del servidor:", textoRespuesta);

            if (!response.ok) {
                throw new Error("El servidor respondió con error: " + textoRespuesta);
            }

            // Intentar convertir a JSON solo si la respuesta fue OK
            let data;
            try {
                data = JSON.parse(textoRespuesta);
            } catch (e) {
                // Si el servidor respondió OK pero envió texto plano
                data = payload;
            }

            // Limpiar mensajes de validación
            const inputRFC = document.querySelector('.input-edicion[data-campo="rfc"]');
            const inputCURP = document.querySelector('.input-edicion[data-campo="curp"]');
            const inputTelefono = document.querySelector('.input-edicion[data-campo="telefono"]');
            
            if (inputRFC) limpiarMensajeValidacion(inputRFC);
            if (inputCURP) limpiarMensajeValidacion(inputCURP);
            if (inputTelefono) limpiarMensajeValidacion(inputTelefono);

            mostrarNotificacion("✅ Datos actualizados correctamente", 'success');
            
            // Actualizar datos locales
            datosUsuarioOriginales = { ...datosUsuarioOriginales, ...payload }; 
            
            desactivarEdicion(contenedorDatos, btnsDatos, btnEditarDatos);
            desactivarEdicion(contenedorContacto, btnsContacto, btnEditarContacto);
            
            actualizarInterfaz(payload);
            
            // Recargar para confirmar cambios
            await cargarPerfil();

        } catch (error) {
            console.error(error);
            mostrarNotificacion("Error al guardar: " + error.message, 'error');
        }
    }

    // ===== 3. SUBIR FOTO DE PERFIL =====
    if (btnEditarFoto) {
        btnEditarFoto.addEventListener('click', () => inputFoto.click());
    }

    if (inputFoto) {
        inputFoto.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const archivo = this.files[0];

                // Validar tipo
                if (!archivo.type.startsWith('image/')) {
                    mostrarNotificacion('Por favor selecciona un archivo de imagen válido', 'error');
                    return;
                }

                // Validar tamaño (máx 5MB)
                if (archivo.size > 5 * 1024 * 1024) {
                    mostrarNotificacion("La imagen es muy pesada (Máx 5MB)", 'error');
                    return;
                }

                // Previsualización local
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (imagenPerfil) imagenPerfil.src = e.target.result;
                    if (modalImagenGrande) modalImagenGrande.src = e.target.result;
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
                        console.log("Foto guardada en:", data.url);
                        
                        const urlFoto = `${API_BASE_URL}${data.url}`;
                        
                        if (imagenPerfil) imagenPerfil.src = urlFoto;
                        if (modalImagenGrande) modalImagenGrande.src = urlFoto;
                        
                        if (btnEliminarFoto) btnEliminarFoto.style.display = 'flex';
                        
                        mostrarNotificacion("✅ Foto actualizada correctamente", 'success');
                    } else {
                        throw new Error("Error al subir foto");
                    }
                } catch (error) {
                    console.error(error);
                    mostrarNotificacion("No se pudo guardar la foto", 'error');
                }
            }
        });
    }

    // ===== 4. ELIMINAR FOTO DE PERFIL =====
    if (btnEliminarFoto) {
        btnEliminarFoto.addEventListener('click', function(e) {
            e.stopPropagation();
            abrirModal(modalEliminarFoto);
        });
    }

    if (btnConfirmarEliminarFoto) {
        btnConfirmarEliminarFoto.addEventListener('click', async function() {
            try {
                const response = await fetch(`${API_BASE_URL}/usuario/${usuarioId}/foto`, {
                    method: 'DELETE',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                if (response.ok) {
                    const fotoDefault = '../src/avatar-default.png';
                    if (imagenPerfil) imagenPerfil.src = fotoDefault;
                    if (modalImagenGrande) modalImagenGrande.src = fotoDefault;
                    
                    if (btnEliminarFoto) btnEliminarFoto.style.display = 'none';
                    
                    cerrarModal(modalEliminarFoto);
                    mostrarNotificacion("✅ Foto eliminada correctamente", 'success');
                } else {
                    throw new Error("Error al eliminar foto");
                }
            } catch (error) {
                console.error(error);
                mostrarNotificacion("No se pudo eliminar la foto", 'error');
            }
        });
    }

    if (btnCancelarEliminarFoto) {
        btnCancelarEliminarFoto.addEventListener('click', () => cerrarModal(modalEliminarFoto));
    }

    // ===== 5. VER FOTO EN GRANDE =====
    if (fotoPerfilClick) {
        fotoPerfilClick.addEventListener('click', function(e) {
            if (!e.target.closest('#btn-editar-foto') && !e.target.closest('#btn-eliminar-foto')) {
                abrirModal(modalFotoGrande);
            }
        });
    }

    if (cerrarModalFoto) {
        cerrarModalFoto.addEventListener('click', () => cerrarModal(modalFotoGrande));
    }

    if (modalFotoGrande) {
        modalFotoGrande.addEventListener('click', function(e) {
            if (e.target === modalFotoGrande) {
                cerrarModal(modalFotoGrande);
            }
        });
    }

    // ===== 6. LÓGICA DE INTERFAZ (EDICIÓN) =====
    function activarEdicion(contenedor, botonesDiv, botonEditar) {
        modoEdicionActivo = true;
        contenedor.querySelectorAll('.valor-campo').forEach(el => el.style.display = 'none');
        contenedor.querySelectorAll('.input-edicion').forEach(el => el.style.display = 'block');
        botonesDiv.style.display = 'flex';
        botonEditar.style.visibility = 'hidden'; 
    }

    function desactivarEdicion(contenedor, botonesDiv, botonEditar) {
        modoEdicionActivo = false;
        contenedor.querySelectorAll('.valor-campo').forEach(el => el.style.display = 'block');
        contenedor.querySelectorAll('.input-edicion').forEach(el => el.style.display = 'none');
        botonesDiv.style.display = 'none';
        botonEditar.style.visibility = 'visible';
        
        // Limpiar mensajes de validación
        const inputRFC = document.querySelector('.input-edicion[data-campo="rfc"]');
        const inputCURP = document.querySelector('.input-edicion[data-campo="curp"]');
        const inputTelefono = document.querySelector('.input-edicion[data-campo="telefono"]');
        
        if (inputRFC) limpiarMensajeValidacion(inputRFC);
        if (inputCURP) limpiarMensajeValidacion(inputCURP);
        if (inputTelefono) limpiarMensajeValidacion(inputTelefono);
    }

    function cancelarEdicionActual() {
        actualizarInterfaz(datosUsuarioOriginales);
        if (seccionEditandoActual === 'datos') {
            desactivarEdicion(contenedorDatos, btnsDatos, btnEditarDatos);
        } else if (seccionEditandoActual === 'contacto') {
            desactivarEdicion(contenedorContacto, btnsContacto, btnEditarContacto);
        }
        cerrarModal(modalConfirmacion);
    }

    // ===== 7. MODALES =====
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

    // ===== EVENT LISTENERS - VALIDACIÓN EN TIEMPO REAL =====
    const inputRFC = document.querySelector('.input-edicion[data-campo="rfc"]');
    if (inputRFC) {
        inputRFC.addEventListener('input', function() {
            if (modoEdicionActivo) {
                const resultado = validarRFC(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
        
        inputRFC.addEventListener('blur', function() {
            if (modoEdicionActivo && this.value.trim()) {
                const resultado = validarRFC(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
    }

    const inputCURP = document.querySelector('.input-edicion[data-campo="curp"]');
    if (inputCURP) {
        inputCURP.addEventListener('input', function() {
            if (modoEdicionActivo) {
                const resultado = validarCURP(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
        
        inputCURP.addEventListener('blur', function() {
            if (modoEdicionActivo && this.value.trim()) {
                const resultado = validarCURP(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
    }

    const inputTelefono = document.querySelector('.input-edicion[data-campo="telefono"]');
    if (inputTelefono) {
        inputTelefono.addEventListener('input', function() {
            if (modoEdicionActivo) {
                const resultado = validarTelefono(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
        
        inputTelefono.addEventListener('blur', function() {
            if (modoEdicionActivo && this.value.trim()) {
                const resultado = validarTelefono(this.value);
                mostrarMensajeValidacion(this, resultado);
            }
        });
    }

    // ===== EVENT LISTENERS =====

    // Editar
    if(btnEditarDatos) btnEditarDatos.addEventListener('click', () => {
        seccionEditandoActual = 'datos';
        activarEdicion(contenedorDatos, btnsDatos, btnEditarDatos);
    });

    if(btnEditarContacto) btnEditarContacto.addEventListener('click', () => {
        seccionEditandoActual = 'contacto';
        activarEdicion(contenedorContacto, btnsContacto, btnEditarContacto);
    });

    // Guardar
    if(btnGuardarDatos) btnGuardarDatos.addEventListener('click', guardarCambios);
    if(btnGuardarContacto) btnGuardarContacto.addEventListener('click', guardarCambios);

    // Cancelar
    function abrirModalConfirmacion() { abrirModal(modalConfirmacion); }
    if(btnCancelarDatos) btnCancelarDatos.addEventListener('click', abrirModalConfirmacion);
    if(btnCancelarContacto) btnCancelarContacto.addEventListener('click', abrirModalConfirmacion);

    // Modal Confirmación
    if(btnModalVolver) btnModalVolver.addEventListener('click', () => cerrarModal(modalConfirmacion));
    if(btnModalConfirmar) btnModalConfirmar.addEventListener('click', cancelarEdicionActual);

    // Cerrar modal confirmación al hacer clic fuera
    if(modalConfirmacion) {
        modalConfirmacion.addEventListener('click', function(e) {
            if (e.target === modalConfirmacion) {
                cerrarModal(modalConfirmacion);
            }
        });
    }

    // Cerrar modal eliminar foto al hacer clic fuera
    if(modalEliminarFoto) {
        modalEliminarFoto.addEventListener('click', function(e) {
            if (e.target === modalEliminarFoto) {
                cerrarModal(modalEliminarFoto);
            }
        });
    }

    // Notificaciones
    function mostrarNotificacion(msg, tipo) {
        if(!notificacion) return alert(msg);
        mensajeNotificacion.textContent = msg;
        notificacion.className = `notificacion-banner ${tipo === 'error' ? 'error' : ''} mostrar`;
        setTimeout(() => { notificacion.classList.remove('mostrar'); }, 4000);
    }
    if(cerrarNotificacionBtn) cerrarNotificacionBtn.addEventListener('click', () => notificacion.classList.remove('mostrar'));

    // Menú Hamburguesa
    const botonMenu = document.getElementById('boton-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    if (botonMenu) {
        botonMenu.addEventListener('click', () => {
            menuLateral.classList.toggle('abierto');
            overlayMenu.classList.toggle('activo');
            botonMenu.classList.toggle('activo');
        });
    }
    if(overlayMenu) {
        overlayMenu.addEventListener('click', () => {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
            botonMenu.classList.remove('activo');
        });
    }

    // Logout
    const btnLogout = document.getElementById('logout-button');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal(modalLogout);
        });
    }

    if (btnLogoutVolver) {
        btnLogoutVolver.addEventListener('click', () => cerrarModal(modalLogout));
    }

    if (btnLogoutConfirmar) {
        btnLogoutConfirmar.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../paginas/Rol_Usuario.html';
        });
    }

    // Cerrar modal logout al hacer clic fuera
    if(modalLogout) {
        modalLogout.addEventListener('click', function(e) {
            if (e.target === modalLogout) {
                cerrarModal(modalLogout);
            }
        });
    }

    // Tecla ESC para cerrar modales
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modalConfirmacion && modalConfirmacion.classList.contains('activo')) {
                cerrarModal(modalConfirmacion);
            }
            if (modalLogout && modalLogout.classList.contains('activo')) {
                cerrarModal(modalLogout);
            }
            if (modalFotoGrande && modalFotoGrande.classList.contains('activo')) {
                cerrarModal(modalFotoGrande);
            }
            if (modalEliminarFoto && modalEliminarFoto.classList.contains('activo')) {
                cerrarModal(modalEliminarFoto);
            }
        }
    });

    // Inicializar
    await cargarPerfil();
    console.log('✅ Perfil Administrador con Backend Iniciado');
});