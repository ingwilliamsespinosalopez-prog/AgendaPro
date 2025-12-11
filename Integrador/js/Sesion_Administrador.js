// ===== SESION ADMINISTRADOR - JAVASCRIPT CON CONEXIÓN API =====

// Define la ruta de redirección al perfil del administrador
const RUTA_PERFIL_ADMIN = '../paginas/Perfil_Administrador.html';
const API_BASE_URL = 'http://localhost:7001';
const EXACT_PASSWORD_LENGTH = 12;

// Variable para prevenir envíos múltiples
let enviandoFormulario = false;

/**
 * Función segura para guardar en localStorage
 */
function guardarEnLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);

        if (e.name === 'QuotaExceededError') {
            mostrarErrorGeneral('El almacenamiento está lleno. Por favor, limpia algunos datos.');
        } else if (e.name === 'SecurityError') {
            mostrarErrorGeneral('El almacenamiento no está disponible en modo incógnito.');
        } else {
            mostrarErrorGeneral('No se pudo guardar la información. Intenta de nuevo.');
        }
        return false;
    }
}

/**
 * Validar email con regex robusto
 */
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(String(email).toLowerCase());
}

/**
 * Mostrar error en un campo
 */
function mostrarErrorCampo(inputId, mensaje) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);

    if (input) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }

    if (errorSpan) {
        errorSpan.textContent = mensaje;
        errorSpan.classList.add('show');
        errorSpan.classList.remove('valid');
    }
}

/**
 * Limpiar error en campo
 */
function limpiarErrorCampo(inputId) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);

    if (input) {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
    }

    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('show');
        errorSpan.classList.remove('valid');
    }
}

/**
 * Mostrar error general
 */
function mostrarErrorGeneral(mensaje) {
    const mensajeError = document.getElementById('mensaje-error');
    if (mensajeError) {
        mensajeError.textContent = mensaje;
    }
}

/**
 * Limpiar error general
 */
function limpiarErrorGeneral() {
    const mensajeError = document.getElementById('mensaje-error');
    if (mensajeError) {
        mensajeError.textContent = '';
    }
}


/**
 * Alternar visibilidad de contraseña
 */
function togglePassword() {
    try {
        const inputPassword = document.getElementById('password');
        const iconoOjo = document.getElementById('icono-ojo');

        if (!inputPassword || !iconoOjo) {
            console.error('Elementos no encontrados');
            return;
        }

        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
            iconoOjo.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            inputPassword.type = 'password';
            iconoOjo.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    } catch (error) {
        console.error('Error en togglePassword:', error);
    }
}

/**
 * Deshabilitar botón
 */
function deshabilitarBoton(boton) {
    if (boton) {
        boton.disabled = true;
        boton.textContent = 'Iniciando sesión...';
        boton.setAttribute('aria-busy', 'true');
    }
}

/**
 * Habilitar botón
 */
function habilitarBoton(boton) {
    if (boton) {
        boton.disabled = false;
        boton.textContent = 'Iniciar Sesión';
        boton.setAttribute('aria-busy', 'false');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('✅ Iniciando sistema de login para administradores...');
        
        const toggleBtn = document.getElementById('toggle-password-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', togglePassword);
        }

        const formulario = document.getElementById('login-form');
        if (!formulario) {
            console.error('Formulario no encontrado');
            return;
        }

        // ===== LISTENER DEL FORMULARIO CON CONEXIÓN API =====
        formulario.addEventListener('submit', async function(evento) {
            evento.preventDefault();

            if (enviandoFormulario) return;

            limpiarErrorCampo('email');
            limpiarErrorCampo('password');
            limpiarErrorGeneral();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!emailInput || !passwordInput) {
                alert('Error: Campos no encontrados');
                return;
            }

            const email = emailInput.value?.trim() || '';
            const password = passwordInput.value || '';

            let hayErrores = false;

            // ===== VALIDACIONES =====
            if (!email) {
                mostrarErrorCampo('email', 'El email es requerido');
                hayErrores = true;
            } else if (!validarEmail(email)) {
                mostrarErrorCampo('email', 'Por favor ingresa un email válido');
                hayErrores = true;
            }

            if (!password) {
                mostrarErrorCampo('password', 'La contraseña es requerida');
                hayErrores = true;
            } else if (password.length !== EXACT_PASSWORD_LENGTH) {
                mostrarErrorCampo('password', `La contraseña debe tener exactamente ${EXACT_PASSWORD_LENGTH} caracteres`);
                hayErrores = true;
            }

            if (hayErrores) return;

            enviandoFormulario = true;
            const botonEnviar = document.getElementById('btn-submit');
            deshabilitarBoton(botonEnviar);

            try {
                console.log("📡 Enviando petición a:", `${API_BASE_URL}/login`);
                
                // ===== PETICIÓN FETCH A LA API =====
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        correo: email,
                        contrasena: password
                    })
                });

                // Verificar si la respuesta es exitosa
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.result || data.error || 'Credenciales incorrectas');
                }

                // Leer respuesta JSON solo si fue exitosa
                const data = await response.json();
                console.log("✅ Login exitoso:", data);

                // ===== VERIFICAR ROL (Seguridad Frontend) =====
                // Asumiendo: 1=Admin, 2=Cliente, 3=Asesor
                if (data.rol !== 1) { 
                    throw new Error("Esta cuenta no tiene permisos de Administrador.");
                }

                // ===== GUARDAR SESIÓN EN LOCALSTORAGE =====
                guardarEnLocalStorage('token', data.token);
                guardarEnLocalStorage('usuarioId', data.id);
                guardarEnLocalStorage('usuarioRol', data.rol);
                
                // Guardar datos adicionales del perfil
                const datosAdmin = {
                    id: data.id,
                    email: email,
                    rol: data.rol,
                    nombre: data.nombre || '',
                    metodoAuth: 'email',
                    fechaLogin: new Date().toISOString()
                };

                guardarEnLocalStorage('afgcorporacion_admin_perfil', JSON.stringify(datosAdmin));
                guardarEnLocalStorage('afgcorporacion_auth_method', 'email');
                guardarEnLocalStorage('afgcorporacion_authenticated', 'true');
                guardarEnLocalStorage('afgcorporacion_user_role', 'administrador');

                console.log('✅ Administrador autenticado:', email);
                console.log('✅ Redirigiendo al perfil...');

                // ===== REDIRECCIÓN AL PERFIL =====
                setTimeout(() => {
                    window.location.href = RUTA_PERFIL_ADMIN;
                }, 500);

            } catch (error) {
                console.error('❌ Error de Login:', error);
                
                habilitarBoton(botonEnviar);
                enviandoFormulario = false;
                
                const mensaje = error.message.toLowerCase();
                
                // Manejo específico de errores según el tipo
                if (mensaje.includes('inactivo') || mensaje.includes('desactivada')) {
                    mostrarErrorCampo('email', 'Tu cuenta ha sido desactivada');
                    mostrarErrorCampo('password', 'Tu cuenta ha sido desactivada');
                } else if (mensaje.includes('contraseña') || 
                           mensaje.includes('password') || 
                           mensaje.includes('credenciales incorrectas') || 
                           mensaje.includes('incorrectos')) {
                    mostrarErrorCampo('password', 'Contraseña incorrecta');
                } else if (mensaje.includes('correo') || 
                           mensaje.includes('usuario') || 
                           mensaje.includes('not found') ||
                           mensaje.includes('no encontrado')) {
                    mostrarErrorCampo('email', 'Este correo no está registrado');
                } else if (mensaje.includes('permisos') || mensaje.includes('no tiene permisos')) {
                    mostrarErrorCampo('email', 'Esta cuenta no tiene permisos de Administrador');
                } else if (mensaje.includes('failed to fetch')) {
                    mostrarErrorGeneral('No se pudo conectar con el servidor. Verifica tu conexión.');
                } else {
                    mostrarErrorGeneral(error.message || 'Error de conexión con el servidor');
                }
            }
        });

        // ===== VALIDACIÓN EN TIEMPO REAL =====
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    limpiarErrorCampo('email');
                }
                limpiarErrorGeneral();
            });

            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !validarEmail(email)) {
                    mostrarErrorCampo('email', 'Email inválido');
                }
            });
        }

        // Validación en tiempo real para contraseña
        if (passInput) {
            const passwordErrorSpan = document.getElementById('password-error');

            // Mensaje inicial (solo texto rojo, SIN borde rojo en el input)
            if (passwordErrorSpan) {
                passwordErrorSpan.textContent = `Debe tener ${EXACT_PASSWORD_LENGTH} caracteres.`;
                passwordErrorSpan.classList.add('show');
                passwordErrorSpan.classList.remove('valid', 'mensaje-ayuda');
            }

            passInput.addEventListener('input', function() {
                const longitudActual = this.value.length;
                
                if (longitudActual === 0) {
                    // Solo texto rojo, sin borde rojo en el input
                    if (passwordErrorSpan) {
                        passwordErrorSpan.textContent = `Debe tener ${EXACT_PASSWORD_LENGTH} caracteres.`;
                        passwordErrorSpan.classList.add('show');
                        passwordErrorSpan.classList.remove('valid', 'mensaje-ayuda');
                    }
                    this.classList.remove('error');
                    this.setAttribute('aria-invalid', 'false');
                } else if (longitudActual < EXACT_PASSWORD_LENGTH) {
                    const faltan = EXACT_PASSWORD_LENGTH - longitudActual;
                    // Solo texto rojo, sin borde rojo en el input
                    if (passwordErrorSpan) {
                        passwordErrorSpan.textContent = `Faltan ${faltan} caracteres.`;
                        passwordErrorSpan.classList.add('show');
                        passwordErrorSpan.classList.remove('valid', 'mensaje-ayuda');
                    }
                    this.classList.remove('error');
                    this.setAttribute('aria-invalid', 'false');
                } else { 
                    // Longitud correcta (12 caracteres) - mensaje verde
                    if (passwordErrorSpan) {
                        passwordErrorSpan.textContent = '¡Longitud correcta!';
                        passwordErrorSpan.classList.remove('show');
                        passwordErrorSpan.classList.add('valid');
                    }
                    this.classList.remove('error');
                    this.setAttribute('aria-invalid', 'false');
                }
                // Limpiar el error general al escribir
                limpiarErrorGeneral();
            });
        }

        console.log('✅ Formulario inicializado');

    } catch (error) {
        console.error('Error crítico:', error);
        alert('Error al cargar la página. Recarga.');
    }
});

// ===== CLEANUP =====
window.addEventListener('beforeunload', function() {
    enviandoFormulario = false;
});

// ===== ESCAPE limpia errores =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        limpiarErrorCampo('email');
        limpiarErrorCampo('password');
        limpiarErrorGeneral();
    }
});