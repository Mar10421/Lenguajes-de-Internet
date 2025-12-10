"use strict";

/* ========================================
   DASHBOARD ADMIN - JAVASCRIPT
   ======================================== */

// --- CONFIGURACIÓN ---
const API_BASE_URL = "https://localhost:44353";
const MEDICAMENTOS_SERVICE_URL = "http://localhost:5000/Services/MedicamentosService.asmx";

// --- VERIFICACIÓN DE ACCESO ---
(function verificarAccesoAdmin() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        if (!roles || !roles.includes("Admin")) {
            alert("Acceso denegado. Solo Administradores.");
            window.location.href = "login.html";
        }
    } catch (e) {
        window.location.href = "login.html";
    }
})();

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", function() {
    inicializarNavegacion();
    inicializarEventos();
    cargarDoctores();
    cargarPacientes();
});

/* ========================================
   NAVEGACIÓN SIDEBAR
   ======================================== */
function inicializarNavegacion() {
    const botones = document.querySelectorAll(".nav-btn");
    const secciones = document.querySelectorAll(".content-section");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            // Remover activo
            botones.forEach(btn => btn.classList.remove("active"));
            secciones.forEach(sec => sec.classList.remove("active-section"));

            // Activar seleccionado
            boton.classList.add("active");
            const targetId = boton.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active-section");
            }

            // Cargar medicamentos al entrar a esa sección
            if (targetId === "seccion-medicamentos") {
                cargarMedicamentos();
            }
        });
    });
}

function inicializarEventos() {
    // Logout
    document.getElementById("boton-logout").addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "login.html";
    });

    // Form Doctor
    document.getElementById("form-doctor").addEventListener("submit", (e) => {
        e.preventDefault();
        registrarDoctor();
    });

    // Form Medicamento
    document.getElementById("form-medicamento").addEventListener("submit", (e) => {
        e.preventDefault();
        guardarMedicamento();
    });

    // Cancelar edición medicamento
    document.getElementById("btn-cancelar-med").addEventListener("click", cancelarEdicionMedicamento);

    // Búsqueda medicamentos
    document.getElementById("buscar-med").addEventListener("keypress", (e) => {
        if (e.key === "Enter") buscarMedicamentos();
    });
}

/* ========================================
   GESTIÓN DE DOCTORES
   ======================================== */
async function registrarDoctor() {
    const token = localStorage.getItem("jwtToken");
    const msg = document.getElementById("msg-doctor");
    msg.textContent = "";

    const datos = {
        nombre: document.getElementById("doctor-nombre").value,
        correo: document.getElementById("doctor-correo").value,
        password: document.getElementById("doctor-password").value,
        especialidad: document.getElementById("doctor-especialidad").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/registrar-doctor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            msg.textContent = "¡Doctor registrado exitosamente!";
            msg.className = "message success";
            document.getElementById("form-doctor").reset();
            cargarDoctores();
        } else {
            msg.textContent = "Error: " + await response.text();
            msg.className = "message error";
        }
    } catch (e) {
        console.error(e);
        msg.textContent = "Error de conexión.";
        msg.className = "message error";
    }
}

async function cargarDoctores() {
    const token = localStorage.getItem("jwtToken");
    const container = document.getElementById("lista-doctores");
    container.innerHTML = '<p class="loading">Cargando doctores...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/doctores`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const doctores = await response.json();
            
            if (doctores.length === 0) {
                container.innerHTML = '<p class="empty-state">No hay doctores registrados.</p>';
                return;
            }

            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Especialidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            doctores.forEach(d => {
                html += `
                    <tr>
                        <td>${d.nombre}</td>
                        <td>${d.especialidad}</td>
                        <td>
                            <button class="btn btn-danger" onclick="eliminarDoctor(${d.doctorID})">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
            
            html += "</tbody></table>";
            container.innerHTML = html;
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="empty-state">Error al cargar doctores.</p>';
    }
}

window.eliminarDoctor = async function(id) {
    if (!confirm("¿Eliminar doctor y cancelar sus citas?")) return;
    
    const token = localStorage.getItem("jwtToken");
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/doctores/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Doctor eliminado correctamente.");
            cargarDoctores();
        } else {
            alert("Error al eliminar doctor.");
        }
    } catch (e) {
        console.error(e);
    }
};

/* ========================================
   GESTIÓN DE PACIENTES
   ======================================== */
async function cargarPacientes() {
    const token = localStorage.getItem("jwtToken");
    const container = document.getElementById("lista-pacientes");
    container.innerHTML = '<p class="loading">Cargando pacientes...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/pacientes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const pacientes = await response.json();
            
            if (pacientes.length === 0) {
                container.innerHTML = '<p class="empty-state">No hay pacientes registrados.</p>';
                return;
            }

            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            pacientes.forEach(p => {
                html += `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>${p.correo}</td>
                        <td>
                            <button class="btn btn-danger" onclick="eliminarPaciente(${p.pacienteID})">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
            
            html += "</tbody></table>";
            container.innerHTML = html;
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="empty-state">Error al cargar pacientes.</p>';
    }
}

window.eliminarPaciente = async function(id) {
    if (!confirm("¿Eliminar paciente y su historial?")) return;
    
    const token = localStorage.getItem("jwtToken");
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/pacientes/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Paciente eliminado correctamente.");
            cargarPacientes();
        } else {
            alert("Error al eliminar paciente.");
        }
    } catch (e) {
        console.error(e);
    }
};

/* ========================================
   GESTIÓN DE MEDICAMENTOS
   ======================================== */
async function cargarMedicamentos() {
    const container = document.getElementById("lista-medicamentos");
    container.innerHTML = '<p class="loading">Cargando medicamentos...</p>';

    try {
        const response = await fetch(`${MEDICAMENTOS_SERVICE_URL}/ObtenerMedicamentos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        if (!response.ok) throw new Error("Error al cargar");

        const data = await response.json();
        const medicamentos = data.d || data;
        mostrarTablaMedicamentos(medicamentos);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="empty-state">Error al cargar medicamentos. Verifica que el servicio esté corriendo.</p>';
    }
}

async function buscarMedicamentos() {
    const termino = document.getElementById("buscar-med").value.trim();
    
    if (!termino) {
        cargarMedicamentos();
        return;
    }

    const container = document.getElementById("lista-medicamentos");
    container.innerHTML = '<p class="loading">Buscando...</p>';

    try {
        const response = await fetch(`${MEDICAMENTOS_SERVICE_URL}/BuscarMedicamentos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ termino: termino })
        });

        const data = await response.json();
        mostrarTablaMedicamentos(data.d || data);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="empty-state">Error en la búsqueda.</p>';
    }
}

function mostrarTablaMedicamentos(medicamentos) {
    const container = document.getElementById("lista-medicamentos");

    if (!medicamentos || medicamentos.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron medicamentos.</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Genérico</th>
                    <th>Laboratorio</th>
                    <th>Presentación</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    medicamentos.forEach(m => {
        html += `
            <tr>
                <td>${m.Nombre}</td>
                <td>${m.NombreGenerico || '-'}</td>
                <td>${m.Laboratorio || '-'}</td>
                <td>${m.Presentacion || ''} ${m.Concentracion || ''}</td>
                <td class="acciones-cell">
                    <button class="btn btn-warning" onclick="editarMedicamento(${m.MedicamentoID}, '${m.Codigo || ''}', '${m.Nombre}', '${m.NombreGenerico || ''}', '${m.Laboratorio || ''}', '${m.Presentacion || ''}', '${m.Concentracion || ''}', ${m.RequiereReceta})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarMedicamento(${m.MedicamentoID})">Eliminar</button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}

async function guardarMedicamento() {
    const msg = document.getElementById("msg-medicamento");
    msg.textContent = "";

    const id = document.getElementById("med-id").value;
    const datos = {
        codigo: document.getElementById("med-codigo").value,
        nombre: document.getElementById("med-nombre").value,
        nombreGenerico: document.getElementById("med-generico").value,
        laboratorio: document.getElementById("med-laboratorio").value,
        presentacion: document.getElementById("med-presentacion").value,
        concentracion: document.getElementById("med-concentracion").value,
        requiereReceta: document.getElementById("med-receta").checked ? 1 : 0
    };

    const esEdicion = id !== "";
    const metodo = esEdicion ? "ActualizarMedicamento" : "AgregarMedicamento";
    
    if (esEdicion) {
        datos.medicamentoID = parseInt(id);
    }

    try {
        const response = await fetch(`${MEDICAMENTOS_SERVICE_URL}/${metodo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const data = await response.json();
        
        if (data.d || data === true) {
            msg.textContent = esEdicion ? "Medicamento actualizado." : "Medicamento agregado.";
            msg.className = "message success";
            document.getElementById("form-medicamento").reset();
            document.getElementById("med-id").value = "";
            document.getElementById("med-receta").checked = false;
            document.getElementById("titulo-form-med").textContent = "Agregar Medicamento";
            document.getElementById("btn-cancelar-med").style.display = "none";
            cargarMedicamentos();
        } else {
            msg.textContent = "Error al guardar medicamento.";
            msg.className = "message error";
        }
    } catch (e) {
        console.error(e);
        msg.textContent = "Error de conexión con el servicio.";
        msg.className = "message error";
    }
}

window.editarMedicamento = function(id, codigo, nombre, generico, laboratorio, presentacion, concentracion, requiereReceta) {
    document.getElementById("med-id").value = id;
    document.getElementById("med-codigo").value = codigo;
    document.getElementById("med-nombre").value = nombre;
    document.getElementById("med-generico").value = generico;
    document.getElementById("med-laboratorio").value = laboratorio;
    document.getElementById("med-presentacion").value = presentacion;
    document.getElementById("med-concentracion").value = concentracion;
    document.getElementById("med-receta").checked = requiereReceta === 1;
    
    document.getElementById("titulo-form-med").textContent = "Editar Medicamento";
    document.getElementById("btn-cancelar-med").style.display = "inline-block";
    
    // Scroll al formulario
    document.getElementById("form-medicamento").scrollIntoView({ behavior: "smooth" });
};

function cancelarEdicionMedicamento() {
    document.getElementById("form-medicamento").reset();
    document.getElementById("med-id").value = "";
    document.getElementById("med-receta").checked = false;
    document.getElementById("titulo-form-med").textContent = "Agregar Medicamento";
    document.getElementById("btn-cancelar-med").style.display = "none";
}

window.eliminarMedicamento = async function(id) {
    if (!confirm("¿Eliminar este medicamento?")) return;

    try {
        const response = await fetch(`${MEDICAMENTOS_SERVICE_URL}/EliminarMedicamento`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medicamentoID: id })
        });

        const data = await response.json();
        
        if (data.d || data === true) {
            alert("Medicamento eliminado.");
            cargarMedicamentos();
        } else {
            alert("Error al eliminar medicamento.");
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión.");
    }
};
