export class ConversorTemperatura {
    constructor() {
        this.celsius = 0;
        this.fahrenheit = 0;
        this.kelvin = 0;
    }
    celsiusToFahrenheit() {
        this.fahrenheit = (this.celsius * 9 / 5) + 32;
        return this.fahrenheit;
        }

    celsiusToKelvin() {
        this.kelvin = this.celsius + 273.15;
        return this.kelvin;
        }
    
    fahrenheitToCelsius() {
        this.celsius = (this.fahrenheit - 32) * 5 / 9;
        return this.celsius;
        }
    fahrenheitToKelvin() {
        this.kelvin = (this.fahrenheit - 32) * 5 / 9 + 273.15;
        return this.kelvin;
        }
    
    kelvinToCelsius() {
        this.celsius = this.kelvin - 273.15;
        return this.celsius;
        }
    
    kelvinToFahrenheit() {
        this.fahrenheit = (this.kelvin - 273.15) * 9 / 5 + 32;
        return this.fahrenheit;
        }
    }

export class validador {
    constructor(inputId, mensajeId) {
        this.input = document.getElementById(inputId);
        this.mensaje = document.getElementById(mensajeId);
        this.iniciarEvento();
    }

    iniciarEvento() {
        this.input.addEventListener('input', () => {
            this.validar();
        });
    }

    validar() {
        const valor = this.input.value.trim();
        if (valor === '') {
            this.mostrarMensaje('El campo no puede estar vacío.', false);
            return false;
        
        } 
    const numero = Number(valor);
    
    if (Number.isFinite(numero)) {
        this.mostrarMensaje('Valor válido.', true);
        return true;
    }
    else {
        this.mostrarMensaje('Por favor, ingresa un número válido.', false);
        return false;
    }
    }

    mostrarMensaje(texto, esValido) {
        this.mensaje.textContent = texto;

        if (esValido) {
            this.mensaje.style.color = 'green';
            this.input.style.border= '2px solid green';
        } else {
            this.mensaje.style.color = 'red';
            this.input.style.border= '2px solid red';
        }
    }

}



export class SelectorPersonalizado {
    constructor(selectorId) {
        this.selector = document.getElementById(selectorId);
        this.boton = this.selector.querySelector(".custom-select__button");
        this.textoBoton = this.selector.querySelector(".custom-select__value");
        this.inputOculto = this.selector.querySelector("#unidad-medida");
        this.opciones = this.selector.querySelectorAll(".custom-select__option");

        this.iniciarEventos();
    }

    iniciarEventos() {
        this.boton.addEventListener("click", () => {
            this.abrirCerrarSelector();
        });

        this.opciones.forEach((opcion) => {
            opcion.addEventListener("click", () => {
                this.seleccionarOpcion(opcion);
            });
        });

        document.addEventListener("click", (evento) => {
            this.cerrarSiHaceClickAfuera(evento);
        });
    }

    abrirCerrarSelector() {
        this.selector.classList.toggle("is-open");
    }

    seleccionarOpcion(opcion) {
        const valor = opcion.dataset.value;
        const texto = opcion.textContent;

        this.inputOculto.value = valor;
        this.textoBoton.textContent = texto;

        this.opciones.forEach((item) => {
            item.classList.remove("is-selected");
        });

        opcion.classList.add("is-selected");
        this.selector.classList.remove("is-open");
    }

    cerrarSiHaceClickAfuera(evento) {
        if (!this.selector.contains(evento.target)) {
            this.selector.classList.remove("is-open");
        }
    }
}