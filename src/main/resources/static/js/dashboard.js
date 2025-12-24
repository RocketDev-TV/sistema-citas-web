// ==========================================
//  LÓGICA DEL DASHBOARD (MODULAR)
// ==========================================
const API_DASH = '/api'; 

document.addEventListener("DOMContentLoaded", () => {
    actualizarDashboard();
});

// Hacemos la función global por si quieres llamarla al agendar una cita nueva
window.actualizarDashboard = async function() {
    console.log("📊 Actualizando métricas...");
    
    const lblCitas = document.getElementById('lblCitasHoy');
    const lblDinero = document.getElementById('lblDineroHoy');

    // Si no estamos en la página correcta, detenemos
    if (!lblCitas || !lblDinero) return;

    try {
        const res = await fetch(`${API_DASH}/citas`);
        if (!res.ok) throw new Error("Error API Citas");
        
        const citas = await res.json();
        
        let conteo = 0;
        let dinero = 0;
        
        // Fecha de hoy en formato local (ej: "24/12/2025")
        const hoyStr = new Date().toLocaleDateString();

        citas.forEach(cita => {
            // Validamos estructura para no romper el loop
            if (cita.bloqueCita && cita.bloqueCita.fechaInicio) {
                const fechaCita = new Date(cita.bloqueCita.fechaInicio).toLocaleDateString();
                
                // Filtro: Solo citas de HOY
                if (fechaCita === hoyStr) {
                    conteo++;
                    
                    // Suma: Solo si tiene servicio y precio
                    if (cita.servicio && cita.servicio.precio) {
                        dinero += cita.servicio.precio;
                    }
                }
            }
        });

        // Pintar en pantalla
        lblCitas.innerText = conteo;
        
        // Formato de moneda MXN
        const formatoPesos = new Intl.NumberFormat('es-MX', {
            style: 'currency', currency: 'MXN'
        });
        lblDinero.innerText = formatoPesos.format(dinero);

    } catch (e) {
        console.error("❌ Error en Dashboard:", e);
        lblCitas.innerText = "-";
        lblDinero.innerText = "$0.00";
    }
};