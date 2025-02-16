const cidadeInput = document.querySelector('.cidade-input');
const procurarBtn = document.querySelector('.procurar-btn');

const climaInfo = document.querySelector('.clima-info');

const notFoundCidadeMensagem = document.querySelector('.not-found-cidade-mensagem');
const procuraCidadeMensagem = document.querySelector('.procura-cidade-mensagem');

const paisTxt = document.querySelector('.pais-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const umidadeValorTxt = document.querySelector('.umidade-valor-txt');
const ventoValorTxt = document.querySelector('.vento-valor-txt');
const climaSumarioImg = document.querySelector('.clima-sumario-img');
const dadosAtuaisTxt = document.querySelector('.dados-atuais-txt');

const previsaoItemsContainer = document.querySelector('.previsao-items-container');

const apiKey = 'ba24bd40279fbfd31eed52273c43c4d9';

procurarBtn.addEventListener('click', () => {
    if (cidadeInput.value.trim() != '') {
        atualizarInformacoesClima(cidadeInput.value);
        cidadeInput.value = '';
        cidadeInput.blur();
    }
});

cidadeInput.addEventListener('keydown', (evento) => {
    if (evento.key == 'Enter' && cidadeInput.value.trim() != '') {
        atualizarInformacoesClima(cidadeInput.value);
        cidadeInput.value = '';
        cidadeInput.blur();
    }
});

async function obterDadosClima(cidade) {
    const urlApi = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    const resposta = await fetch(urlApi);
    return resposta.json();
}

async function obterDadosPrevisao(cidade) {
    const urlApi = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    const resposta = await fetch(urlApi);
    return resposta.json();
}

function obterIconeClima(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    else return 'clouds.svg';
}

function obterDadosAtuaisTxt() {
    const dadosAtuaisTxt = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    };
    return dadosAtuaisTxt.toLocaleDateString('pt-BR', options);
}

function traduzirCondicao(clima) {
    const traducoes = {
        clear: "Céu Limpo",
        clouds: "Nuvens",
        rain: "Chuva",
        snow: "Neve",
        thunderstorm: "Tempestade",
        drizzle: "Chuva Fraca",
        mist: "Nevoeiro",
        haze: "Nebuloso",
        smoke: "Fumaça",
        sand: "Areia",
        dust: "Poeira",
        fog: "Neblina",
        ash: "Cinzas",
    };

    const climaMin = clima.toLowerCase();

    console.log("Condição recebida (convertida para minúsculas):", climaMin);

    return traducoes[climaMin] || clima;
}


async function atualizarInformacoesClima(cidade) {
    const dadosClima = await obterDadosClima(cidade);

    if (dadosClima.cod !== 200) {
        mostrarSecao(notFoundCidadeMensagem);
        return;
    }

    const { name: pais, main: { temp, humidity }, weather: [{ id, main }], wind: { speed } } = dadosClima;
    console.log("Condição do clima (main):", main);

    paisTxt.textContent = pais;
    tempTxt.textContent = Math.round(temp) + ' °C';
    conditionTxt.textContent = traduzirCondicao(main);
    umidadeValorTxt.textContent = humidity + '%';
    ventoValorTxt.textContent = `${speed} m/s`;

    dadosAtuaisTxt.textContent = obterDadosAtuaisTxt();
    climaSumarioImg.src = `assets/assets/weather/${obterIconeClima(id)}`;

    await atualizarPrevisoesInfo(cidade);
    mostrarSecao(climaInfo);
}

async function atualizarPrevisoesInfo(cidade) {
    const dadosPrevisao = await obterDadosPrevisao(cidade);

    previsaoItemsContainer.innerHTML = '';
    dadosPrevisao.list.forEach(previsaoClima => {
        const timeTaken = '12:00:00';
        const todayDate = new Date().toISOString().split('T')[0];

        if (previsaoClima.dt_txt.includes(timeTaken) && !previsaoClima.dt_txt.includes(todayDate)) {
            atualizarPrevisaoItems(previsaoClima);
        }
    });
}

function atualizarPrevisaoItems(dadosClima) {
    const { dt_txt: date, weather: [{ id }], main: { temp } } = dadosClima;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short',
    };
    const dateResult = dateTaken.toLocaleDateString('pt-BR', dateOption);

    const itemPrevisao = `
        <div class="previsao-item">
            <h5 class="previsao-item-dado">${dateResult}</h5>
            <img src="assets/assets/weather/${obterIconeClima(id)}" class="previsao-item-img">
            <h5 class="previsao-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    previsaoItemsContainer.insertAdjacentHTML('beforeend', itemPrevisao);
}

function mostrarSecao(secao) {
    [climaInfo, procuraCidadeMensagem, notFoundCidadeMensagem].forEach(secao => secao.style.display = 'none');
    secao.style.display = 'flex';
}
