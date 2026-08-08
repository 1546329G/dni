const TOKEN = "f05b03873236d9b65b5c4805048b12f235d0b38a07c4fd30eea5412e389252d4";
const URL_BASE = "https://api.apiperu.dev";

let tipo = "dni";

const tabDni = document.getElementById("tab-dni");
const tabRuc = document.getElementById("tab-ruc");
const botonDni = document.getElementById("boton");
const botonRuc = document.getElementById("boton-ruc");

tabDni.addEventListener("click", () => activar("dni"));
tabRuc.addEventListener("click", () => activar("ruc"));
botonDni.addEventListener("click", traerDatos);
botonRuc.addEventListener("click", traerDatos);

function activar(nuevoTipo) {
    tipo = nuevoTipo;
    document.getElementById("tab-dni").classList.toggle("active", tipo === "dni");
    document.getElementById("tab-ruc").classList.toggle("active", tipo === "ruc");
    document.getElementById("dni-group").style.display = tipo === "dni" ? "flex" : "none";
    document.getElementById("ruc-group").style.display = tipo === "ruc" ? "flex" : "none";
    ocultarResultado();
}

function traerDatos() {
    const numero = document.getElementById(tipo).value.trim();
    const long = tipo === "dni" ? 8 : 11;

    ocultarResultado();

    if (!/^\d+$/.test(numero) || numero.length !== long) {
        mostrarError(`Ingresa un ${tipo.toUpperCase()} válido de ${long} dígitos.`);
        return;
    }

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    fetch(`${URL_BASE}/${tipo}`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ [tipo]: numero })
    })
        .then(res => res.json())
        .then(json => {
            loader.style.display = "none";
            if (!json.success) {
                mostrarError(json.message || "Error al consultar la API.");
                return;
            }
            renderizar(json.data);
        })
        .catch(() => {
            loader.style.display = "none";
            mostrarError("No se pudo conectar con la API. Revisa tu conexión o tu token.");
        });
}

function renderizar(datos) {
    const campos =
        tipo === "dni"
            ? [
                  ["numero", "Número"],
                  ["codigo_verificacion", "Código verificación"],
                  ["nombre_completo", "Nombre completo", true],
                  ["nombres", "Nombres", true],
                  ["apellido_paterno", "Apellido paterno"],
                  ["apellido_materno", "Apellido materno"]
              ]
            : [
                  ["ruc", "RUC"],
                  ["nombre_o_razon_social", "Razón social", true],
                  ["estado", "Estado"],
                  ["condicion", "Condición"],
                  ["direccion", "Dirección", true],
                  ["departamento", "Departamento"],
                  ["es_agente_de_retencion", "Agente de retención"],
                  ["es_buen_contribuyente", "Buen contribuyente"]
              ];

    document.getElementById("resultado-titulo").textContent =
        tipo === "dni" ? "Datos de la persona" : "Datos de la empresa";

    const contenedor = document.getElementById("resultado-datos");
    contenedor.innerHTML = "";

    for (const [clave, etiqueta, ancho] of campos) {
        const valor = datos[clave];
        if (valor === undefined || valor === null || valor === "") continue;

        const div = document.createElement("div");
        div.className = "campo" + (ancho ? " ancho" : "");

        const dt = document.createElement("dt");
        dt.textContent = etiqueta;
        const dd = document.createElement("dd");
        dd.textContent = String(valor).toLowerCase();

        div.appendChild(dt);
        div.appendChild(dd);
        contenedor.appendChild(div);
    }

    document.getElementById("resultado").style.display = "block";
}

function mostrarError(mensaje) {
    const error = document.getElementById("error");
    error.textContent = mensaje;
    error.style.display = "block";
}

function ocultarResultado() {
    document.getElementById("resultado").style.display = "none";
    document.getElementById("error").style.display = "none";
}
