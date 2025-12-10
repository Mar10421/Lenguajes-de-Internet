"use strict";

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. CONFIGURACIÓN ---
    const apiBaseUrl = "https://localhost:44353"; 

    // --- 2. REFERENCIAS ---
    const registroForm = document.getElementById("registro-form");
    const nombreInput = document.getElementById("input-nombre");
    const emailInput = document.getElementById("input-correo");
    const passwordInput = document.getElementById("input-password");
    const fechaNacInput = document.getElementById("input-fechanac");
    const sexoInput = document.getElementById("input-sexo");
    const mensajeRegistro = document.getElementById("mensaje-registro");
    const registroButton = document.getElementById("boton-registro");

    // --- 3. EVENT LISTENER (Con protección contra null) ---
    if (registroForm) {
        registroForm.addEventListener("submit", function(event) {
            event.preventDefault(); // ¡Esto evita que se borren los campos!
            handleRegistro();
        });
    } else {
        console.error("Error: No se encontró el formulario con id 'registro-form'");
    }

    // --- 4. FUNCIÓN DE REGISTRO ---
    async function handleRegistro() {
        mensajeRegistro.textContent = "";
        registroButton.textContent = "Registrando...";
        registroButton.disabled = true;

        const datosRegistro = {
            nombre: nombreInput.value,
            correo: emailInput.value,
            password: passwordInput.value,
            fechaNac: fechaNacInput.value || null,
            sexo: sexoInput.value || null
        };

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/registrar-paciente`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosRegistro) 
            });

            if (response.ok) {
                alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
                window.location.href = "login.html"; 
            } else {
                // Intentar leer error como texto primero para evitar errores de JSON
                const errorText = await response.text();
                let mensajeError = "Error al registrar.";
                
                try {
                    // Si es JSON, lo parseamos
                    const errorJson = JSON.parse(errorText);
                    mensajeError = errorJson.message || errorJson.title || errorText;
                } catch (e) {
                    mensajeError = errorText; // Si no es JSON, usamos el texto plano
                }

                mensajeRegistro.textContent = "Error: " + mensajeError;
                mensajeRegistro.style.color = "red";
                console.error("Error de registro:", errorText);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            mensajeRegistro.textContent = "No se pudo conectar al servidor.";
            mensajeRegistro.style.color = "red";
        } finally {
            registroButton.textContent = "Registrarme";
            registroButton.disabled = false;
        }
    }
});