// ==========================================
//  LÓGICA DEL DASHBOARD (CORREGIDO - RESET DIARIO)
// ==========================================
const API_DASH = '/api'; 

document.addEventListener("DOMContentLoaded", () => {
    actualizarDashboard();
});

window.actualizarDashboard = async function() {
    console.log("📊 Revisando agenda del día...");
    
    const lblCitas = document.getElementById('lblCitasHoy');
    const lblDinero = document.getElementById('lblDineroHoy');

    if (!lblCitas || !lblDinero) return;

    try {
        // Truco Anti-Cache: Agregamos ?t=... para obligar al navegador a pedir datos frescos
        const res = await fetch(`${API_DASH}/citas?t=${Date.now()}`);
        
        if (!res.ok) throw new Error("Error API Citas");
        
        const citas = await res.json();
        
        let conteo = 0;
        let dinero = 0;
        
        // FECHA DE HOY (OBJETO PURO)
        const hoy = new Date();

        citas.forEach(cita => {
            if (cita.bloqueCita && cita.bloqueCita.fechaInicio) {
                // Convertimos la fecha de la cita (que viene en UTC/ISO) a objeto JS
                const fechaCita = new Date(cita.bloqueCita.fechaInicio);
                
                // === COMPARACIÓN ROBUSTA (DÍA, MES, AÑO) ===
                // Esto ignora horas y textos, solo le importa el calendario local
                const esHoy = 
                    fechaCita.getDate() === hoy.getDate() &&
                    fechaCita.getMonth() === hoy.getMonth() &&
                    fechaCita.getFullYear() === hoy.getFullYear();

                if (esHoy) {
                    conteo++;
                    if (cita.servicio && cita.servicio.precio) {
                        dinero += cita.servicio.precio;
                    }
                }
            }
        });

        // Pintamos resultados
        lblCitas.innerText = conteo;
        
        const formatoPesos = new Intl.NumberFormat('es-MX', {
            style: 'currency', currency: 'MXN'
        });
        lblDinero.innerText = formatoPesos.format(dinero);
        
        // Log para que veas qué está pasando
        console.log(`✅ Hoy (${hoy.toLocaleDateString()}) tienes: ${conteo} citas.`);

    } catch (e) {
        console.error("❌ Error Dashboard:", e);
        lblCitas.innerText = "-";
        lblDinero.innerText = "$0.00";
    }
};