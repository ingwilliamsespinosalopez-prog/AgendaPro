document.addEventListener('DOMContentLoaded', function() {
    const modalPrincipal = document.getElementById('modalPrincipal');
    const btnAceptar = document.getElementById('btnAceptar');
    const COOKIE_NAME = 'afgcorporacion_modal_visto';
    
    // Función para verificar si el modal ya fue visto
    function modalYaVisto() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === COOKIE_NAME) {
                return value === 'true';
            }
        }
        return false;
    }
    
    // Función para guardar que el modal fue visto
    function marcarModalComoVisto() {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 365); // 1 año
        document.cookie = `${COOKIE_NAME}=true; expires=${expireDate.toUTCString()}; path=/; SameSite=Lax`;
    }
    
    // Mostrar el modal solo si no ha sido visto
    if (modalPrincipal && !modalYaVisto()) {
        setTimeout(() => {
            modalPrincipal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }, 100);
    }
    
    // Función para cerrar el modal
    function cerrarModalPrincipal() {
        if (modalPrincipal) {
            modalPrincipal.style.animation = 'fadeOut 0.3s ease-out';
            
            setTimeout(() => {
                modalPrincipal.classList.remove('show');
                modalPrincipal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
            
            // Marcar como visto
            marcarModalComoVisto();
        }
    }
    
    // Configurar el botón de aceptar
    if (btnAceptar) {
        btnAceptar.addEventListener('click', cerrarModalPrincipal);
    }
    
    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalPrincipal && modalPrincipal.classList.contains('show')) {
            cerrarModalPrincipal();
        }
    });

    // ===== RESTO DEL CÓDIGO (MENÚ HAMBURGUESA, ETC.) =====
    const botonMenu = document.getElementById('boton-menu');
    const navegacion = document.getElementById('navegacion');
    const overlayMenu = document.getElementById('overlay-menu');
    const enlacesNav = document.querySelectorAll('.enlace-nav, .boton-iniciar');

    function esMobile() {
        return window.innerWidth <= 768;
    }

    function abrirMenu() {
        if (esMobile()) {
            navegacion.classList.add('abierto');
            overlayMenu.classList.add('activo');
            botonMenu.classList.add('activo');
            document.body.style.overflow = 'hidden';
        }
    }

    function cerrarMenu() {
        navegacion.classList.remove('abierto');
        overlayMenu.classList.remove('activo');
        botonMenu.classList.remove('activo');
        document.body.style.overflow = '';
    }

    if (botonMenu) {
        botonMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navegacion.classList.contains('abierto')) {
                cerrarMenu();
            } else {
                abrirMenu();
            }
        });
    }

    if (overlayMenu) {
        overlayMenu.addEventListener('click', cerrarMenu);
    }

    enlacesNav.forEach(enlace => {
        enlace.addEventListener('click', function() {
            if (esMobile()) {
                cerrarMenu();
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navegacion.classList.contains('abierto') && esMobile()) {
            cerrarMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (!esMobile()) {
            cerrarMenu();
        }
    });

    // ===== ANIMACIONES DE ENTRADA =====
    const tarjetasServicio = document.querySelectorAll('.tarjeta-servicio');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const tarjetasObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
                tarjetasObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    tarjetasServicio.forEach(tarjeta => {
        tarjeta.style.opacity = '0';
        tarjeta.style.transform = 'translateY(30px)';
        tarjeta.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        tarjetasObserver.observe(tarjeta);
    });

    // ===== SCROLL SUAVE =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== EFECTO EN EL HEADER AL HACER SCROLL =====
    const header = document.querySelector('.encabezado');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    console.log('Página Principal cargada correctamente');

    // ============================================
    // SISTEMA DE GESTIÓN DE COOKIES
    // ============================================
    
    class GestorCookies {
        constructor() {
            this.cookieName = 'afgcorporacion_cookies_consent';
            this.cookieExpireDays = 365;
            this.init();
        }

        init() {
            const consent = this.obtenerConsentimiento();
            
            if (!consent) {
                setTimeout(() => {
                    this.mostrarBanner();
                }, 1000);
            } else {
                console.log('Consentimiento de cookies ya guardado:', consent);
                this.aplicarPreferencias(consent);
            }

            this.configurarEventos();
        }

        configurarEventos() {
            document.getElementById('aceptarCookies')?.addEventListener('click', () => {
                this.aceptarTodas();
            });

            document.getElementById('rechazarCookies')?.addEventListener('click', () => {
                this.rechazarTodas();
            });

            document.getElementById('configurarCookies')?.addEventListener('click', () => {
                this.mostrarModal();
            });

            document.getElementById('cerrarModal')?.addEventListener('click', () => {
                this.ocultarModal();
            });

            document.getElementById('guardarPreferencias')?.addEventListener('click', () => {
                this.guardarPreferencias();
            });

            document.getElementById('rechazarTodas')?.addEventListener('click', () => {
                this.rechazarTodasModal();
            });

            document.getElementById('cookieModal')?.addEventListener('click', (e) => {
                if (e.target.id === 'cookieModal') {
                    this.ocultarModal();
                }
            });
        }

        mostrarBanner() {
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.classList.add('mostrar');
            }
        }

        ocultarBanner() {
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.classList.remove('mostrar');
            }
        }

        mostrarModal() {
            const modal = document.getElementById('cookieModal');
            if (modal) {
                modal.classList.add('mostrar');
                this.cargarPreferenciasEnModal();
            }
        }

        ocultarModal() {
            const modal = document.getElementById('cookieModal');
            if (modal) {
                modal.classList.remove('mostrar');
            }
        }

        aceptarTodas() {
            const preferencias = {
                necesarias: true,
                analisis: true,
                funcionalidad: true,
                marketing: true,
                timestamp: new Date().toISOString()
            };
            
            this.guardarConsentimiento(preferencias);
            this.ocultarBanner();
            this.aplicarPreferencias(preferencias);
            console.log('Todas las cookies aceptadas');
        }

        rechazarTodas() {
            const preferencias = {
                necesarias: true,
                analisis: false,
                funcionalidad: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
            
            this.guardarConsentimiento(preferencias);
            this.ocultarBanner();
            this.aplicarPreferencias(preferencias);
            console.log('Cookies rechazadas (solo necesarias activas)');
        }

        rechazarTodasModal() {
            document.getElementById('cookiesAnalisis').checked = false;
            document.getElementById('cookiesFuncionalidad').checked = false;
            document.getElementById('cookiesMarketing').checked = false;
            this.guardarPreferencias();
        }

        guardarPreferencias() {
            const preferencias = {
                necesarias: true,
                analisis: document.getElementById('cookiesAnalisis')?.checked || false,
                funcionalidad: document.getElementById('cookiesFuncionalidad')?.checked || false,
                marketing: document.getElementById('cookiesMarketing')?.checked || false,
                timestamp: new Date().toISOString()
            };
            
            this.guardarConsentimiento(preferencias);
            this.ocultarModal();
            this.ocultarBanner();
            this.aplicarPreferencias(preferencias);
            console.log('Preferencias guardadas:', preferencias);
        }

        cargarPreferenciasEnModal() {
            const consent = this.obtenerConsentimiento();
            if (consent) {
                document.getElementById('cookiesAnalisis').checked = consent.analisis || false;
                document.getElementById('cookiesFuncionalidad').checked = consent.funcionalidad || false;
                document.getElementById('cookiesMarketing').checked = consent.marketing || false;
            }
        }

        guardarConsentimiento(preferencias) {
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + this.cookieExpireDays);
            
            document.cookie = `${this.cookieName}=${JSON.stringify(preferencias)}; expires=${expireDate.toUTCString()}; path=/; SameSite=Lax`;
        }

        obtenerConsentimiento() {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === this.cookieName) {
                    try {
                        return JSON.parse(decodeURIComponent(value));
                    } catch (e) {
                        return null;
                    }
                }
            }
            return null;
        }

        aplicarPreferencias(preferencias) {
            if (preferencias.analisis) {
                console.log('✅ Activando cookies de análisis...');
            }

            if (preferencias.funcionalidad) {
                console.log('✅ Activando cookies de funcionalidad...');
            }

            if (preferencias.marketing) {
                console.log('✅ Activando cookies de marketing...');
            }

            console.log('📊 Preferencias de cookies aplicadas:', preferencias);
        }

        resetear() {
            document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            console.log('🔄 Cookies reseteadas. Recarga la página para ver el banner nuevamente.');
        }
    }

    // Inicializar el gestor de cookies
    const gestorCookies = new GestorCookies();

    // Exponer métodos útiles para desarrollo
    window.resetearCookies = () => gestorCookies.resetear();
    window.verConsentimiento = () => {
        const consent = gestorCookies.obtenerConsentimiento();
        console.log('📋 Consentimiento actual:', consent);
        return consent;
    };
    
    // Método para resetear el modal principal (útil para testing)
    window.resetearModal = () => {
        document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log('🔄 Modal principal reseteado. Recarga la página para verlo nuevamente.');
    };

    console.log('🍪 Sistema de cookies inicializado');
    console.log('💡 Comandos disponibles en consola:');
    console.log('   - window.resetearCookies() → Resetea las cookies');
    console.log('   - window.verConsentimiento() → Muestra el consentimiento actual');
    console.log('   - window.resetearModal() → Resetea el modal principal');
});