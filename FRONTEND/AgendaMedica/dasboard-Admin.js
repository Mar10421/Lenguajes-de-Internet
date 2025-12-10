"use strict";

const apiBaseUrl = "https://localhost:44353"; 
// --- GUARDIA ---
(function() {
    const token = localStorage.getItem("jwtToken");
    if (!token) { window.location.href = "login.html"; return; }
    
    // Decodificar token para ver si es Admin
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        const roles = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        if (!roles || !roles.includes("Admin")) {
            alert("Acceso denegado.");
            window.location.href = "login.html";
        }
    } catch (e) { window.location.href = "login.html"; }
})();

document.addEventListener("DOMContentLoaded", function() {
    // Logout
    document.getElementById("boton-logout").addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "login.html";
    });

    // Formulario Registro
    const form = document.getElementById("registro-doctor-form");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            handleRegistrarDoctor();
        });
    }

    // Cargar Listas (Si ya pusiste el AdminController, esto funcionará)
    cargarListas();
});

async function handleRegistrarDoctor() {
    const btn = document.getElementById("boton-registrar-doctor");
    const msg = document.getElementById("mensaje-registro");
    const token = localStorage.getItem("jwtToken");

    btn.disabled = true; btn.textContent = "Registrando..."; msg.textContent = "";

    const datos = {
        nombre: document.getElementById("input-nombre").value,
        correo: document.getElementById("input-correo").value,
        password: document.getElementById("input-password").value,
        especialidad: document.getElementById("input-especialidad").value
    };

    try {
        const response = await fetch(`${apiBaseUrl}/api/auth/registrar-doctor`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            msg.textContent = "¡Doctor creado exitosamente!";
            msg.style.color = "green";
            document.getElementById("registro-doctor-form").reset();
            cargarListas(); // Refrescar la tabla
        } else {
            msg.textContent = "Error: " + await response.text();
            msg.style.color = "red";
        }
    } catch (e) {
        console.error(e);
        msg.textContent = "Error de conexión.";
        msg.style.color = "red";
    } finally {
        btn.disabled = false; btn.textContent = "Registrar Doctor";
    }
}

// Función simple para cargar listas (Doctores y Pacientes)
async function cargarListas() {
    const token = localStorage.getItem("jwtToken");
    
    // Doctores
    try {
        const res = await fetch(`${apiBaseUrl}/api/admin/doctores`, { headers: { "Authorization": `Bearer ${token}` }});
        if(res.ok) {
            const docs = await res.json();
            let html = "<ul>";
            docs.forEach(d => html += `<li>${d.nombre} (${d.especialidad}) - <button class="btn-eliminar" onclick="eliminarDoctor(${d.doctorID})">X</button></li>`);
            html += "</ul>";
            document.getElementById("lista-doctores-admin-container").innerHTML = html || "No hay doctores.";
        }
    } catch(e) {}

    // Pacientes
    try {
        const res = await fetch(`${apiBaseUrl}/api/admin/pacientes`, { headers: { "Authorization": `Bearer ${token}` }});
        if(res.ok) {
            const pacs = await res.json();
            let html = "<ul>";
            pacs.forEach(p => html += `<li>${p.nombre} - <button class="btn-eliminar" onclick="eliminarPaciente(${p.pacienteID})">X</button></li>`);
            html += "</ul>";
            document.getElementById("lista-pacientes-container").innerHTML = html || "No hay pacientes.";
        }
    } catch(e) {}
}

// Funciones globales para eliminar
window.eliminarDoctor = async (id) => {
    if(!confirm("¿Eliminar doctor?")) return;
    await fetch(`${apiBaseUrl}/api/admin/doctores/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("jwtToken")}` }});
    cargarListas();
};
window.eliminarPaciente = async (id) => {
    if(!confirm("¿Eliminar paciente?")) return;
    await fetch(`${apiBaseUrl}/api/admin/pacientes/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("jwtToken")}` }});
    cargarListas();
};