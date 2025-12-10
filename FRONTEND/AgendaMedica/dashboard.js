"use strict";

// --- 1. CONFIGURACIÓN ---
const apiBaseUrl = "https://localhost:44353"; 

// --- 2. GUARDIA DE SEGURIDAD ---
(function() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Acceso denegado.");
        window.location.href = "login.html";
    }
})();

// --- 3. CARGA INICIAL ---
document.addEventListener("DOMContentLoaded", function() {

    const formAgendar = document.getElementById("form-agendar-cita");
    const formEditar = document.getElementById("form-editar-cita");
    const btnLogout = document.getElementById("boton-logout");
    const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
    const btnEliminarCuenta = document.getElementById("boton-eliminar-cuenta");
    
    // NUEVO: Formulario de actualizar perfil
    const formUpdatePerfil = document.getElementById("form-update-perfil");

    // Inicializar Navegación Sidebar
    iniciarNavegacion();

    // Logout
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
        });
    }

    // Eliminar Cuenta
    if (btnEliminarCuenta) {
        btnEliminarCuenta.addEventListener("click", eliminarMiCuenta);
    }

    // Actualizar Perfil (NUEVO)
    if (formUpdatePerfil) {
        formUpdatePerfil.addEventListener("submit", handleUpdatePerfil);
    }

    // Agendar Cita
    if (formAgendar) {
        formAgendar.addEventListener("submit", function(e) {
            e.preventDefault();
            handleAgendarCita();
        });
    }

    // Editar Cita
    if (formEditar) {
        formEditar.addEventListener("submit", function(e) {
            e.preventDefault();
            handleGuardarEdicion();
        });
    }

    // Cancelar Edición
    if (btnCancelarEdicion) {
        btnCancelarEdicion.addEventListener("click", function() {
            document.getElementById("editar-cita-container").style.display = "none";
        });
    }

    // Cargar datos
    cargarDoctores();
    cargarMisCitas();
});

// --- 4. LÓGICA DEL MENÚ LATERAL (SIDEBAR) ---
function iniciarNavegacion() {
    const botonesMenu = document.querySelectorAll(".nav-btn");
    const secciones = document.querySelectorAll(".content-section");

    botonesMenu.forEach(boton => {
        boton.addEventListener("click", () => {
            botonesMenu.forEach(btn => btn.classList.remove("active"));
            secciones.forEach(sec => sec.classList.remove("active-section"));

            boton.classList.add("active");

            const targetId = boton.getAttribute("data-target"); 
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active-section");
            }
        });
    });
}

// --- 5. FUNCIONES DE CARGA (API) ---

async function cargarDoctores() {
    const token = localStorage.getItem("jwtToken");
    try {
        const response = await fetch(`${apiBaseUrl}/api/doctores`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const doctores = await response.json();
            mostrarDoctoresEnTabla(doctores);
            popularDropdownDoctores(doctores);
        }
    } catch (error) { console.error(error); }
}

async function cargarMisCitas() {
    const token = localStorage.getItem("jwtToken");
    const container = document.getElementById("lista-mis-citas");
    container.innerHTML = "<p>Cargando...</p>";

    try {
        const response = await fetch(`${apiBaseUrl}/api/citas/mis-citas`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const citas = await response.json();
            mostrarMisCitas(citas);
        } else {
            container.innerHTML = "<p>Error al cargar citas.</p>";
        }
    } catch (error) { console.error(error); }
}

// --- 6. FUNCIONES DE DIBUJADO ---

function mostrarDoctoresEnTabla(doctores) {
    const container = document.getElementById("lista-doctores-container");
    if (doctores.length === 0) { container.innerHTML = "<p>No hay doctores.</p>"; return; }
    
    let html = "<table><thead><tr><th>Nombre</th><th>Especialidad</th></tr></thead><tbody>";
    doctores.forEach(d => {
        html += `<tr><td>${d.nombre}</td><td>${d.especialidad}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}

function popularDropdownDoctores(doctores) {
    const select = document.getElementById("select-doctor");
    if (!select) return; 
    select.innerHTML = "<option value='' disabled selected>Selecciona...</option>";
    doctores.forEach(d => {
        const option = document.createElement("option");
        option.value = d.doctorID;
        option.textContent = d.nombre;
        select.appendChild(option);
    });
}

function mostrarMisCitas(citas) {
    const container = document.getElementById("lista-mis-citas");
    if (citas.length === 0) { container.innerHTML = "<p>No tienes citas.</p>"; return; }

    let html = "<table><thead><tr><th>Fecha</th><th>Doctor</th><th>Motivo</th><th>Acciones</th></tr></thead><tbody>";
    
    citas.forEach(cita => {
        const fecha = new Date(cita.fechaHora).toLocaleString();
        const esCancelada = cita.motivo && cita.motivo.includes("[CANCELADA");
        const estiloFila = esCancelada ? "background-color: #f8d7da; color: #721c24;" : "";

        html += `
            <tr style="${estiloFila}">
                <td>${fecha}</td>
                <td>${cita.nombreDoctor}</td>
                <td>${cita.motivo || ''}</td>
                <td>
                    ${!esCancelada ? `
                    <button onclick="prepararEdicion(${cita.citaID}, '${cita.fechaHora}', '${cita.motivo || ''}')" 
                            style="background:#ffc107; border:none; padding:5px; cursor:pointer; border-radius:3px;">Editar</button>
                    <button onclick="eliminarCita(${cita.citaID})" 
                            style="background:#dc3545; color:white; border:none; padding:5px; cursor:pointer; border-radius:3px; margin-left:5px;">X</button>
                    ` : 'CANCELADA'}
                </td>
            </tr>
        `;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}

// --- 7. ACCIONES (AGENDAR, EDITAR, BORRAR CITA) ---

async function handleAgendarCita() {
    const token = localStorage.getItem("jwtToken");
    const btn = document.getElementById("boton-agendar");
    const msg = document.getElementById("mensaje-cita");
    
    btn.disabled = true;
    btn.textContent = "Enviando...";
    msg.textContent = "";

    const datos = {
        doctorID: parseInt(document.getElementById("select-doctor").value),
        fechaHora: document.getElementById("input-fecha").value,
        motivo: document.getElementById("input-motivo").value
    };

    try {
        const response = await fetch(`${apiBaseUrl}/api/citas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            msg.textContent = "¡Cita creada!";
            msg.className = "message success";
            document.getElementById("form-agendar-cita").reset();
            cargarMisCitas(); 
        } else {
            msg.textContent = "Error al agendar.";
            msg.className = "message error";
        }
    } catch (e) { console.error(e); }
    finally { btn.disabled = false; btn.textContent = "Agendar Cita"; }
}

async function eliminarCita(id) {
    if(!confirm("¿Seguro que quieres cancelar esta cita?")) return;
    const token = localStorage.getItem("jwtToken");
    try {
        const response = await fetch(`${apiBaseUrl}/api/citas/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) { alert("Cita cancelada."); cargarMisCitas(); }
        else { alert("No se pudo cancelar."); }
    } catch (e) { console.error(e); }
}

window.prepararEdicion = function(id, fecha, motivo) {
    const container = document.getElementById("editar-cita-container");
    container.style.display = "block";
    document.getElementById("edit-cita-id").value = id;
    document.getElementById("edit-fecha").value = fecha;
    document.getElementById("edit-motivo").value = motivo;
    
    container.scrollIntoView({behavior: "smooth"});
}

async function handleGuardarEdicion() {
    const token = localStorage.getItem("jwtToken");
    const id = document.getElementById("edit-cita-id").value;
    const fecha = document.getElementById("edit-fecha").value;
    const motivo = document.getElementById("edit-motivo").value;

    try {
        const response = await fetch(`${apiBaseUrl}/api/citas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ fechaHora: fecha, motivo: motivo })
        });
        if (response.ok) {
            alert("Cita modificada.");
            document.getElementById("editar-cita-container").style.display = "none";
            cargarMisCitas();
        } else { alert("Error al modificar."); }
    } catch (e) { console.error(e); }
}

// --- 8. ELIMINAR MI PROPIA CUENTA ---
async function eliminarMiCuenta() {
    if (!confirm("¿ESTÁS SEGURO? Esta acción eliminará tu cuenta y tus citas permanentemente.")) return;
    
    const confirmacionTexto = prompt("Para confirmar, escribe 'ELIMINAR' en mayúsculas:");
    if (confirmacionTexto !== "ELIMINAR") {
        alert("Cancelado. No escribiste ELIMINAR correctamente.");
        return;
    }

    const token = localStorage.getItem("jwtToken");

    try {
        const response = await fetch(`${apiBaseUrl}/api/auth/eliminar-mi-cuenta`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Tu cuenta ha sido eliminada.");
            localStorage.removeItem("jwtToken");
            window.location.href = "registro.html"; 
        } else {
            alert("Hubo un error al intentar eliminar tu cuenta.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor.");
    }
}

// --- 9. ACTUALIZAR PERFIL ---
async function handleUpdatePerfil(e) {
    e.preventDefault();

    const email = document.getElementById("update-email").value.trim();
    const pass = document.getElementById("update-password").value;
    const passConfirm = document.getElementById("update-password-confirm").value;
    const token = localStorage.getItem("jwtToken");

    // Validaciones
    if (!email && !pass) {
        alert("Llena al menos un campo para actualizar.");
        return;
    }

    if (pass && pass !== passConfirm) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    const datos = {};
    if (email) datos.nuevoEmail = email;
    if (pass) datos.nuevaPassword = pass;

    try {
        const response = await fetch(`${apiBaseUrl}/api/auth/actualizar-perfil`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            
            // --- LÓGICA MODIFICADA ---
            
            // CASO 1: Si cambió el correo, OBLIGATORIAMENTE debemos salir
            if (email) {
                alert("Has cambiado tu correo. Por seguridad, debes iniciar sesión con el nuevo correo.");
                localStorage.removeItem("jwtToken");
                window.location.href = "login.html";
            } 
            // CASO 2: Si solo cambió la contraseña, podemos dejarlo ahí
            else {
                alert("Contraseña actualizada correctamente.");
                // Limpiamos los campos del formulario
                document.getElementById("form-update-perfil").reset();
                // NO cerramos sesión, el usuario sigue dentro.
            }

        } else {
            alert("Error al actualizar: " + await response.text());
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
}

// --- 10. MEDICAMENTOS Y CARRITO ---
const MEDICAMENTOS_SERVICE_URL = 'http://localhost:5000/Services/MedicamentosService.asmx';
const CARRITO_SERVICE_URL = 'http://localhost:5000/Services/CarritoService.asmx';

// ID del usuario (obtener del token JWT)
function obtenerUsuarioID() {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Buscar el UsuarioID en diferentes claims posibles de .NET
        const nameIdClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
        
        const usuarioID = payload.usuarioId 
            || payload.UsuarioID 
            || payload.nameid 
            || payload.sub 
            || payload[nameIdClaim]
            || payload.id;
        
        console.log("UsuarioID extraído del token:", usuarioID);
        return parseInt(usuarioID) || null;
    } catch (e) {
        console.error("Error al decodificar token:", e);
        return null;
    }
}

// Inicialización de medicamentos
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('txtBuscar')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') buscarMedicamentos();
    });
    
    // Cargar medicamentos y carrito cuando se muestre la sección
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.getAttribute('data-target') === 'seccion-medicamentos') {
                cargarTop10();
                cargarCarritoDB();
            }
        });
    });
});

// --- MEDICAMENTOS ---
async function cargarTop10() {
    const lista = document.getElementById('listaMedicamentos');
    if (!lista) return;
    lista.innerHTML = '<div class="loading">Cargando medicamentos...</div>';

    try {
        const response = await fetch(`${MEDICAMENTOS_SERVICE_URL}/ObtenerMedicamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!response.ok) throw new Error('Error en la respuesta');

        const data = await response.json();
        const medicamentos = data.d || data;
        const top10 = medicamentos.slice(0, 10);
        mostrarMedicamentosLista(top10);
    } catch (error) {
        console.error('Error:', error);
        lista.innerHTML = '<div class="empty-state"><p>Error al cargar medicamentos</p></div>';
    }
}

async function buscarMedicamentos() {
    const termino = document.getElementById('txtBuscar').value.trim();
    const lista = document.getElementById('listaMedicamentos');
    
    if (!termino) {
        cargarTop10();
        return;
    }
    
    lista.innerHTML = '<div class="loading">Buscando medicamentos...</div>';

    try {
        const response = await fetch(`${MEDICAMENTOS_SERVICE_URL}/BuscarMedicamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ termino: termino })
        });

        if (!response.ok) throw new Error('Error en la respuesta');

        const data = await response.json();
        const medicamentos = data.d || data;
        mostrarMedicamentosLista(medicamentos);
    } catch (error) {
        console.error('Error:', error);
        lista.innerHTML = '<div class="empty-state"><p>Error al buscar medicamentos</p></div>';
    }
}

function mostrarMedicamentosLista(medicamentos) {
    const lista = document.getElementById('listaMedicamentos');
    
    if (!medicamentos || medicamentos.length === 0) {
        lista.innerHTML = '<div class="empty-state"><p>No se encontraron medicamentos</p></div>';
        return;
    }

    let html = '';
    medicamentos.forEach(med => {
        html += `
            <div class="medicamento-item">
                <div class="medicamento-info">
                    <h4>${med.Nombre}</h4>
                    <p>${med.NombreGenerico || 'Sin nombre genérico'} - ${med.Laboratorio || 'Sin laboratorio'}</p>
                    <span class="medicamento-tag">${med.Presentacion || ''} ${med.Concentracion || ''}</span>
                </div>
                <div class="cantidad-control">
                    <input type="number" id="cant-${med.MedicamentoID}" value="1" min="1" max="99" class="input-cantidad">
                    <button class="btn-agregar" onclick="agregarAlCarritoDB(${med.MedicamentoID})">Agregar</button>
                </div>
            </div>
        `;
    });
    lista.innerHTML = html;
}

// --- CARRITO CON BASE DE DATOS ---
async function cargarCarritoDB() {
    const lista = document.getElementById('carritoLista');
    const count = document.getElementById('carritoCount');
    if (!lista) return;
    
    lista.innerHTML = '<div class="loading">Cargando carrito...</div>';

    try {
        const usuarioID = obtenerUsuarioID();
        const response = await fetch(`${CARRITO_SERVICE_URL}/ObtenerCarrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioID: usuarioID })
        });

        if (!response.ok) throw new Error('Error al cargar carrito');

        const data = await response.json();
        const items = data.d || data;
        
        if (count) count.textContent = items.length;
        
        if (!items || items.length === 0) {
            lista.innerHTML = '<div class="empty-state"><p>No hay medicamentos en el carrito</p></div>';
            return;
        }

        let html = '';
        items.forEach(item => {
            html += `
                <div class="carrito-item">
                    <div class="medicamento-info">
                        <h4>${item.NombreMedicamento}</h4>
                        <p>${item.Presentacion || ''} ${item.Concentracion || ''}</p>
                        <span class="cantidad-badge">Cantidad: ${item.Cantidad}</span>
                    </div>
                    <button class="btn-quitar" onclick="quitarDelCarritoDB(${item.CarritoID})">Quitar</button>
                </div>
            `;
        });
        lista.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        lista.innerHTML = '<div class="empty-state"><p>Error al cargar carrito</p></div>';
    }
}

async function agregarAlCarritoDB(medicamentoID) {
    const cantidadInput = document.getElementById(`cant-${medicamentoID}`);
    const cantidad = cantidadInput ? parseInt(cantidadInput.value) || 1 : 1;
    const usuarioID = obtenerUsuarioID();

    try {
        const response = await fetch(`${CARRITO_SERVICE_URL}/AgregarAlCarrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuarioID: usuarioID, 
                medicamentoID: medicamentoID, 
                cantidad: cantidad 
            })
        });

        if (!response.ok) throw new Error('Error al agregar');

        const data = await response.json();
        if (data.d || data === true) {
            cargarCarritoDB();
        } else {
            alert('Error al agregar al carrito');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar al carrito');
    }
}

async function quitarDelCarritoDB(carritoID) {
    try {
        const response = await fetch(`${CARRITO_SERVICE_URL}/QuitarDelCarrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carritoID: carritoID })
        });

        if (!response.ok) throw new Error('Error al quitar');

        const data = await response.json();
        if (data.d || data === true) {
            cargarCarritoDB();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function limpiarCarrito() {
    if (!confirm('¿Seguro que deseas limpiar todo el carrito?')) return;
    
    const usuarioID = obtenerUsuarioID();
    
    try {
        const response = await fetch(`${CARRITO_SERVICE_URL}/LimpiarCarrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioID: usuarioID })
        });

        if (!response.ok) throw new Error('Error al limpiar');

        cargarCarritoDB();
    } catch (error) {
        console.error('Error:', error);
    }
}
