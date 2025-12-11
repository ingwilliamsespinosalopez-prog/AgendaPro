// Ruta de redirección al perfil del cliente
const RUTA_PERFIL_CLIENTE = '../paginas/Perfil_Cliente.html';
// Constante para la longitud de la contraseña
const MIN_CONTRASENA_LENGTH = 12;

// ========================================
// CONTENIDO DE POLÍTICAS Y TÉRMINOS
// ========================================

const CONTENIDO_POLITICA_PRIVACIDAD = `
    <h3>Introducción</h3>
    <p>En <strong>AFGCORPORACIÓN</strong>, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal cuando utilizas nuestros servicios de asesoría contable y fiscal.</p>
    
    <div style="background-color: #ebf8ff; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #2c5282;"><strong>Al utilizar nuestros servicios, aceptas las prácticas descritas en este documento.</strong> Te recomendamos leer esta política detenidamente.</p>
    </div>

    <h3>1. Información que Recopilamos</h3>
    <h4>Información personal</h4>
    <p>Recopilamos información que tú nos proporcionas directamente:</p>
    <ul>
        <li><strong>Datos de identificación:</strong> Nombre completo, RFC, CURP, fecha de nacimiento</li>
        <li><strong>Datos de contacto:</strong> Correo electrónico, teléfono, dirección postal</li>
        <li><strong>Datos fiscales:</strong> Régimen fiscal, actividad económica, situación fiscal</li>
        <li><strong>Datos financieros:</strong> Estados financieros, ingresos, egresos</li>
    </ul>

    <h4>Información técnica</h4>
    <p>Recopilamos automáticamente:</p>
    <ul>
        <li>Dirección IP y ubicación geográfica aproximada</li>
        <li>Tipo de navegador y sistema operativo</li>
        <li>Páginas visitadas y acciones realizadas</li>
        <li>Cookies y tecnologías similares</li>
    </ul>

    <h3>2. Cómo Utilizamos tu Información</h3>
    <p>Utilizamos tu información personal para:</p>
    <ol>
        <li><strong>Prestación de servicios:</strong> Proporcionar asesorías contables y fiscales</li>
        <li><strong>Gestión de cuenta:</strong> Administrar tu cuenta y preferencias</li>
        <li><strong>Comunicación:</strong> Responder consultas y enviar información relevante</li>
        <li><strong>Procesamiento de pagos:</strong> Gestionar cobros y emitir facturas</li>
        <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones fiscales y legales</li>
        <li><strong>Seguridad:</strong> Prevenir fraudes y proteger la integridad de nuestros servicios</li>
    </ol>

    <h3>3. Compartir tu Información</h3>
    <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #742a2a;"><strong>NUNCA vendemos ni alquilamos tu información personal.</strong></p>
    </div>
    <p>Solo compartimos tus datos cuando:</p>
    <ul>
        <li>Es necesario para proveedores de servicios (almacenamiento, pagos)</li>
        <li>La ley lo requiere (SAT, autoridades judiciales)</li>
        <li>Con profesionales colaboradores (con tu autorización)</li>
    </ul>

    <h3>4. Seguridad de tu Información</h3>
    <p>Implementamos medidas de seguridad técnicas y organizativas:</p>
    <ul>
        <li>Cifrado SSL/TLS para transmisión de datos</li>
        <li>Cifrado de datos almacenados</li>
        <li>Firewalls y sistemas de detección de intrusiones</li>
        <li>Autenticación de dos factores</li>
        <li>Acceso restringido basado en roles</li>
    </ul>

    <h3>5. Tus Derechos (Derechos ARCO)</h3>
    <p>Tienes derecho a:</p>
    <ul>
        <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
        <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
        <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos</li>
        <li><strong>Oposición:</strong> Oponerte al tratamiento para ciertos fines</li>
    </ul>
    <p>Para ejercer tus derechos, contacta: <strong>privacidad@afgcorporacion.com</strong></p>

    <h3>6. Contacto</h3>
    <p><strong>Email:</strong> privacidad@afgcorporacion.com<br>
    <strong>Teléfono:</strong> +52 960 115 2138<br>
    <strong>Dirección:</strong> Av. Siempre Viva 123, Ciudad</p>
    
    <p style="margin-top: 30px; font-size: 13px; color: #718096;">Última actualización: 14 de noviembre de 2025</p>
`;

const CONTENIDO_TERMINOS_CONDICIONES = `
    <h3>1. Aceptación de los Términos</h3>
    <p>Al acceder y utilizar nuestro sitio web y servicios, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo, no debe utilizar nuestros servicios.</p>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #78350f;"><strong>Estos términos constituyen un acuerdo legal entre usted y AFGCORPORACIÓN.</strong> Le recomendamos leerlos cuidadosamente.</p>
    </div>

    <h3>2. Descripción de los Servicios</h3>
    <p>AFGCORPORACIÓN ofrece servicios profesionales de asesoría contable y fiscal:</p>
    <ul>
        <li>Asesoría contable personalizada</li>
        <li>Consultoría fiscal</li>
        <li>Planeación fiscal</li>
        <li>Elaboración de declaraciones</li>
        <li>Auditorías contables</li>
        <li>Capacitación y talleres</li>
    </ul>

    <h3>3. Registro y Cuenta de Usuario</h3>
    <h4>Requisitos de Registro</h4>
    <p>Para utilizar ciertos servicios, debe crear una cuenta proporcionando información precisa:</p>
    <ul>
        <li>Nombre completo</li>
        <li>Correo electrónico válido</li>
        <li>Número de teléfono</li>
        <li>Información fiscal (cuando aplique)</li>
    </ul>

    <h4>Responsabilidad de la Cuenta</h4>
    <ul>
        <li>Mantener la confidencialidad de su contraseña</li>
        <li>Notificar uso no autorizado de su cuenta</li>
        <li>No transferir su cuenta a otra persona</li>
        <li>Debe tener al menos 18 años</li>
    </ul>

    <h3>4. Uso Aceptable</h3>
    <h4>Está Permitido:</h4>
    <ul>
        <li>Usar los servicios para propósitos legales</li>
        <li>Proporcionar información veraz</li>
        <li>Respetar derechos de propiedad intelectual</li>
    </ul>

    <h4>Está Prohibido:</h4>
    <ul>
        <li>Actividades ilegales o fraudulentas</li>
        <li>Proporcionar información falsa</li>
        <li>Acceder sin autorización a sistemas</li>
        <li>Transmitir virus o malware</li>
        <li>Copiar contenido sin autorización</li>
    </ul>

    <h3>5. Honorarios y Pagos</h3>
    <p>Los honorarios se establecen según el tipo de asesoría y complejidad del caso. Las tarifas se comunican claramente antes de contratar.</p>
    
    <h4>Política de Reembolsos</h4>
    <ul>
        <li>Pagos por servicios prestados no son reembolsables</li>
        <li>Reembolso de servicios no prestados con aviso mínimo de 48 horas</li>
        <li>Reembolsos procesados en 15 días hábiles</li>
        <li>Penalización del 10% por cancelaciones tardías</li>
    </ul>

    <h3>6. Responsabilidades del Cliente</h3>
    <p>Como cliente, usted se compromete a:</p>
    <ul>
        <li>Proporcionar información veraz y completa</li>
        <li>Entregar documentos necesarios en tiempo y forma</li>
        <li>Responder oportunamente a solicitudes</li>
        <li>Cumplir recomendaciones fiscales</li>
        <li>Pagar honorarios puntualmente</li>
    </ul>

    <h3>7. Limitación de Responsabilidad</h3>
    <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #742a2a;"><strong>AFGCORPORACIÓN no será responsable por daños indirectos o consecuentes derivados del uso de nuestros servicios.</strong></p>
    </div>
    <p>No somos responsables por:</p>
    <ul>
        <li>Información incorrecta proporcionada por el cliente</li>
        <li>Decisiones empresariales del cliente</li>
        <li>Cambios en legislación posterior al servicio</li>
        <li>Actuaciones de autoridades fiscales</li>
    </ul>

    <h3>8. Propiedad Intelectual</h3>
    <p>Todo el contenido es propiedad de AFGCORPORACIÓN y está protegido por leyes de derechos de autor.</p>

    <h3>9. Confidencialidad</h3>
    <p>Toda información compartida será tratada con estricta confidencialidad conforme a normas profesionales y legislación aplicable.</p>

    <h3>10. Ley Aplicable</h3>
    <p>Estos términos se rigen por las leyes de México. Cualquier disputa se resolverá en los tribunales competentes de Tuxtla Gutiérrez, Chiapas.</p>

    <h3>11. Contacto</h3>
    <p><strong>Email:</strong> legal@afgcorporacion.com<br>
    <strong>Teléfono:</strong> +52 960 115 2138<br>
    <strong>Dirección:</strong> Av. Siempre Viva 123, Ciudad</p>
    
    <p style="margin-top: 30px; font-size: 13px; color: #718096;">Última actualización: 14 de noviembre de 2025</p>
`;

// ========================================
// FUNCIONES DEL MODAL
// ========================================

function abrirModal(tipo) {
    const modal = document.getElementById('modal-politicas');
    const titulo = document.getElementById('modal-titulo');
    const body = document.getElementById('modal-body');
    
    if (tipo === 'politicas') {
        titulo.textContent = 'Política de Privacidad';
        body.innerHTML = CONTENIDO_POLITICA_PRIVACIDAD;
    } else if (tipo === 'terminos') {
        titulo.textContent = 'Términos y Condiciones';
        body.innerHTML = CONTENIDO_TERMINOS_CONDICIONES;
    }
    
    modal.classList.add('mostrar');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    const modal = document.getElementById('modal-politicas');
    modal.classList.remove('mostrar');
    document.body.style.overflow = '';
}

// ========================================
// FUNCIONES DE VALIDACIÓN
// ========================================

function mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    
    if (input && input.type !== 'checkbox') {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }
    
    if (errorSpan) {
        errorSpan.textContent = mensaje;
        errorSpan.classList.add('show');
        errorSpan.classList.remove('valid', 'mensaje-ayuda');
    }
}

function limpiarError(inputId) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    
    if (input && input.type !== 'checkbox') {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
    }
    
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('show', 'valid', 'mensaje-ayuda');
    }
}

function mostrarMensajeAyuda(inputId, mensaje, esValido = false) {
    const errorSpan = document.getElementById(`${inputId}-error`);
    if (errorSpan) {
        limpiarError(inputId);
        errorSpan.textContent = mensaje;
        if (esValido) {
            errorSpan.classList.add('valid');
        } else {
            errorSpan.classList.add('mensaje-ayuda');
        }
    }
}

// ========================================
// FUNCIONES ORIGINALES
// ========================================

function togglePassword(inputId) {
    const inputContraseña = document.getElementById(inputId);
    const iconoId = inputId === 'contraseña' ? 'icono-ojo' : 'icono-ojo-confirmar';
    const iconoOjo = document.getElementById(iconoId);
    
    if (!inputContraseña || !iconoOjo) {
        console.error("No se encontraron los elementos para togglePassword", inputId);
        return;
    }
    
    if (inputContraseña.type === 'password') {
        inputContraseña.type = 'text';
        iconoOjo.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        inputContraseña.type = 'password';
        iconoOjo.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
}

function crearCuentaConGoogle() {
    const checkboxPoliticas = document.getElementById('aceptar-politicas');
    if (!checkboxPoliticas.checked) {
        mostrarError('politicas', 'Debes aceptar las políticas para continuar con Google.');
        return;
    }
    
    limpiarError('politicas');
    
    console.log('Creando cuenta con Google...');
    
    localStorage.setItem('afgcorporacion_auth_method', 'google');
    localStorage.setItem('afgcorporacion_authenticated', 'true');
    
    const perfilGoogle = {
        nombreCompleto: 'Usuario de Google',
        email: 'usuario@gmail.com',
        metodoAuth: 'google',
        fechaRegistro: new Date().toISOString(),
        politicasAceptadas: true
    };
    
    localStorage.setItem('afgcorporacion_cliente_perfil', JSON.stringify(perfilGoogle));
    
    window.location.href = RUTA_PERFIL_CLIENTE;
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ENLACES DEL MODAL =====
    const linkPoliticas = document.getElementById('link-politicas');
    const linkTerminos = document.getElementById('link-terminos');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnFooterCerrar = document.getElementById('btn-footer-cerrar');
    const modal = document.getElementById('modal-politicas');
    
    if (linkPoliticas) {
        linkPoliticas.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal('politicas');
        });
    }
    
    if (linkTerminos) {
        linkTerminos.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal('terminos');
        });
    }
    
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModal);
    }
    
    if (btnFooterCerrar) {
        btnFooterCerrar.addEventListener('click', cerrarModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('mostrar')) {
            cerrarModal();
        }
    });
    
    // ===== BOTÓN DE GOOGLE =====
    const btnGoogle = document.getElementById('btn-google');
    
    if (btnGoogle) {
        btnGoogle.addEventListener('click', function(evento) {
            evento.preventDefault();
            crearCuentaConGoogle();
        });
    }

    // ===== BOTONES DE TOGGLE PASSWORD =====
    const btnToggle1 = document.getElementById('btn-toggle-pass1');
    const btnToggle2 = document.getElementById('btn-toggle-pass2');
    
    if (btnToggle1) {
        btnToggle1.addEventListener('click', () => togglePassword('contraseña'));
    }
    if (btnToggle2) {
        btnToggle2.addEventListener('click', () => togglePassword('confirmar-contraseña'));
    }

    // ===== CAMPOS DEL FORMULARIO =====
    const formulario = document.getElementById('form-registro');
    const emailInput = document.getElementById('email');
    const nombreInput = document.getElementById('nombre');
    const passInput = document.getElementById('contraseña');
    const confirmInput = document.getElementById('confirmar-contraseña');
    const politicasInput = document.getElementById('aceptar-politicas');
    
    // ===== FORMULARIO DE REGISTRO (ASYNC) =====
    if (formulario) {
        formulario.addEventListener('submit', async function(evento) {
            evento.preventDefault();
            
            // Limpiar errores previos
            limpiarError('email');
            limpiarError('nombre');
            limpiarError('contraseña');
            limpiarError('confirmar-contraseña');
            limpiarError('politicas');
            
            // Obtener valores
            const email = emailInput.value.trim();
            const nombre = nombreInput.value.trim();
            const contraseña = passInput.value;
            const confirmarContraseña = confirmInput.value;
            
            let hayErrores = false;
            
            // Validación de email
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                mostrarError('email', 'Por favor ingresa un email válido');
                hayErrores = true;
            }
            
            // Validación de nombre
            if (nombre.length < 3) {
                mostrarError('nombre', 'El nombre debe tener al menos 3 caracteres');
                hayErrores = true;
            }
            
            // Validación de contraseña
            if (contraseña.length < MIN_CONTRASENA_LENGTH) {
                mostrarError('contraseña', `La contraseña debe tener al menos ${MIN_CONTRASENA_LENGTH} caracteres`);
                hayErrores = true;
            }
            
            // Validación de confirmar contraseña
            if (confirmarContraseña.length === 0) {
                mostrarError('confirmar-contraseña', 'Debes confirmar tu contraseña');
                hayErrores = true;
            } else if (contraseña !== confirmarContraseña) {
                mostrarError('confirmar-contraseña', 'Las contraseñas no coinciden');
                hayErrores = true;
            }
            
            // Validación de políticas
            if (!politicasInput.checked) {
                mostrarError('politicas', 'Debes aceptar las políticas para continuar.');
                hayErrores = true;
            }
            
            if (hayErrores) {
                return;
            }
            
            // Separar el nombre completo
            const partesNombre = nombre.split(' ');
            const primerNombre = partesNombre[0];
            const primerApellido = partesNombre.length > 1 ? partesNombre[1] : 'Pendiente';
            const segundoApellido = partesNombre.length > 2 ? partesNombre[2] : 'Pendiente';

            const datosUsuario = {
                idRol: 2, // 2 = Cliente
                nombre: primerNombre,
                apellido: primerApellido,
                segundoApellido: segundoApellido,

                // Datos obligatorios en BD (Dummy Data)
                rfc: "XAXX010101000",
                curp: "XAXX010101HXXXXX00",
                telefono: "0000000000",
                img: null,

                // Datos reales
                correo: email,
                contrasena: contraseña
            };

            // Envío al Backend usando ApiService
            try {
                const respuesta = await ApiService.post('/registro', datosUsuario);

                console.log('Respuesta del servidor:', respuesta);

                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                window.location.href = RUTA_PERFIL_CLIENTE;

            } catch (error) {
                console.error('Error en registro:', error);

                const mensajeError = error.message.toLowerCase();

                if (mensajeError.includes('correo') || mensajeError.includes('email') || mensajeError.includes('duplicate')) {
                    mostrarError('email', 'Este correo ya está registrado.');
                } else {
                    alert('Error al registrar: ' + error.message);
                }
            }
        });
    }

    // ===== VALIDACIÓN EN TIEMPO REAL =====
    
    // Limpiar errores al escribir
    if (emailInput) emailInput.addEventListener('input', () => limpiarError('email'));
    if (nombreInput) nombreInput.addEventListener('input', () => limpiarError('nombre'));
    if (politicasInput) politicasInput.addEventListener('change', () => limpiarError('politicas'));
    
    // Contador dinámico para la primera contraseña
    if (passInput) {
        mostrarMensajeAyuda('contraseña', `Debe tener al menos ${MIN_CONTRASENA_LENGTH} caracteres.`);

        passInput.addEventListener('input', () => {
            const longitud = passInput.value.length;
            if (longitud === 0) {
                mostrarMensajeAyuda('contraseña', `Debe tener al menos ${MIN_CONTRASENA_LENGTH} caracteres.`);
            } else if (longitud < MIN_CONTRASENA_LENGTH) {
                mostrarMensajeAyuda('contraseña', `Faltan ${MIN_CONTRASENA_LENGTH - longitud} caracteres.`);
            } else {
                mostrarMensajeAyuda('contraseña', '¡Longitud correcta!', true);
            }
            
            // Validar también la confirmación si hay texto
            if (confirmInput.value) {
                confirmInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Validación de coincidencia para la segunda contraseña
    if (confirmInput) {
        mostrarMensajeAyuda('confirmar-contraseña', 'Confirma tu contraseña.');
        
        confirmInput.addEventListener('input', () => {
            const pass1 = passInput.value;
            const pass2 = confirmInput.value;

            if (pass2.length === 0) {
                mostrarMensajeAyuda('confirmar-contraseña', 'Confirma tu contraseña.');
            } else if (pass2.length < MIN_CONTRASENA_LENGTH) {
                mostrarMensajeAyuda('confirmar-contraseña', `Faltan ${MIN_CONTRASENA_LENGTH - pass2.length} caracteres.`);
            } else if (pass1 !== pass2) {
                mostrarError('confirmar-contraseña', 'Las contraseñas no coinciden.');
            } else {
                mostrarMensajeAyuda('confirmar-contraseña', '¡Las contraseñas coinciden!', true);
            }
        });
    }

    console.log('✅ Sistema de registro con políticas cargado correctamente');
});