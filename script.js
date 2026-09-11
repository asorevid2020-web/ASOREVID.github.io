/**
 * ASOREVID - Lógica Frontend, Navegación SPA y Gestión de PQR con EmailJS
 * Versión Completa con Gráfico de Toneladas y Galería
 */

window.leafletMap = null;
window.graficoInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMap();
    initGraficoToneladas();
    renderMaterials();
    renderRoutesTable();
    initFormValidation();
    initSearchFilter();
});

/* --- SANITIZACIÓN --- */
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

/* --- CONSECUTIVO PQR --- */
function obtenerSiguienteRadicado() {
    let contador = parseInt(localStorage.getItem('pqr_consecutivo'), 10) || 1;
    const numeroFormateado = String(contador).padStart(3, '0');
    const codigoRadicado = `PQR-${numeroFormateado}`;
    return { contador, codigoRadicado };
}

/* --- NAVEGACIÓN SPA --- */
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
                    setTimeout(() => window.leafletMap.invalidateSize(), 250);
                }
                if (window.graficoInstance) {
                    setTimeout(() => window.graficoInstance.resize(), 250);
                }
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/* --- GRÁFICO DE TONELADAS --- */
function initGraficoToneladas() {
    const canvas = document.getElementById('graficoToneladas');
    if (!canvas || typeof Chart === 'undefined') return;

    // Registrar el plugin de etiquetas (Chart.js v4 requiere registro explícito)
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }

    const ctx = canvas.getContext('2d');

    const datos = {
        labels: ['2024', '2025', '2026'],
        aprovechadas: [6844.16, 6073.13, 4016.81],
        rechazo: [308, 121, 104]
    };

    // Función auxiliar para formatear números bonitos
    const formatearValor = (valor) => {
        return Number.isInteger(valor)
            ? valor.toLocaleString('es-CO')
            : valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    window.graficoInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.labels,
            datasets: [
                {
                    label: 'Toneladas Aprovechadas',
                    data: datos.aprovechadas,
                    backgroundColor: 'rgba(46, 125, 50, 0.85)',
                    borderColor: '#1b5e20',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 70
                },
                {
                    label: 'Toneladas de Rechazo',
                    data: datos.rechazo,
                    backgroundColor: 'rgba(198, 40, 40, 0.85)',
                    borderColor: '#8e0000',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 70
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 30  // Espacio arriba para que no se corten las etiquetas
                }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' },
            plugins: {
                /* === NUEVO: Configuración de las etiquetas sobre las barras === */
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 4,
                    color: '#2c3e50',
                    font: {
                        size: 11,
                        weight: '700',
                        family: "'Segoe UI', sans-serif"
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: { top: 3, bottom: 3, left: 6, right: 6 },
                    formatter: (value, context) => {
                        // Formato corto para valores grandes (evita etiquetas enormes)
                        if (value >= 1000) {
                            return value.toLocaleString('es-CO', { maximumFractionDigits: 0 });
                        }
                        return formatearValor(value);
                    },
                    // Solo oculta etiquetas si el valor es 0
                    display: (context) => context.dataset.data[context.dataIndex] > 0
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 13, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 14, weight: '700' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatearValor(context.parsed.y)} Ton`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Toneladas',
                        font: { size: 13, weight: '700' },
                        color: '#2c3e50'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.06)', drawBorder: false },
                    ticks: {
                        font: { size: 12 },
                        callback: (value) => value.toLocaleString('es-CO')
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 13, weight: '600' }, color: '#2c3e50' }
                }
            }
        }
    });
}
/* --- MAPA --- */
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

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

/* --- RUTAS --- */
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

/* --- BUSCADOR --- */
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

/* --- FORMULARIO PQR --- */
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

        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Radicando...';

        const { contador, codigoRadicado } = obtenerSiguienteRadicado();

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
        alertBox.textContent = msg;
        alertBox.className = `alert ${type}`;
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 8000);
    }
}