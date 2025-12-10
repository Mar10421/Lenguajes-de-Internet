"use strict";

document.addEventListener("DOMContentLoaded", function() {

    const apiBaseUrl = "https://localhost:44353"; 

    // Referencias
    const tabPaciente = document.getElementById("tab-paciente");
    const tabDoctor = document.getElementById("tab-doctor");
    const formTitulo = document.getElementById("form-titulo"); // <--- NUESTRO BOTÓN SECRETO
    const loginButton = document.getElementById("boton-login");
    const linkRegistro = document.getElementById("link-registro-container");
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("input-correo");
    const passwordInput = document.getElementById("input-password");
    const errorMensaje = document.getElementById("mensaje-error");

    let rolSeleccionado = "Paciente";

    // --- LÓGICA SECRETA (EASTER EGG) ---
    let clicksSecretos = 0;
    
    if (formTitulo) {
        formTitulo.addEventListener("click", function() {
            clicksSecretos++;
            
            // Si llega a 3 clics...
            if (clicksSecretos === 3) {
                // ...redirige al portal secreto
                window.location.href = "acceso-admin.html";
                clicksSecretos = 0; // Resetear
            }

            // Si pasa más de 1 segundo sin dar el siguiente clic, se resetea la cuenta
            // (Para evitar que usuarios random entren por accidente)
            setTimeout(() => {
                clicksSecretos = 0;
            }, 500); 
        });
    }
    // -----------------------------------

    // Pestañas
    if (tabPaciente && tabDoctor) {
        tabPaciente.addEventListener("click", () => cambiarPestana("Paciente"));
        tabDoctor.addEventListener("click", () => cambiarPestana("Doctor"));
    }

    function cambiarPestana(rol) {
        rolSeleccionado = rol;
        if (errorMensaje) errorMensaje.textContent = "";

        if (rol === "Paciente") {
            tabPaciente.classList.add("active-paciente");
            tabDoctor.classList.remove("active-doctor");
            formTitulo.textContent = "Ingreso Pacientes"; // Cambiamos el texto
            loginButton.style.backgroundColor = "#007bff"; 
            if (linkRegistro) linkRegistro.style.display = "block";
        } else {
            tabDoctor.classList.add("active-doctor");
            tabPaciente.classList.remove("active-paciente");
            formTitulo.textContent = "Ingreso Doctores"; // Cambiamos el texto
            loginButton.style.backgroundColor = "#198754"; 
            if (linkRegistro) linkRegistro.style.display = "none";
        }
    }

    // Login (Igual que antes)
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            handleLogin();
        });
    }

    async function handleLogin() {
        const correoVal = emailInput.value;
        const passwordVal = passwordInput.value;
        
        errorMensaje.textContent = "";
        loginButton.textContent = "Verificando...";
        loginButton.disabled = true;

        const datosLogin = { correo: correoVal, password: passwordVal };

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosLogin)
            });

            if (response.ok) {
                const data = await response.json();
                const tokenDecodificado = parseJwt(data.token);
                const rolClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
                let rolesUsuario = tokenDecodificado[rolClaim];
                if (typeof rolesUsuario === 'string') rolesUsuario = [rolesUsuario];

                // Reglas estrictas (Igual que antes)
                const esAdmin = rolesUsuario.includes("Admin");

                if (!esAdmin) {
                    if (rolSeleccionado === "Doctor" && !rolesUsuario.includes("Doctor")) {
                        errorMensaje.textContent = "Error: Esta cuenta no es de Doctor.";
                        restablecerBoton(); return;
                    }
                    if (rolSeleccionado === "Paciente" && !rolesUsuario.includes("Paciente")) {
                        errorMensaje.textContent = "Error: Esta cuenta no es de Paciente.";
                        restablecerBoton(); return;
                    }
                }

                localStorage.setItem("jwtToken", data.token);

                if (esAdmin) window.location.href = "dashboard-admin.html";
                else if (rolesUsuario.includes("Doctor")) window.location.href = "dashboard-doctor.html";
                else window.location.href = "dashboard.html";

            } else {
                errorMensaje.textContent = "Credenciales incorrectas.";
                restablecerBoton();
            }
        } catch (error) {
            console.error(error);
            errorMensaje.textContent = "Error de conexión.";
            restablecerBoton();
        }
    }

    function restablecerBoton() {
        loginButton.textContent = "Ingresar";
        loginButton.disabled = false;
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) { return {}; }
    }
});