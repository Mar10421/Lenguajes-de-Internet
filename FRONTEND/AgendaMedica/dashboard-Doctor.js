"use strict";

const apiBaseUrl = "https://localhost:44353"; // 

// --- 1. GUARDIA ---
(function() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Acceso denegado.");
        window.location.href = "login.html";
        return;
    }
    const tokenDecodificado = parseJwt(token);
    const roles = tokenDecodificado["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (!roles || !roles.includes("Doctor")) {
        alert("Solo Doctores.");
        window.location.href = "login.html";
    }
})();

// --- 2. CARGA INICIAL ---
document.addEventListener("DOMContentLoaded", function() {
    const btnLogout = document.getElementById("boton-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
        });
    }

    // Listeners para formularios
    document.getElementById("form-reprogramar").addEventListener("submit", handleReprogramar);
    document.getElementById("form-cancelar").addEventListener("submit", handleCancelar);

    cargarMiAgenda();
});

// --- 3. CARGAR AGENDA ---
async function cargarMiAgenda() {
    const token = localStorage.getItem("jwtToken");
    const container = document.getElementById("lista-mi-agenda");
    container.innerHTML = "<p>Cargando...</p>";

    try {
        const response = await fetch(`${apiBaseUrl}/api/citas/mi-agenda`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const citas = await response.json();
            mostrarMiAgenda(citas);
        } else {
            container.innerHTML = "<p>Error al cargar agenda.</p>";
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Error de conexión.</p>";
    }
}

// --- 4. DIBUJAR TABLA CON BOTONES ---
function mostrarMiAgenda(citas) {
    const container = document.getElementById("lista-mi-agenda");
    if (citas.length === 0) { container.innerHTML = "<p>No hay citas.</p>"; return; }

    let html = "<table><thead><tr><th>Fecha</th><th>Paciente</th><th>Motivo</th><th>Acciones</th></tr></thead><tbody>";
    
    citas.forEach(cita => {
        const fecha = new Date(cita.fechaHora).toLocaleString();
        // Detectamos si ya está cancelada para pintarla diferente
        const esCancelada = cita.motivo && cita.motivo.includes("[CANCELADA");
        const estiloFila = esCancelada ? "background-color: #f8d7da; color: #721c24;" : "";

        html += `
            <tr style="${estiloFila}">
                <td>${fecha}</td>
                <td>${cita.nombrePaciente}</td>
                <td>${cita.motivo || ''}</td>
                <td>
                    ${!esCancelada ? `
                    <button onclick="abrirReprogramar(${cita.citaID}, '${cita.fechaHora}')" 
                            style="background:#ffc107; border:none; padding:5px; cursor:pointer;">📅 Mover</button>
                    <button onclick="abrirCancelar(${cita.citaID})" 
                            style="background:#dc3545; color:white; border:none; padding:5px; cursor:pointer;">🚫 Cancelar</button>
                    ` : 'CANCELADA'}
                </td>
            </tr>
        `;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}

// --- 5. FUNCIONES DE MODALES ---
window.abrirReprogramar = function(id, fecha) {
    cerrarModales();
    document.getElementById("reprogramar-container").style.display = "block";
    document.getElementById("repo-cita-id").value = id;
    document.getElementById("repo-fecha").value = fecha;
}

window.abrirCancelar = function(id) {
    cerrarModales();
    document.getElementById("cancelar-container").style.display = "block";
    document.getElementById("cancel-cita-id").value = id;
    document.getElementById("cancel-motivo").value = ""; // Limpiar
}

window.cerrarModales = function() {
    document.getElementById("reprogramar-container").style.display = "none";
    document.getElementById("cancelar-container").style.display = "none";
}

// --- 6. LÓGICA: REPROGRAMAR ---
async function handleReprogramar(e) {
    e.preventDefault();
    const id = document.getElementById("repo-cita-id").value;
    const fecha = document.getElementById("repo-fecha").value;
    const token = localStorage.getItem("jwtToken");

    try {
        const response = await fetch(`${apiBaseUrl}/api/citas/doctor/reprogramar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ nuevaFecha: fecha })
        });

        if (response.ok) {
            alert("Cita reprogramada.");
            cerrarModales();
            cargarMiAgenda();
        } else {
            alert("Error al reprogramar.");
        }
    } catch (err) { console.error(err); }
}

// --- 7. LÓGICA: CANCELAR ---
async function handleCancelar(e) {
    e.preventDefault();
    const id = document.getElementById("cancel-cita-id").value;
    const motivo = document.getElementById("cancel-motivo").value;
    const token = localStorage.getItem("jwtToken");

    try {
        const response = await fetch(`${apiBaseUrl}/api/citas/doctor/cancelar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ motivoCancelacion: motivo })
        });

        if (response.ok) {
            alert("Cita cancelada.");
            cerrarModales();
            cargarMiAgenda();
        } else {
            alert("Error al cancelar.");
        }
    } catch (err) { console.error(err); }
}

// Helper JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) { return null; }
}