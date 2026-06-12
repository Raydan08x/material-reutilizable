import { ConversorTemperatura } from './funciones.js';
import { SelectorPersonalizado } from "./funciones.js";

const selectorUnidad = new SelectorPersonalizado("selector-unidad");

const conversor = new ConversorTemperatura();

const inputTemperatura = document.getElementById('temperatura');
const selectUnidad = document.getElementById('unidad-medida');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');
const botonConvertir = document.getElementById('convertir');

botonConvertir.addEventListener('click', () => {
    const valor = inputTemperatura.value.trim();
    const unidad = selectUnidad.value;

    if (valor === '') {
        mensaje.textContent = 'El campo no puede estar vacío.';
        mensaje.style.color = 'red';
        resultado.textContent = '';
        return;
    }

    const temperatura = Number(valor);

    if (!Number.isFinite(temperatura)) {
        mensaje.textContent = 'Por favor, ingresa un número válido.';
        mensaje.style.color = 'red';
        resultado.textContent = '';
        return;
    }

    mensaje.textContent = 'Valor válido.';
    mensaje.style.color = 'green';

    if (unidad === 'celsius') {
        conversor.celsius = temperatura;

        resultado.innerHTML = `
            Fahrenheit: ${conversor.celsiusToFahrenheit().toFixed(2)} °F<br>
            Kelvin: ${conversor.celsiusToKelvin().toFixed(2)} K
        `;
    }

    if (unidad === 'fahrenheit') {
        conversor.fahrenheit = temperatura;

        resultado.innerHTML = `
            Celsius: ${conversor.fahrenheitToCelsius().toFixed(2)} °C<br>
            Kelvin: ${conversor.fahrenheitToKelvin().toFixed(2)} K
        `;
    }

    if (unidad === 'kelvin') {
        conversor.kelvin = temperatura;

        resultado.innerHTML = `
            Celsius: ${conversor.kelvinToCelsius().toFixed(2)} °C<br>
            Fahrenheit: ${conversor.kelvinToFahrenheit().toFixed(2)} °F
        `;
    }
});