/**
 * ASOREVID - Lógica Frontend, Navegación SPA y Gestión de PQR con EmailJS
 * Versión Optimizada y Segura
 */

window.leafletMap = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMap();
    renderMaterials();
    renderRoutesTable();
    initFormValidation();
    initSearchFilter();
});

/* --- SANITIZACIÓN Y CREACIÓN SEGURA DE NODOS --- */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}

/* --- GENERADOR DE CONSECUTIVO AUTOMÁTICO --- */
function obtenerSiguienteRadicado() {
    let contador = parseInt(localStorage.getItem('pqr_consecutivo'), 10) || 1;
    const numeroFormateado = String(contador).padStart(3, '0');
    const codigoRadicado = `PQR-${numeroFormateado}`;
    return { contador, codigoRadicado };
}

/* --- CONTROL DE NAVEGACIÓN SPA --- */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href').replace('#', '');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active-section');
                } else {
                    section.classList.remove('active-section');
                }
            });

            if (targetId === 'servicios') {
                renderRoutesTable();
                if (window.leafletMap) {
                    setTimeout(() => {
                        window.leafletMap.invalidateSize();
                    }, 200);
                }
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/* --- MAPA CON LEAFLET --- */
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    window.leafletMap = L.map('map').setView([4.6500, -74.0900], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap'
    }).addTo(window.leafletMap);

    const localidades = [
        { name: "Chapinero", coords: [[4.6700, -74.0600], [4.6500, -74.0400], [4.6300, -74.0600], [4.6500, -74.0800]] },
        { name: "Usaquén", coords: [[4.7500, -74.0500], [4.7000, -74.0200], [4.6800, -74.0400], [4.7200, -74.0600]] },
        { name: "Suba", coords: [[4.7800, -74.1200], [4.7400, -74.0700], [4.7000, -74.0900], [4.7400, -74.1400]] },
        { name: "Puente Aranda", coords: [[4.6350, -74.1250], [4.6300, -74.0950], [4.6050, -74.1050], [4.6150, -74.1300]] },
        { name: "Fontibón", coords: [[4.6800, -74.1550], [4.6650, -74.1150], [4.6400, -74.1350], [4.6600, -74.1750]] },
        { name: "Engativá", coords: [[4.7200, -74.1250], [4.7050, -74.0800], [4.6650, -74.0950], [4.6850, -74.1400]] },
        { name: "Rafael Uribe Uribe", coords: [[4.5850, -74.1150], [4.5950, -74.0900], [4.5500, -74.0950], [4.5450, -74.1100]] }
    ];

    localidades.forEach(loc => {
        L.polygon(loc.coords, {
            color: '#2e7d32',
            fillColor: '#2e7d32',
            fillOpacity: 0.35,
            weight: 2
        }).addTo(window.leafletMap).bindPopup(`<b>Localidad:</b> ${escapeHTML(loc.name)} (Cobertura ASOREVID)`);
    });
}

/* --- MATERIALES --- */
const materiales = [
    { nombre: "ALUMINIO", icono: "fa-dumpster" },
    { nombre: "PASTA", icono: "fa-recycle" },
    { nombre: "SOPLADO", icono: "fa-bottle-water" },
    { nombre: "TEXTILES", icono: "fa-shirt" },
    { nombre: "ACRILICO", icono: "fa-layer-group" },
    { nombre: "ACERO", icono: "fa-cubes" },
    { nombre: "ANTIMONIO", icono: "fa-industry" },
    { nombre: "ARCHIVO", icono: "fa-box-archive" },
    { nombre: "BRONCE", icono: "fa-coins" },
    { nombre: "CUBETAS O PANELES", icono: "fa-boxes-stacked" },
    { nombre: "CHATARRA ACERO", icono: "fa-gear" },
    { nombre: "CHATARRA", icono: "fa-wrench" },
    { nombre: "CARTON", icono: "fa-box" },
    { nombre: "KRAFT", icono: "fa-scroll" },
    { nombre: "MADERABLES", icono: "fa-tree" },
    { nombre: "PAPEL Y CARTON (REVISTA)", icono: "fa-newspaper" },
    { nombre: "VIDRIOS", icono: "fa-wine-bottle" },
    { nombre: "PLASTICO", icono: "fa-prescription-bottle" },
    { nombre: "PLEGADIZA CAFÉ", icono: "fa-square" },
    { nombre: "PVC", icono: "fa-lines-leaning" },
    { nombre: "PET", icono: "fa-bottle-droplet" },
    { nombre: "PERIODICO", icono: "fa-book-open" }
];

function renderMaterials() {
    const container = document.getElementById('materialsContainer');
    if (!container) return;
    
    container.innerHTML = materiales.map(m => `
        <div class="material-card">
            <i class="fa-solid ${escapeHTML(m.icono)}"></i>
            <h4>${escapeHTML(m.nombre)}</h4>
        </div>
    `).join('');
}

/* --- TABLA DE RUTAS --- */
function generate100Routes() {
    const localidades = ["Chapinero", "Usaquén", "Suba", "Puente Aranda", "Fontibón", "Engativá", "Rafael Uribe Uribe", "Teusaquillo", "Santa Fé", "Barrios Unidos"];
    const frecuencias = ["Lunes a Sábado", "Martes - Jueves", "Lunes - Miércoles - Viernes", "Martes - Jueves - Sábado"];
    const horarios = ["Noche: 18:00 A 2:00", "Día: 6:00 A 18:00", "Día: 6:00 A 14:00", "Noche: 18:00 A 4:00"];
    
    const routes = [];
    for (let i = 1; i <= 100; i++) {
        const loc = localidades[i % localidades.length];
        const freq = frecuencias[i % frecuencias.length];
        const hor = horarios[i % horarios.length];
        routes.push({
            id: `RUT-${1000 + i}`,
            localidad: loc,
            barrio: `Microruta Residencial/Comercial ${i} - ${loc}`,
            dias: freq,
            horario: hor
        });
    }
    return routes;
}

const routesData = generate100Routes();

function renderRoutesTable(filteredRoutes = routesData) {
    const tbody = document.getElementById('routesTableBody');
    if (!tbody) return;

    tbody.innerHTML = filteredRoutes.map(r => `
        <tr>
            <td><strong>${escapeHTML(r.id)}</strong></td>
            <td>${escapeHTML(r.localidad)}</td>
            <td>${escapeHTML(r.barrio)}</td>
            <td>${escapeHTML(r.dias)}</td>
            <td>${escapeHTML(r.horario)}</td>
        </tr>
    `).join('');
}

/* --- FILTRO BÚSQUEDA CON DEBOUNCE --- */
function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

function initSearchFilter() {
    const searchInput = document.getElementById('routeSearch');
    if (!searchInput) return;

    const handleSearch = debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = routesData.filter(r => 
            r.localidad.toLowerCase().includes(query) || 
            r.barrio.toLowerCase().includes(query) ||
            r.id.toLowerCase().includes(query)
        );
        renderRoutesTable(filtered);
    }, 250);

    searchInput.addEventListener('input', handleSearch);
}

/* --- VALIDACIÓN DE FORMULARIO Y ENVÍO EMAILJS --- */
function initFormValidation() {
    const form = document.getElementById('pqrForm');
    const alertBox = document.getElementById('pqrAlert');
    if (!form || !alertBox) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const tipoReq = document.getElementById('tipoReq').value;
        const mensaje = document.getElementById('mensaje').value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{7,10}$/;

        if (!nombre || !email || !telefono || !tipoReq || !mensaje) {
            showAlert('Por favor, complete todos los campos obligatorios.', 'error');
            return;
        }

        if (!emailRegex.test(email)) {
            showAlert('Ingrese una dirección de correo electrónico válida.', 'error');
            return;
        }

        if (!phoneRegex.test(telefono)) {
            showAlert('El teléfono debe tener entre 7 y 10 dígitos numéricos.', 'error');
            return;
        }

        // Estado visual de carga
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Radicando...';

        const { contador, codigoRadicado } = obtenerSiguienteRadicado();

        // IMPORTANTE: Enviar el texto plano directamente sin escapeHTML()
        const templateParams = {
            radicado: codigoRadicado,
            nombre: nombre,
            email: email,
            telefono: telefono,
            tipoReq: tipoReq,
            mensaje: mensaje
        };

        emailjs.send("service_4wtp6lc", "template_8ofk4nk", templateParams)
            .then(() => {
                localStorage.setItem('pqr_consecutivo', contador + 1);
                showAlert(`¡PQR Radicado con éxito bajo el consecutivo ${codigoRadicado}! Se ha enviado la confirmación a ${email}.`, 'success');
                form.reset();
            })
            .catch((err) => {
                // Extrae y muestra el mensaje explicativo real que devuelve EmailJS
                const detalleError = (err && err.text) ? err.text : JSON.stringify(err);
                console.error("Detalle del fallo EmailJS:", detalleError);
    
                showAlert('Ocurrió un error al enviar el correo. Por favor intente más tarde o escriba a asorevid2020@gmail.com', 'error');
                })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Radicar PQR';
            });
    });

    function showAlert(msg, type) {
        alertBox.textContent = msg; // Uso seguro de textContent sin modificar sintaxis
        alertBox.className = `alert ${type}`;
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 8000);
    }
}