// ===== RECUPERAR CONTRASEÑA - JAVASCRIPT INTEGRADO CON BACKEND =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CONFIGURACIÓN DEL API =====
     // <-- CAMBIAR AQUÍ POR TU SERVIDOR
     // <-- CAMBIAR AQUÍ POR TU SERVIDOR
   const API_BASE_URL = 'http://localhost:7001';
    // ===== CÓDIGO PARA BOTÓN REGRESAR =====
    const botonRegresar = document.querySelector(".boton-regresar");

    if (botonRegresar) {
        botonRegresar.addEventListener("click", function(evento) {
            evento.preventDefault(); 
            window.history.back();   
        });
    }
    
    // ===== VARIABLES GLOBALES =====
    let emailUsuario = '';
    let tiempoRestante = 180; // 3 minutos (180 segundos)
    let intervalTemporizador = null;
    
    // ===== ELEMENTOS DEL DOM =====
    const paso1 = document.getElementById('paso-1');
    const paso2 = document.getElementById('paso-2');
    const paso3 = document.getElementById('paso-3');
    const paso4 = document.getElementById('paso-4');
    
    const formularioEmail = document.getElementById('formulario-email');
    const formularioCodigo = document.getElementById('formulario-codigo');
    const formularioPassword = document.getElementById('formulario-password');
    
    const inputEmail = document.getElementById('email-recuperar');
    const inputCodigo = document.getElementById('codigo-verificacion');
    const inputNuevaPassword = document.getElementById('nueva-password');
    const inputConfirmarPassword = document.getElementById('confirmar-password');
    
    const botonEnviarCodigo = document.getElementById('boton-enviar-codigo');
    const botonVerificarCodigo = document.getElementById('boton-verificar-codigo');
    const botonReenviarCodigo = document.getElementById('boton-reenviar-codigo');
    const botonCambiarPassword = document.getElementById('boton-cambiar-password');
    const botonIrLogin = document.getElementById('boton-ir-login');
    
    const alternarNueva = document.getElementById('alternar-nueva');
    const alternarConfirmar = document.getElementById('alternar-confirmar');
    
    const temporizadorDisplay = document.getElementById('temporizador');
    const emailMostrar = document.getElementById('email-mostrar');
    
    // ===== FUNCIONES DE UTILIDAD =====
    
    function validarEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }
    
    function mostrarError(inputId, mensaje) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`error-${inputId.replace('email-recuperar', 'email').replace('codigo-verificacion', 'codigo').replace('nueva-password', 'nueva').replace('confirmar-password', 'confirmar')}`);
        
        if (input) input.classList.add('error');
        if (errorSpan) {
            errorSpan.textContent = mensaje;
            errorSpan.classList.add('show');
        }
    }
    
    function limpiarError(inputId) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`error-${inputId.replace('email-recuperar', 'email').replace('codigo-verificacion', 'codigo').replace('nueva-password', 'nueva').replace('confirmar-password', 'confirmar')}`);
        
        if (input) input.classList.remove('error');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }
    }
    
    function irAPaso(numeroPaso) {
        [paso1, paso2, paso3, paso4].forEach(paso => paso.classList.remove('activo'));
        
        if (numeroPaso === 1) paso1.classList.add('activo');
        else if (numeroPaso === 2) paso2.classList.add('activo');
        else if (numeroPaso === 3) paso3.classList.add('activo');
        else if (numeroPaso === 4) paso4.classList.add('activo');
    }
    
    // ===== SISTEMA DE ALERTAS =====
    
    function mostrarAlerta(tipo, titulo, mensaje) {
        const alertaModal = document.getElementById('alerta-personalizada');
        const iconoAlerta = document.getElementById('icono-alerta');
        const tituloAlerta = document.getElementById('titulo-alerta');
        const mensajeAlerta = document.getElementById('mensaje-alerta');
        
        iconoAlerta.className = 'icono-alerta';
        iconoAlerta.classList.add(tipo);
        
        let iconoSVG = '';
        
        if (tipo === 'exito') {
            iconoSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else if (tipo === 'error') {
            iconoSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        } else if (tipo === 'advertencia') {
            iconoSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        } else {
            iconoSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }
        
        iconoAlerta.innerHTML = iconoSVG;
        tituloAlerta.textContent = titulo;
        mensajeAlerta.textContent = mensaje;
        
        alertaModal.classList.add('show');
    }
    
    function cerrarAlerta() {
        const alertaModal = document.getElementById('alerta-personalizada');
        alertaModal.classList.remove('show');
    }
    
    const cerrarAlertaBtn = document.getElementById('cerrar-alerta');
    const alertaPersonalizada = document.getElementById('alerta-personalizada');
    
    if (cerrarAlertaBtn) {
        cerrarAlertaBtn.addEventListener('click', cerrarAlerta);
    }
    
    if (alertaPersonalizada) {
        alertaPersonalizada.addEventListener('click', function(e) {
            if (e.target === alertaPersonalizada) {
                cerrarAlerta();
            }
        });
    }
    
    // ===== TEMPORIZADOR =====
    
    function iniciarTemporizador() {
        tiempoRestante = 180; // 3 minutos
        
        if (intervalTemporizador) {
            clearInterval(intervalTemporizador);
        }
        
        intervalTemporizador = setInterval(() => {
            tiempoRestante--;
            
            const minutos = Math.floor(tiempoRestante / 60);
            const segundos = tiempoRestante % 60;
            
            if (temporizadorDisplay) {
                temporizadorDisplay.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
            }
            
            if (tiempoRestante <= 0) {
                clearInterval(intervalTemporizador);
                mostrarAlerta('advertencia', 'Código expirado', 'El código ha expirado. Por favor, solicita uno nuevo.');
                if (botonReenviarCodigo) {
                    botonReenviarCodigo.disabled = false;
                }
            }
        }, 1000);
    }
    
    function detenerTemporizador() {
        if (intervalTemporizador) {
            clearInterval(intervalTemporizador);
        }
    }
    
    // ===== PASO 1: VALIDAR Y ENVIAR CÓDIGO =====
    
    if (formularioEmail) {
        formularioEmail.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            limpiarError('email-recuperar');
            
            const email = inputEmail.value.trim();
            
            if (!email) {
                mostrarError('email-recuperar', 'El email es requerido');
                return;
            }
            
            if (!validarEmail(email)) {
                mostrarError('email-recuperar', 'Ingresa un email válido');
                return;
            }
            
            botonEnviarCodigo.disabled = true;
            botonEnviarCodigo.textContent = 'Validando correo...';
            
            try {
                // PASO 1: Validar que el correo exista en el sistema
                const respuestaValidacion = await fetch(`${API_BASE_URL}/usuarios/validar-correo`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ correo: email })
                });
                
                const dataValidacion = await respuestaValidacion.json();
                
                if (!respuestaValidacion.ok || !dataValidacion.ok) {
                    mostrarError('email-recuperar', 'El correo no existe en el sistema');
                    mostrarAlerta('error', 'Correo no encontrado', 'El correo ingresado no está registrado en el sistema.');
                    botonEnviarCodigo.disabled = false;
                    botonEnviarCodigo.textContent = 'Enviar código de verificación';
                    return;
                }
                
                console.log('✅ Usuario encontrado:', dataValidacion.usuario);
                
                // PASO 2: Enviar código de recuperación
                botonEnviarCodigo.textContent = 'Enviando código...';
                
                const respuestaEnvio = await fetch(`${API_BASE_URL}/recuperar-password/enviar-codigo`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ correo: email })
                });
                
                const dataEnvio = await respuestaEnvio.json();
                
                if (!respuestaEnvio.ok) {
                    throw new Error(dataEnvio.mensaje || 'Error al enviar el código');
                }
                
                // ÉXITO: Guardar email y pasar al siguiente paso
                emailUsuario = email;
                
                if (emailMostrar) {
                    emailMostrar.textContent = emailUsuario;
                }
                
                iniciarTemporizador();
                irAPaso(2);
                mostrarAlerta('exito', '¡Código enviado!', dataEnvio.mensaje || `Hemos enviado un código de verificación a ${emailUsuario}`);
                
            } catch (error) {
                console.error('❌ Error:', error);
                mostrarError('email-recuperar', 'No se pudo enviar el código');
                mostrarAlerta('error', 'Error', error.message || 'No se pudo enviar el código de verificación. Intenta nuevamente.');
            } finally {
                botonEnviarCodigo.disabled = false;
                botonEnviarCodigo.textContent = 'Enviar código de verificación';
            }
        });
    }
    
    if (inputEmail) {
        inputEmail.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                limpiarError('email-recuperar');
            }
        });
        
        inputEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !validarEmail(email)) {
                mostrarError('email-recuperar', 'Email inválido');
            }
        });
    }
    
    // ===== PASO 2: VERIFICAR CÓDIGO =====
    
    if (formularioCodigo) {
        formularioCodigo.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            limpiarError('codigo-verificacion');
            
            const codigo = inputCodigo.value.trim();
            
            if (!codigo) {
                mostrarError('codigo-verificacion', 'Ingresa el código de verificación');
                return;
            }
            
            if (codigo.length !== 6) {
                mostrarError('codigo-verificacion', 'El código debe tener 6 dígitos');
                return;
            }
            
            botonVerificarCodigo.disabled = true;
            botonVerificarCodigo.textContent = 'Verificando...';
            
            try {
                const respuesta = await fetch(`${API_BASE_URL}/recuperar-password/verificar-codigo`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        correo: emailUsuario,
                        codigo: codigo
                    })
                });
                
                if (!respuesta.ok) {
                    const errorText = await respuesta.text();
                    throw new Error(errorText || 'Código incorrecto');
                }
                
                const resultado = await respuesta.text();
                
                // ÉXITO: Código verificado
                detenerTemporizador();
                irAPaso(3);
                mostrarAlerta('exito', '¡Código verificado!', resultado || 'Ahora puedes crear tu nueva contraseña');
                
            } catch (error) {
                console.error('❌ Error al verificar:', error);
                mostrarError('codigo-verificacion', 'Código incorrecto');
                mostrarAlerta('error', 'Código incorrecto', error.message || 'El código que ingresaste no es válido. Por favor, verifica e intenta nuevamente.');
            } finally {
                botonVerificarCodigo.disabled = false;
                botonVerificarCodigo.textContent = 'Verificar código';
            }
        });
    }
    
    if (inputCodigo) {
        inputCodigo.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.classList.contains('error')) {
                limpiarError('codigo-verificacion');
            }
        });
    }
    
    if (botonReenviarCodigo) {
        botonReenviarCodigo.addEventListener('click', async function() {
            this.disabled = true;
            this.textContent = 'Reenviando...';
            
            try {
                const respuesta = await fetch(`${API_BASE_URL}/recuperar-password/enviar-codigo`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ correo: emailUsuario })
                });
                
                const data = await respuesta.json();
                
                if (!respuesta.ok) {
                    throw new Error(data.mensaje || 'Error al reenviar el código');
                }
                
                iniciarTemporizador();
                mostrarAlerta('exito', 'Código reenviado', data.mensaje || `Hemos enviado un nuevo código a ${emailUsuario}`);
                inputCodigo.value = '';
                
            } catch (error) {
                console.error('❌ Error al reenviar:', error);
                mostrarAlerta('error', 'Error', error.message || 'No se pudo reenviar el código. Intenta nuevamente.');
            } finally {
                this.disabled = false;
                this.textContent = '¿No recibiste el código? Reenviar';
            }
        });
    }
    
    // ===== PASO 3: NUEVA CONTRASEÑA =====
    
    if (alternarNueva) {
        alternarNueva.addEventListener('click', function() {
            const tipo = inputNuevaPassword.type === 'password' ? 'text' : 'password';
            inputNuevaPassword.type = tipo;
        });
    }
    
    if (alternarConfirmar) {
        alternarConfirmar.addEventListener('click', function() {
            const tipo = inputConfirmarPassword.type === 'password' ? 'text' : 'password';
            inputConfirmarPassword.type = tipo;
        });
    }
    
    function validarRequisitosPassword() {
        const password = inputNuevaPassword.value;
        const confirmar = inputConfirmarPassword.value;
        
        const reqLongitud = document.getElementById('req-longitud');
        const reqCoinciden = document.getElementById('req-coinciden');
        
        if (reqLongitud) {
            if (password.length >= 12) {
                reqLongitud.textContent = '✓';
                reqLongitud.classList.remove('invalido');
                reqLongitud.classList.add('valido');
            } else {
                reqLongitud.textContent = '○';
                reqLongitud.classList.remove('valido');
                reqLongitud.classList.add('invalido');
            }
        }
        
        if (reqCoinciden) {
            if (password && confirmar && password === confirmar) {
                reqCoinciden.textContent = '✓';
                reqCoinciden.classList.remove('invalido');
                reqCoinciden.classList.add('valido');
            } else {
                reqCoinciden.textContent = '○';
                reqCoinciden.classList.remove('valido');
                reqCoinciden.classList.add('invalido');
            }
        }
    }
    
    if (inputNuevaPassword) {
        inputNuevaPassword.addEventListener('input', function() {
            validarRequisitosPassword();
            
            if (this.classList.contains('error')) {
                limpiarError('nueva-password');
            }
        });
    }
    
    if (inputConfirmarPassword) {
        inputConfirmarPassword.addEventListener('input', function() {
            validarRequisitosPassword();
            
            if (this.classList.contains('error')) {
                limpiarError('confirmar-password');
            }
        });
    }
    
    if (formularioPassword) {
        formularioPassword.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            limpiarError('nueva-password');
            limpiarError('confirmar-password');
            
            const password = inputNuevaPassword.value;
            const confirmar = inputConfirmarPassword.value;
            
            let hayErrores = false;
            
            if (!password) {
                mostrarError('nueva-password', 'La contraseña es requerida');
                hayErrores = true;
            } else if (password.length < 8) {
                mostrarError('nueva-password', 'La contraseña debe tener al menos 8 caracteres');
                hayErrores = true;
            }
            
            if (!confirmar) {
                mostrarError('confirmar-password', 'Confirma tu contraseña');
                hayErrores = true;
            } else if (password !== confirmar) {
                mostrarError('confirmar-password', 'Las contraseñas no coinciden');
                hayErrores = true;
            }
            
            if (hayErrores) return;
            
            botonCambiarPassword.disabled = true;
            botonCambiarPassword.textContent = 'Cambiando contraseña...';
            
            try {
                const respuesta = await fetch(`${API_BASE_URL}/recuperar-password/cambiar-password`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        correo: emailUsuario,
                        nuevaPassword: password
                    })
                });
                
                if (!respuesta.ok) {
                    const errorText = await respuesta.text();
                    throw new Error(errorText || 'Error al cambiar la contraseña');
                }
                
                const resultado = await respuesta.text();
                
                // ÉXITO: Contraseña cambiada
                console.log('✅ Contraseña actualizada exitosamente para:', emailUsuario);
                
                irAPaso(4);
                mostrarAlerta('exito', '¡Contraseña actualizada!', resultado || 'Tu contraseña ha sido cambiada exitosamente');
                
            } catch (error) {
                console.error('❌ Error al cambiar contraseña:', error);
                mostrarAlerta('error', 'Error al actualizar', error.message || 'No se pudo cambiar la contraseña. Intenta nuevamente.');
            } finally {
                botonCambiarPassword.disabled = false;
                botonCambiarPassword.textContent = 'Cambiar contraseña';
            }
        });
    }
    
    // ===== PASO 4: ÉXITO =====
    
    if (botonIrLogin) {
        botonIrLogin.addEventListener('click', function() {
            window.history.back();
        });
    }

});