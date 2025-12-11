document.addEventListener('DOMContentLoaded', async function() {

    // ===== CONFIGURACIÓN API =====
    const API_BASE_URL = 'http://localhost:7001';
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');

    if (!token || !usuarioId) {
        window.location.href = '../paginas/Rol_Usuario.html';
        return;
    }
    
    // ===== ELEMENTOS DEL DOM =====
    const botonHamburguesa = document.getElementById('boton-hamburguesa');
    const menuLateral = document.getElementById('menu-lateral');
    const overlayMenu = document.getElementById('overlay-menu');
    const enlacesMenu = document.querySelectorAll('.item-menu');
    
    // Logout
    const logoutButton = document.getElementById('logout-button');
    const modalLogout = document.getElementById('modal-logout');
    const btnLogoutVolver = document.getElementById('btn-logout-volver');
    const btnLogoutConfirmar = document.getElementById('btn-logout-confirmar');
    
    // Avatar y nombre
    const avatarGrande = document.getElementById('avatar-grande');
    const inicialesAvatar = document.getElementById('iniciales-avatar');
    const fotoPerfil = document.getElementById('foto-perfil');
    const nombreCompleto = document.getElementById('nombre-completo');
    const botonCambiarFoto = document.getElementById('boton-cambiar-foto');
    const botonEliminarFoto = document.getElementById('boton-eliminar-foto');
    const inputFoto = document.getElementById('input-foto');
    
    // Modal foto ampliada
    const modalFotoAmpliada = document.getElementById('modal-foto-ampliada');
    const fotoAmpliada = document.getElementById('foto-ampliada');
    const btnCerrarFoto = document.getElementById('btn-cerrar-foto');
    
    // Modal eliminar foto
    const modalEliminarFoto = document.getElementById('modal-eliminar-foto');
    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    
    // Botones principales
    const btnEditar = document.getElementById('btn-editar');
    const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
    const btnGuardarCambios = document.getElementById('btn-guardar-cambios');
    const contenedorBotones = document.getElementById('contenedor-botones');
    const contenedorBotonesEdicion = document.getElementById('contenedor-botones-edicion');
    
    // Modales
    const modalCancelar = document.getElementById('modal-cancelar');
    const modalConfirmarGuardar = document.getElementById('modal-confirmar-guardar');
    const btnVolver = document.getElementById('btn-volver');
    const btnSiCancelar = document.getElementById('btn-si-cancelar');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const btnAceptarModal = document.getElementById('btn-aceptar-modal');
    
    // Alerta
    const alertaExito = document.getElementById('alerta-exito');
    const cerrarAlerta = document.getElementById('cerrar-alerta');
    
    // Campos del formulario (Solo los que existen en el Backend)
    const campos = {
        nombre: {
            display: document.getElementById('display-nombre'),
            input: document.getElementById('input-nombre')
        },
        curp: {
            display: document.getElementById('display-curp'),
            input: document.getElementById('input-curp')
        },
        tel: {
            display: document.getElementById('display-telefono-prin'),
            input: document.getElementById('input-telefono-prin')
        },
        rfc: {
            display: document.getElementById('display-rfc'),
            input: document.getElementById('input-rfc')
        }
    };
    
    // Variables de estado
    let modoEdicionActivo = false;
    let datosUsuarioOriginales = {}; // Para guardar todos los datos del backend
    
    // ===== INICIALIZACIÓN =====
    await cargarPerfil();
    
    // ===== CARGAR PERFIL DESDE API =====
    async function cargarPerfil() {
        try {
            const res = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error("Error cargando perfil");
            }
            
            const usuario = await res.json();
            console.log("✅ Datos recibidos del backend:", usuario);
            
            // Guardamos todo el objeto para no perder datos al guardar
            datosUsuarioOriginales = usuario;

            // Preparar nombre completo
            const nombreCompletoTexto = `${usuario.nombre || ''} ${usuario.apellido || ''} ${usuario.segundoApellido || ''}`.trim();
            
            // Actualizar Encabezado
            if (nombreCompleto) nombreCompleto.textContent = nombreCompletoTexto;
            if (inicialesAvatar) inicialesAvatar.textContent = getIniciales(usuario.nombre, usuario.apellido);

            // Actualizar Campos Específicos
            actualizarCampo('nombre', nombreCompletoTexto);
            actualizarCampo('curp', usuario.curp);
            actualizarCampo('rfc', usuario.rfc);
            actualizarCampo('tel', usuario.telefono);
            
            // Cargar foto si existe en localStorage
            cargarFotoDesdeLocalStorage();

        } catch (e) {
            console.error('❌ Error al cargar perfil:', e);
            alert('Error al cargar los datos del perfil');
        }
    }
    
    function actualizarCampo(clave, valor) {
        if (campos[clave]) {
            const val = valor || '';
            if (campos[clave].display) campos[clave].display.textContent = val;
            if (campos[clave].input) campos[clave].input.value = val;
        }
    }
    
    function getIniciales(nom, ape) {
        const n = nom ? nom[0] : '';
        const a = ape ? ape[0] : '';
        return (n + a).toUpperCase();
    }
    // ===== AGREGAR DESPUÉS DE LAS VARIABLES DE ESTADO =====
// (Agregar después de: let datosUsuarioOriginales = {};)

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
    
    if (!campos.nombre.input.value.trim()) {
        errores.push('El nombre completo es obligatorio');
    }
    
    const resultadoRFC = validarRFC(campos.rfc.input.value);
    if (!resultadoRFC.valido) {
        errores.push(resultadoRFC.mensaje);
        mostrarMensajeValidacion(campos.rfc.input, resultadoRFC);
    }
    
    const resultadoCURP = validarCURP(campos.curp.input.value);
    if (!resultadoCURP.valido) {
        errores.push(resultadoCURP.mensaje);
        mostrarMensajeValidacion(campos.curp.input, resultadoCURP);
    }
    
    const resultadoTelefono = validarTelefono(campos.tel.input.value);
    if (!resultadoTelefono.valido) {
        errores.push(resultadoTelefono.mensaje);
        mostrarMensajeValidacion(campos.tel.input, resultadoTelefono);
    }
    
    if (errores.length > 0) {
        alert('Por favor corrige los siguientes errores:\n\n' + errores.join('\n'));
        return false;
    }
    
    return true;
}


// ===== MODIFICAR LA FUNCIÓN guardarCambios() =====
// (Reemplazar la función completa)

async function guardarCambios() {
    // Validar campos antes de guardar
    if (!validarCampos()) {
        cerrarModal(modalConfirmarGuardar);
        return;
    }
    
    try {
        // 1. Obtener nombre completo del input
        const nombreCompletoInput = campos.nombre.input.value.trim();
        const partes = nombreCompletoInput.split(/\s+/);
        
        const nombre = partes[0] || "";
        const apellido = partes[1] || "";
        const segundoApellido = partes.slice(2).join(" ") || ""; 

        // 2. Construir Payload (Combinando datos nuevos con los originales)
        const payload = {
            idUsuario: parseInt(usuarioId),
            nombre: nombre,
            apellido: apellido,
            segundoApellido: segundoApellido,
            
            rfc: campos.rfc.input.value.trim().toUpperCase(),
            curp: campos.curp.input.value.trim().toUpperCase(),
            telefono: campos.tel.input.value.trim().replace(/\D/g, ''),
            
            // Datos obligatorios del backend que NO se editan aquí
            correo: datosUsuarioOriginales.correo, 
            idRol: datosUsuarioOriginales.idRol,
            estado: datosUsuarioOriginales.estado || 'activo'
        };

        console.log("📤 Enviando al backend:", payload);

        const res = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log("✅ Perfil actualizado exitosamente");
            
            // Actualizar el nombre completo en el header
            const nombreCompletoNuevo = `${nombre} ${apellido} ${segundoApellido}`.trim();
            if (nombreCompleto) nombreCompleto.textContent = nombreCompletoNuevo;
            if (inicialesAvatar) inicialesAvatar.textContent = getIniciales(nombre, apellido);
            
            // Actualizar displays
            Object.keys(campos).forEach(key => {
                if (campos[key].display && campos[key].input) {
                    campos[key].display.textContent = campos[key].input.value;
                }
            });
            
            // Limpiar mensajes de validación
            limpiarMensajeValidacion(campos.rfc.input);
            limpiarMensajeValidacion(campos.curp.input);
            limpiarMensajeValidacion(campos.tel.input);
            
            mostrarAlerta('Se actualizaron tus datos');
            desactivarModoEdicion();
            cerrarModal(modalConfirmarGuardar);
            
            // Recargar para confirmar cambios
            await cargarPerfil();
        } else {
            const error = await res.json();
            console.error("❌ Error del servidor:", error);
            alert("Error al actualizar perfil: " + (error.message || 'Error desconocido'));
        }

    } catch (e) { 
        console.error('❌ Error al guardar:', e);
        alert('Error de conexión al guardar los cambios');
    }
}


// ===== MODIFICAR LA FUNCIÓN desactivarModoEdicion() =====
// (Agregar al final de la función existente)

function desactivarModoEdicion() {
    modoEdicionActivo = false;
    
    Object.keys(campos).forEach(key => {
        if (campos[key].display && campos[key].input) {
            campos[key].display.style.display = 'block';
            campos[key].input.style.display = 'none';
        }
    });
    
    // AGREGAR ESTAS LÍNEAS:
    limpiarMensajeValidacion(campos.rfc.input);
    limpiarMensajeValidacion(campos.curp.input);
    limpiarMensajeValidacion(campos.tel.input);
    
    if (contenedorBotones) contenedorBotones.style.display = 'flex';
    if (contenedorBotonesEdicion) contenedorBotonesEdicion.style.display = 'none';
}


// ===== MODIFICAR LA FUNCIÓN restaurarDatos() =====
// (Agregar al final de la función existente)

function restaurarDatos() {
    // Restaurar valores originales del backend
    const u = datosUsuarioOriginales;
    const nombreC = `${u.nombre} ${u.apellido} ${u.segundoApellido}`.trim();
    actualizarCampo('nombre', nombreC);
    actualizarCampo('curp', u.curp);
    actualizarCampo('rfc', u.rfc);
    actualizarCampo('tel', u.telefono);
    
    // AGREGAR ESTAS LÍNEAS:
    limpiarMensajeValidacion(campos.rfc.input);
    limpiarMensajeValidacion(campos.curp.input);
    limpiarMensajeValidacion(campos.tel.input);
}


// ===== AGREGAR AL FINAL, ANTES DE console.log('✅ Perfil Asesor...') =====

// ===== EVENT LISTENERS - VALIDACIÓN EN TIEMPO REAL =====
if (campos.rfc && campos.rfc.input) {
    campos.rfc.input.addEventListener('input', function() {
        if (modoEdicionActivo) {
            const resultado = validarRFC(this.value);
            mostrarMensajeValidacion(this, resultado);
        }
    });
    
    campos.rfc.input.addEventListener('blur', function() {
        if (modoEdicionActivo && this.value.trim()) {
            const resultado = validarRFC(this.value);
            mostrarMensajeValidacion(this, resultado);
        }
    });
}

if (campos.curp && campos.curp.input) {
    campos.curp.input.addEventListener('input', function() {
        if (modoEdicionActivo) {
            const resultado = validarCURP(this.value);
            mostrarMensajeValidacion(this, resultado);
        }
    });
    
    campos.curp.input.addEventListener('blur', function() {
        if (modoEdicionActivo && this.value.trim()) {
            const resultado = validarCURP(this.value);
            mostrarMensajeValidacion(this, resultado);
        }
    });
}

if (campos.tel && campos.tel.input) {
    campos.tel.input.addEventListener('input', function() {
        if (modoEdicionActivo) {
            const resultado = validarTelefono(this.value);
            mostrarMensajeValidacion(this, resultado);
        }
    });
    
    campos.tel.input.addEventListener('blur', function() {
        if (modoEdicionActivo && this.value.trim()) {
            const resultado = validarTelefono(this.value);
            mostrarMensajeValidacion(this, resultado);
        }
    });
}
    // ===== GUARDAR CAMBIOS EN API =====
    async function guardarCambios() {
        try {
            // 1. Obtener nombre completo del input
            const nombreCompletoInput = campos.nombre.input.value.trim();
            const partes = nombreCompletoInput.split(/\s+/);
            
            const nombre = partes[0] || "";
            const apellido = partes[1] || "";
            const segundoApellido = partes.slice(2).join(" ") || ""; 

            // 2. Construir Payload (Combinando datos nuevos con los originales)
            const payload = {
                idUsuario: parseInt(usuarioId),
                nombre: nombre,
                apellido: apellido,
                segundoApellido: segundoApellido,
                
                rfc: campos.rfc.input.value.trim(),
                curp: campos.curp.input.value.trim(),
                telefono: campos.tel.input.value.trim(),
                
                // Datos obligatorios del backend que NO se editan aquí
                correo: datosUsuarioOriginales.correo, 
                idRol: datosUsuarioOriginales.idRol,
                estado: datosUsuarioOriginales.estado || 'activo'
            };

            console.log(" Enviando al backend:", payload);

            const res = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log(" Perfil actualizado exitosamente");
                
                // Actualizar el nombre completo en el header
                const nombreCompletoNuevo = `${nombre} ${apellido} ${segundoApellido}`.trim();
                if (nombreCompleto) nombreCompleto.textContent = nombreCompletoNuevo;
                if (inicialesAvatar) inicialesAvatar.textContent = getIniciales(nombre, apellido);
                
                // Actualizar displays
                Object.keys(campos).forEach(key => {
                    if (campos[key].display && campos[key].input) {
                        campos[key].display.textContent = campos[key].input.value;
                    }
                });
                
                mostrarAlerta('Se actualizaron tus datos');
                desactivarModoEdicion();
                cerrarModal(modalConfirmarGuardar);
                
                // Recargar para confirmar cambios
                await cargarPerfil();
            } else {
                const error = await res.json();
                console.error(" Error del servidor:", error);
                alert("Error al actualizar perfil: " + (error.message || 'Error desconocido'));
            }

        } catch (e) { 
            console.error(' Error al guardar:', e);
            alert('Error de conexión al guardar los cambios');
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
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (menuLateral && menuLateral.classList.contains('abierto') && esMobile()) {
                cerrarMenu();
            }
            if (modalCancelar && modalCancelar.classList.contains('activo')) {
                cerrarModal(modalCancelar);
            }
            if (modalConfirmarGuardar && modalConfirmarGuardar.classList.contains('activo')) {
                cerrarModal(modalConfirmarGuardar);
            }
            if (modalLogout && modalLogout.classList.contains('activo')) {
                cerrarModal(modalLogout);
            }
            if (modalFotoAmpliada && modalFotoAmpliada.classList.contains('activo')) {
                cerrarFotoAmpliada();
            }
            if (modalEliminarFoto && modalEliminarFoto.classList.contains('activo')) {
                cerrarModal(modalEliminarFoto);
            }
        }
    });
    
    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });
    
    // ===== LOGOUT =====
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
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
    
    if (modalLogout) {
        modalLogout.addEventListener('click', function(e) {
            if (e.target === modalLogout) {
                cerrarModal(modalLogout);
            }
        });
    }
    
    // ===== FOTO DE PERFIL (LOCALSTORAGE) =====
    function cargarFotoDesdeLocalStorage() {
        const datosGuardados = localStorage.getItem('afgcorporacion_perfil_asesor');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            if (datos.fotoPerfil) {
                cargarFotoPerfil(datos.fotoPerfil);
            }
        }
    }
    
    function cargarFotoPerfil(fotoBase64) {
        if (fotoPerfil && fotoBase64) {
            fotoPerfil.src = fotoBase64;
            fotoPerfil.style.display = 'block';
            if (inicialesAvatar) {
                inicialesAvatar.style.display = 'none';
            }
            if (fotoAmpliada) {
                fotoAmpliada.src = fotoBase64;
            }
            if (botonEliminarFoto) {
                botonEliminarFoto.style.display = 'flex';
            }
        }
    }
    
    function abrirFotoAmpliada() {
        if (modalFotoAmpliada && fotoPerfil && fotoPerfil.style.display !== 'none') {
            fotoAmpliada.src = fotoPerfil.src;
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
    
    function cambiarFotoPerfil(event) {
        const archivo = event.target.files[0];
        
        if (archivo) {
            if (!archivo.type.match('image.*')) {
                alert('Por favor selecciona una imagen válida');
                return;
            }
            
            if (archivo.size > 5 * 1024 * 1024) {
                alert('La imagen es muy grande. Tamaño máximo: 5MB');
                return;
            }
            
            const lector = new FileReader();
            
            lector.onload = function(e) {
                const fotoBase64 = e.target.result;
                cargarFotoPerfil(fotoBase64);
                
                const datosGuardados = localStorage.getItem('afgcorporacion_perfil_asesor');
                let datos = datosGuardados ? JSON.parse(datosGuardados) : {};
                datos.fotoPerfil = fotoBase64;
                localStorage.setItem('afgcorporacion_perfil_asesor', JSON.stringify(datos));
                
                mostrarAlerta('Foto de perfil actualizada');
            };
            
            lector.onerror = function() {
                alert('Error al cargar la imagen. Por favor intenta de nuevo.');
            };
            
            lector.readAsDataURL(archivo);
        }
    }
    
    function eliminarFotoPerfil() {
        if (fotoPerfil) {
            fotoPerfil.style.display = 'none';
            fotoPerfil.src = '';
        }
        
        if (inicialesAvatar) {
            inicialesAvatar.style.display = 'block';
        }
        
        if (botonEliminarFoto) {
            botonEliminarFoto.style.display = 'none';
        }
        
        const datosGuardados = localStorage.getItem('afgcorporacion_perfil_asesor');
        if (datosGuardados) {
            let datos = JSON.parse(datosGuardados);
            delete datos.fotoPerfil;
            localStorage.setItem('afgcorporacion_perfil_asesor', JSON.stringify(datos));
        }
        
        cerrarModal(modalEliminarFoto);
        mostrarAlerta('Foto de perfil eliminada');
    }
    
    // ===== MODO EDICIÓN =====
    function activarModoEdicion() {
        modoEdicionActivo = true;
        
        Object.keys(campos).forEach(key => {
            if (campos[key].display && campos[key].input) {
                campos[key].display.style.display = 'none';
                campos[key].input.style.display = 'block';
            }
        });
        
        if (contenedorBotones) contenedorBotones.style.display = 'none';
        if (contenedorBotonesEdicion) contenedorBotonesEdicion.style.display = 'flex';
    }
    
    function desactivarModoEdicion() {
        modoEdicionActivo = false;
        
        Object.keys(campos).forEach(key => {
            if (campos[key].display && campos[key].input) {
                campos[key].display.style.display = 'block';
                campos[key].input.style.display = 'none';
            }
        });
        
        if (contenedorBotones) contenedorBotones.style.display = 'flex';
        if (contenedorBotonesEdicion) contenedorBotonesEdicion.style.display = 'none';
    }
    
    function restaurarDatos() {
        // Restaurar valores originales del backend
        const u = datosUsuarioOriginales;
        const nombreC = `${u.nombre} ${u.apellido} ${u.segundoApellido}`.trim();
        actualizarCampo('nombre', nombreC);
        actualizarCampo('curp', u.curp);
        actualizarCampo('rfc', u.rfc);
        actualizarCampo('tel', u.telefono);
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
    
    // ===== ALERTA DE ÉXITO =====
    function mostrarAlerta(mensaje = 'Se Actualizaron tus datos') {
        if (alertaExito) {
            const textoAlerta = alertaExito.querySelector('.alerta-titulo');
            if (textoAlerta) {
                textoAlerta.textContent = mensaje;
            }
            
            alertaExito.classList.add('mostrar');
            
            setTimeout(() => {
                ocultarAlerta();
            }, 4000);
        }
    }
    
    function ocultarAlerta() {
        if (alertaExito) {
            alertaExito.classList.remove('mostrar');
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    // Cambiar foto
    if (botonCambiarFoto) {
        botonCambiarFoto.addEventListener('click', function(e) {
            e.stopPropagation();
            if (inputFoto) inputFoto.click();
        });
    }
    
    if (inputFoto) {
        inputFoto.addEventListener('change', cambiarFotoPerfil);
    }
    
    // Eliminar foto
    if (botonEliminarFoto) {
        botonEliminarFoto.addEventListener('click', function(e) {
            e.stopPropagation();
            abrirModal(modalEliminarFoto);
        });
    }
    
    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', function() {
            cerrarModal(modalEliminarFoto);
        });
    }
    
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', eliminarFotoPerfil);
    }
    
    if (modalEliminarFoto) {
        modalEliminarFoto.addEventListener('click', function(e) {
            if (e.target === modalEliminarFoto) {
                cerrarModal(modalEliminarFoto);
            }
        });
    }
    
    // Ver foto ampliada
    if (avatarGrande) {
        avatarGrande.addEventListener('click', function(e) {
            if (!e.target.closest('.boton-cambiar-foto') && !e.target.closest('.boton-eliminar-foto')) {
                abrirFotoAmpliada();
            }
        });
    }
    
    if (btnCerrarFoto) {
        btnCerrarFoto.addEventListener('click', cerrarFotoAmpliada);
    }
    
    if (modalFotoAmpliada) {
        modalFotoAmpliada.addEventListener('click', function(e) {
            if (e.target === modalFotoAmpliada) {
                cerrarFotoAmpliada();
            }
        });
    }
    
    // Edición
    if (btnEditar) {
        btnEditar.addEventListener('click', activarModoEdicion);
    }
    
    if (btnCancelarEdicion) {
        btnCancelarEdicion.addEventListener('click', function() {
            abrirModal(modalCancelar);
        });
    }
    
    if (btnVolver) {
        btnVolver.addEventListener('click', function() {
            cerrarModal(modalCancelar);
        });
    }
    
    if (btnSiCancelar) {
        btnSiCancelar.addEventListener('click', function() {
            restaurarDatos();
            desactivarModoEdicion();
            cerrarModal(modalCancelar);
        });
    }
    
    if (btnGuardarCambios) {
        btnGuardarCambios.addEventListener('click', function() {
            abrirModal(modalConfirmarGuardar);
        });
    }
    
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', function() {
            cerrarModal(modalConfirmarGuardar);
        });
    }
    
    if (btnAceptarModal) {
        btnAceptarModal.addEventListener('click', guardarCambios);
    }
    
    if (cerrarAlerta) {
        cerrarAlerta.addEventListener('click', ocultarAlerta);
    }
    
    [modalCancelar, modalConfirmarGuardar].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    cerrarModal(modal);
                }
            });
        }
    });
    
    console.log('✅ Perfil Asesor AFGCORPORACIÓN cargado correctamente con conexión API');
});