// Define la ruta de redirección al perfil del cliente
const RUTA_PERFIL_CLIENTE = '../paginas/Perfil_Cliente.html';
// Constante para la longitud exacta de la contraseña
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
            mostrarError('general', 'El almacenamiento está lleno. Por favor, limpia algunos datos.');
        } else if (e.name === 'SecurityError') {
            mostrarError('general', 'El almacenamiento no está disponible en modo incógnito.');
        } else {
            mostrarError('general', 'No se pudo guardar la información. Intenta de nuevo.');
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
 * Mostrar mensaje de error en el input
 */
function mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    
    if (input) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }
    
    if (errorSpan) {
        errorSpan.textContent = mensaje;
        errorSpan.classList.add('show');
        errorSpan.classList.remove('valid', 'mensaje-ayuda');
    }
}

/**
 * Limpiar mensaje de error del input
 */
function limpiarError(inputId) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    
    if (input) {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
    }
    
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('show', 'valid', 'mensaje-ayuda');
    }
}

/**
 * Función para alternar la visibilidad de la contraseña
 */
function togglePassword() {
    try {
        const inputPassword = document.getElementById('password');
        const iconoOjo = document.getElementById('icono-ojo');
        
        if (!inputPassword || !iconoOjo) return;
        
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
 * Deshabilitar botón de envío
 */
function deshabilitarBoton(boton) {
    if (boton) {
        boton.disabled = true;
        boton.textContent = 'Iniciando sesión...';
        boton.setAttribute('aria-busy', 'true');
    }
}

/**
 * Habilitar botón de envío
 */
function habilitarBoton(boton) {
    if (boton) {
        boton.disabled = false;
        boton.textContent = 'Iniciar Sesión';
        boton.setAttribute('aria-busy', 'false');
    }
}

// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        // ===== BOTÓN TOGGLE PASSWORD =====
        const toggleBtn = document.getElementById('toggle-password-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', togglePassword);
        }
        
        // ===== FORMULARIO DE LOGIN =====
        const formulario = document.querySelector('.login-form');
        
        if (!formulario) {
            console.error('Formulario no encontrado');
            return;
        }
        
        formulario.addEventListener('submit', async function(evento) {
            evento.preventDefault();
            
            if (enviandoFormulario) return;
            
            // Limpiar errores previos
            limpiarError('email');
            limpiarError('password');
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (!emailInput || !passwordInput) {
                alert('Error: Campos del formulario no encontrados');
                return;
            }
            
            const email = emailInput.value?.trim() || '';
            const password = passwordInput.value || '';
            
            let hayErrores = false;
            
            // Validación de email
            if (!email) {
                mostrarError('email', 'El email es requerido');
                hayErrores = true;
            } else if (!validarEmail(email)) {
                mostrarError('email', 'Por favor ingresa un email válido');
                hayErrores = true;
            }
            
            // Validación de contraseña (exactamente 12)
            if (!password) {
                mostrarError('password', 'La contraseña es requerida');
                hayErrores = true;
            } else if (password.length !== EXACT_PASSWORD_LENGTH) {
                mostrarError('password', `La contraseña debe tener exactamente ${EXACT_PASSWORD_LENGTH} caracteres`);
                hayErrores = true;
            }
            
            if (hayErrores) {
                return;
            }
            
            enviandoFormulario = true;
            const botonEnviar = document.getElementById('btn-submit');
            deshabilitarBoton(botonEnviar);
            
            try {
                const credenciales = {
                    correo: email,
                    contrasena: password
                };

                const respuesta = await ApiService.post('/login', credenciales);
                console.log('Login exitoso:', respuesta);

                if (respuesta.token) {
                    localStorage.setItem('token', respuesta.token);
                    localStorage.setItem('usuarioId', respuesta.id);
                    localStorage.setItem('usuarioRol', respuesta.rol);
                } else {
                    throw new Error('El servidor no devolvió un token de acceso');
                }

                setTimeout(() => {
                    if (respuesta.rol === 1) {
                        window.location.href = '../paginas/Perfil_Administrador.html';
                    } else if (respuesta.rol === 2) {
                        window.location.href = RUTA_PERFIL_CLIENTE;
                    } else if (respuesta.rol === 3) {
                        window.location.href = '../paginas/Perfil_Asesor.html';
                    }
                }, 500);

            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                
                habilitarBoton(botonEnviar);
                enviandoFormulario = false;
                
                const mensaje = error.message.toLowerCase();
                
                if (mensaje.includes('inactivo') || mensaje.includes('desactivada')) {
                    mostrarError('email', 'Tu cuenta ha sido desactivada');
                    mostrarError('password', 'Tu cuenta ha sido desactivada');
                } else if (mensaje.includes('contraseña') || mensaje.includes('password')) {
                    mostrarError('password', 'Contraseña incorrecta');
                } else if (mensaje.includes('correo') || mensaje.includes('usuario') || mensaje.includes('not found')) {
                    mostrarError('email', 'Este correo no está registrado');
                } else {
                    alert('Error de conexión: ' + error.message);
                }
            }
        });
        
        // ===== VALIDACIÓN EN TIEMPO REAL =====
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        // Limpiar error al escribir en email
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    limpiarError('email');
                }
            });
            
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !validarEmail(email)) {
                    mostrarError('email', 'Email inválido');
                }
            });
        }
        
        // ===== VALIDACIÓN DINÁMICA PARA CONTRASEÑA (SIN BORDE ROJO) =====
        if (passwordInput) {
            const passwordErrorSpan = document.getElementById('password-error');

            // Mensaje inicial (solo texto rojo, SIN borde rojo)
            if (passwordErrorSpan) {
                passwordErrorSpan.textContent = `Debe tener ${EXACT_PASSWORD_LENGTH} caracteres.`;
                passwordErrorSpan.classList.add('show');
                passwordErrorSpan.classList.remove('valid', 'mensaje-ayuda');
            }

            passwordInput.addEventListener('input', function() {
                const longitudActual = this.value.length;
                
                if (longitudActual === 0) {
                    // Solo texto rojo, sin borde
                    if (passwordErrorSpan) {
                        passwordErrorSpan.textContent = `Debe tener ${EXACT_PASSWORD_LENGTH} caracteres.`;
                        passwordErrorSpan.classList.add('show');
                        passwordErrorSpan.classList.remove('valid', 'mensaje-ayuda');
                    }
                    this.classList.remove('error');
                    this.setAttribute('aria-invalid', 'false');
                } else if (longitudActual < EXACT_PASSWORD_LENGTH) {
                    const faltan = EXACT_PASSWORD_LENGTH - longitudActual;
                    // Solo texto rojo, sin borde
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
            });
        }
        
        console.log('✅ Formulario de inicio de sesión inicializado correctamente');
        
    } catch (error) {
        console.error('Error crítico al inicializar:', error);
        alert('Error al cargar la página. Por favor, recarga.');
    }
});

// ===== CLEANUP AL SALIR =====
window.addEventListener('beforeunload', function() {
    enviandoFormulario = false;
});

// ===== MANEJO DE TECLA ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        limpiarError('email');
        limpiarError('password');
    }
});