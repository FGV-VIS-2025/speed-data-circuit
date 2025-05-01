import {
    cores_equipes, nationalityToFlagEmoji
} from "./mock-consts.js";

// FUNÇÕES DOS DADOS --------------------------------------------------------------------------------------------------------------------------------

const racesFilePath = "f1db/races.csv";
const pitStopsFilePath = "f1db/pit_stops.csv";
const resultsFilePath = "f1db/results.csv";
const driversFilePath = "f1db/drivers.csv";
const constructorsFilePath = "f1db/constructors.csv";
const weatherDataFilePath = "f1db/weather.csv";
const lapTimesFilePath = "f1db/lap_times.csv";
const circuitsFilePath = "f1db/circuits.csv";
const tyreStintsFilePath = "f1db/tyre_stints.csv";

// CACHE DE DADOS CSV EM MEMÓRIA
const csvDataCache = {};

function loadCSVData(filePath) {
    if (csvDataCache[filePath]) {
        // Retorna uma Promise resolvida com o cache
        return Promise.resolve(csvDataCache[filePath]);
    }
    // Carrega e armazena no cache
    return d3.csv(filePath).then(data => {
        csvDataCache[filePath] = data;
        return data;
    });
}

function getAllValidSeasons() {
    return [
        { year: '2018' },
        { year: '2019' },
        { year: '2020' },
        { year: '2021' },
        { year: '2022' },
        { year: '2023' },
        { year: '2024' },
    ];
}

function filterValidRaces(data, raceIds) {
    return data.filter(row => {
        const raceId = Number(row.raceId);
        return raceIds.includes(raceId);
    });
}

async function getValidRaceIds() {
    try {
        const data = await loadCSVData(pitStopsFilePath);
        const validRaceIds = new Set();
        data.forEach(row => {
            if (row.raceId) {
                validRaceIds.add(Number(row.raceId));
            }
        });
        return Array.from(validRaceIds);
    } catch (error) {
        console.error('Erro ao carregar os dados de pit stops:', error);
        return [];
    }
}


async function getValidRacesByYear(year) {
    try {
        const data = await loadCSVData(racesFilePath);
        const validRaceIds = await getValidRaceIds();
        const validRaces = data.filter(row => Number(row.year) === Number(year));
        return filterValidRaces(validRaces, validRaceIds);
    } catch (error) {
        console.error('Erro ao carregar as corridas:', error);
        return [];
    }
}

async function getDriversByRace(raceId) {
    try {
        const results = await loadCSVData(resultsFilePath);
        const drivers = await loadCSVData(driversFilePath);

        const driverIds = results
            .filter(r => Number(r.raceId) === Number(raceId))
            .map(r => Number(r.driverId)); // Garante que driverId vira número

        return drivers.filter(d => driverIds.includes(Number(d.driverId)));
    } catch (error) {
        console.error('Erro ao carregar drivers da corrida:', error);
        return [];
    }
};

async function getTeamsByRace(raceId) {
    try {
        const racesData = await loadCSVData(resultsFilePath);
        const filteredData = racesData.filter(l => Number(l.raceId) === Number(raceId));

        const driverTeams = {};

        filteredData.forEach(result => {
            const driverId = result.driverId;
            driverTeams[driverId] = result; // ou só { constructorId: result.constructorId } se quiser menos info
        });

        return driverTeams;
    } catch (error) {
        console.error('Erro ao carregar drivers da corrida:', error);
        return {};
    }
}


async function getConstructorDataByID(constructorID) {
    try {
        const results = await loadCSVData(constructorsFilePath);
        return results.filter(l => Number(l.constructorId) === Number(constructorID));
    } catch (error) {
        console.error('Erro ao carregar drivers da corrida:', error);
        return [];
    }
}

async function getAgesByRace(raceId) {
    const drivers = await loadCSVData(driversFilePath);
    const results = await loadCSVData(resultsFilePath);
    const races = await loadCSVData(racesFilePath);

    const race = races.find(r => Number(r.raceId) === Number(raceId));
    if (!race) return {};
    const raceDate = new Date(race.date);

    const raceDriverIds = results
        .filter(r => Number(r.raceId) === Number(raceId))
        .map(r => r.driverId);

    const driverAges = {}; // cria um objeto vazio

    raceDriverIds.forEach(driverId => {
        const driver = drivers.find(d => d.driverId === driverId);
        if (!driver || !driver.dob) {
            driverAges[driverId] = { driverId, driver, age: null };
        } else {
            const dob = new Date(driver.dob);
            let age = raceDate.getFullYear() - dob.getFullYear();
            const m = raceDate.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && raceDate.getDate() < dob.getDate())) {
                age--;
            }
            driverAges[driverId] = { driverId, driver, age };
        }
    });

    return driverAges;
}

async function getWeatherRace(raceId) {
    const weatherData = await loadCSVData(weatherDataFilePath);

    const raceWeather = weatherData.find(w => Number(w.raceId) === Number(raceId));
    if (!raceWeather) return null;

    return {
        raceId: Number(raceWeather.raceId),
        avg_airtemp: parseFloat(raceWeather.avg_airtemp),
        avg_tracktemp: parseFloat(raceWeather.avg_tracktemp),
        avg_humidity: parseFloat(raceWeather.avg_humidity),
        avg_pressure: parseFloat(raceWeather.avg_pressure),
        avg_windspeed: parseFloat(raceWeather.avg_windspeed),
        rainfall: raceWeather.rainfall === 'True'
    };
}

async function getDateAndTime(raceId) {
    const raceData = await loadCSVData(racesFilePath);
    const race = raceData.find(l => Number(l.raceId) === Number(raceId));

    if (!race) return null;

    return {
        date: race.date,
        time: race.time
    }
}

function formatDate(date) {
    const aux = date.split("-");
    const formattedDate = `${aux[2]}/${aux[1]}/${aux[0]}`;
    return formattedDate;
}

async function getLapTimes(raceId) {
    const raceData = await loadCSVData(lapTimesFilePath);

    // Filtra os dados pela corrida
    const raceLapData = raceData.filter(l => Number(l.raceId) === Number(raceId));

    // Cria o dicionário com driverId como chave e acumula os milissegundos
    const lapTimesByDriver = raceLapData.reduce((acc, lap) => {
        const driverId = lap.driverId;
        if (!acc[driverId]) {
            acc[driverId] = []; // Se não existir o driverId, cria um array vazio
        }

        // Acumula os milissegundos
        const previousMilliseconds = acc[driverId].length > 0 ? acc[driverId][acc[driverId].length - 1].milliseconds_acumulated : 0;
        const millisecondsAccumulated = previousMilliseconds + Number(lap.milliseconds);

        // Adiciona a volta com o acumulado de milissegundos
        acc[driverId].push({
            position: lap.position,
            lap: lap.lap,
            time: lap.time,
            milliseconds: Number(lap.milliseconds),
            milliseconds_acumulated: millisecondsAccumulated
        });

        return acc;
    }, {});

    return lapTimesByDriver;
}

async function getCircuitIdByRaceId(raceId) {
    const raceData = await loadCSVData(racesFilePath);
    const circuitData = raceData.filter(l => Number(l.raceId) === Number(raceId));
    return circuitData[0].circuitId;
}

async function getTyreStintsByRace(raceId) {
    const drivers = await loadCSVData(driversFilePath);
    const stints = await loadCSVData(tyreStintsFilePath);

    const raceStints = stints.filter(s => Number(s.raceId) === Number(raceId));
    const driverIds = [...new Set(raceStints.map(s => s.driverId))];

    const result = {};

    driverIds.forEach(driverId => {
        const stintsByDriver = raceStints
            .filter(s => s.driverId === driverId)
            .sort((a, b) => Number(a.startLap) - Number(b.startLap));

        const stintPorVolta = {};

        stintsByDriver.forEach(stint => {
            const start = Number(stint.startLap);
            const end = start + Number(stint.lapCount) - 1;
            for (let lap = start; lap <= end; lap++) {
                stintPorVolta[lap] = stint.compound;
            }
        });

        result[driverId] = stintPorVolta;
    });

    return result;
}

async function getRaceTimes(raceId, maxLap = null) {
    const lapTimes = await loadCSVData(lapTimesFilePath);
    const drivers = await loadCSVData(driversFilePath);

    let raceLapTimes = lapTimes.filter(l => Number(l.raceId) === Number(raceId));
    if (maxLap !== null) {
        raceLapTimes = raceLapTimes.filter(l => Number(l.lap) <= Number(maxLap));
    }

    const driversMap = Object.fromEntries(drivers.map(d => [d.driverId, d]));
    const lapsByDriver = {};

    raceLapTimes.forEach(lap => {
        const driverId = lap.driverId;
        if (!lapsByDriver[driverId]) {
            lapsByDriver[driverId] = {
                driverId,
                driver: driversMap[driverId] || null,
                laps: []
            };
        }
        lapsByDriver[driverId].laps.push({
            lap: Number(lap.lap),
            time: lap.time,
            milliseconds: lap.milliseconds ? Number(lap.milliseconds) : null
        });
    });

    return Object.values(lapsByDriver);
}

async function getRaceEvolution(raceId, maxLap = null) {
    const results = await loadCSVData(resultsFilePath);
    const drivers = await loadCSVData(driversFilePath);
    const lapTimes = await loadCSVData(lapTimesFilePath);

    const raceDriverIds = results.filter(r => Number(r.raceId) === Number(raceId)).map(r => r.driverId);
    let raceLapTimes = lapTimes.filter(l => Number(l.raceId) === Number(raceId));

    let maxLapNumber;
    if (maxLap !== null) {
        maxLapNumber = Number(maxLap);
        raceLapTimes = raceLapTimes.filter(l => Number(l.lap) <= maxLapNumber);
    } else {
        maxLapNumber = Math.max(...raceLapTimes.map(l => Number(l.lap)));
    }

    return raceDriverIds.map(driverId => {
        const driverInfo = drivers.find(d => d.driverId === driverId);
        const positions = [];
        for (let lap = 1; lap <= maxLapNumber; lap++) {
            const lapEntry = raceLapTimes.find(l => Number(l.driverId) === Number(driverId) && Number(l.lap) === lap);
            positions.push(lapEntry ? Number(lapEntry.position) : null);
        }
        return {
            driverId,
            driver: driverInfo,
            positions
        };
    });
}

async function getDriversSeasonScorebyRace(raceId, resultsFilePath, driversFilePath, racesFilePath) {
    const results = await loadCSVData(resultsFilePath);
    const drivers = await loadCSVData(driversFilePath);
    const races = await loadCSVData(racesFilePath);

    const race = races.find(r => Number(r.raceId) === Number(raceId));
    if (!race) return [];

    const year = Number(race.year);
    const round = Number(race.round);

    const raceIdsUntilNow = races
        .filter(r => Number(r.year) === year && Number(r.round) <= round)
        .map(r => r.raceId);

    const filteredResults = results.filter(r => raceIdsUntilNow.includes(r.raceId));

    const pointsByDriver = {};
    filteredResults.forEach(r => {
        const driverId = r.driverId;
        const pts = parseFloat(r.points) || 0;
        if (!pointsByDriver[driverId]) pointsByDriver[driverId] = 0;
        pointsByDriver[driverId] += pts;
    });

    return Object.entries(pointsByDriver).map(([driverId, points]) => {
        const driver = drivers.find(d => d.driverId === driverId);
        return {
            driverId,
            driver,
            points
        };
    }).sort((a, b) => b.points - a.points);
}

// CONSTRUINDO A LINHA DE CHEGADA -------------------------------------------------------------------------------------------------------------------

const rect0 = document.getElementById('rect0');
const rect1 = document.getElementById('rect1');
const rect2 = document.getElementById('rect2');

function updateRects() {
    const bbox = rect0.getBBox();

    function adjustRect(rect, reduction) {
        rect.setAttribute('x', bbox.x + reduction / 2);
        rect.setAttribute('y', bbox.y + reduction / 2);
        rect.setAttribute('width', bbox.width - reduction);
        rect.setAttribute('height', bbox.height - reduction);
    }

    adjustRect(rect1, 20);
    adjustRect(rect2, 40);
}

// Roda quando a página carrega
updateRects();

// Observa mudanças nos atributos de rect0
const observer = new MutationObserver(updateRects);

observer.observe(rect0, {
    attributes: true,
    attributeFilter: ['x', 'y', 'width', 'height']
});

window.addEventListener('resize', updateRects);

function drawFinishLine() {
    const rect0 = document.getElementById('rect0');
    const rect2 = document.getElementById('rect2');
    const grid = document.getElementById('grid');

    const bbox0 = rect0.getBBox();
    const bbox2 = rect2.getBBox();

    const baseX = bbox0.x + bbox0.width - 150;

    const squareSize = 20;
    const numCols = 4;
    const numRows = Math.floor(bbox2.height / squareSize);

    grid.innerHTML = "";

    for (let row = 0; row < numRows; row++) {
        const y = bbox2.y + row * squareSize;
        for (let col = 0; col < numCols; col++) {
            const x = baseX + col * squareSize;
            let fill;
            if (row % 2 === 0) {
                fill = (col % 2 === 0) ? "#ffffff" : "#000000";
            } else {
                fill = (col % 2 === 0) ? "#000000" : "#ffffff";
            }
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", squareSize);
            rect.setAttribute("height", squareSize);
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("style", "fill:" + fill + ";");
            grid.appendChild(rect);
        }
    }

    // Desenhar a última linha cortada
    const sobra = bbox2.height - numRows * squareSize;
    if (sobra > 0.5) { // evita erro numérico pequeno
        const y = bbox2.y + numRows * squareSize;
        for (let col = 0; col < numCols; col++) {
            const x = baseX + col * squareSize;
            let fill;
            if (numRows % 2 === 0) {
                fill = (col % 2 === 0) ? "#ffffff" : "#000000";
            } else {
                fill = (col % 2 === 0) ? "#000000" : "#ffffff";
            }
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", squareSize);
            rect.setAttribute("height", sobra);
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("style", "fill:" + fill + ";");
            grid.appendChild(rect);
        }
    }
}

// Ao carregar
drawFinishLine();
window.addEventListener('resize', drawFinishLine);


// VARIÁVEIS ------------------------------------------------------------------------------------------------------------------------------------

const bbox0 = rect0.getBBox();

const mainChartSVG = d3.select("#main_chart");
const mainChartWidth = +mainChartSVG.attr("width");
const mainChartHeight = +mainChartSVG.attr("height");
const mainChartMargin = { top: bbox0.height / 20, left: 20 };
const g = mainChartSVG.append("g").attr("transform", `translate(${mainChartMargin.left},${mainChartMargin.top})`);

// Manter a proporção 8:5
const bbox2 = rect2.getBBox();
const altura = bbox2.height / 19
const spriteWidth = altura * 1.6;
const spriteHeight = altura;

let largerScore = 0;

// Escala X dinâmica (alteração crucial)
const x = d3.scaleLinear()
    .range([0, bbox0.width * 0.85]);

// Escala Y com padding reduzido para barras mais altas (alteração importante)
const y = d3.scaleBand()
    .range([0, bbox0.height * 0.9])
    .padding(0.05); // Reduzindo o espaçamento entre as barras


const validYears = getAllValidSeasons();

const auxChartWidth = window.innerWidth * 0.32;
const auxChartHeight = Math.max(auxChartWidth * 3 / 4, 600);
const auxChartMargin = { top: auxChartWidth / 8, right: auxChartWidth / 8, bottom: auxChartWidth / 8, left: Math.max(auxChartWidth / 8, 95) };

// Elementos HTML da página
const yearSelect = document.getElementById("yearSelect");
const raceSelect = document.getElementById("raceSelect");
const climaIMG = document.getElementById("clima_display");
const climaInfo = document.getElementById("clima_info");
const lapIMG = document.getElementById("lap_display");
const playPauseBtn = document.getElementById("playPause");
const lapSlider = document.getElementById("lapSlider");
const lapText = document.getElementById("lapText");

let selectedYear = "";
let currentLap = 0;
let intervalId = null;
let isPlaying = false;
let laps = [];
const numberOfLaps = 20;
let pilotosSelecionados = [];
let currentData, currentLapNum, currentRaceId;

const ANIMATION_DURATION = 150; // Reduzido para animação mais fluida
const INTERPOLATION_STEPS = 20; // Aumentado para mais frames intermediários

// Função de easing para suavizar a interpolação
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// -----------------------------------------------------------------------------------------------------------------------------------------------

function tyreImageByString(compound) {
    const tyreImages = {
        MEDIUM: '<img src="assets/tyres/MEDIUM.png" alt="Medium Tyre" style="width: 18px; vertical-align: middle;">',
        HARD: '<img src="assets/tyres/HARD.png" alt="Hard Tyre" style="width: 18px; vertical-align: middle;">',
        SOFT: '<img src="assets/tyres/SOFT.png" alt="Soft Tyre" style="width: 18px; vertical-align: middle;">',
        INTERMEDIATE: '<img src="assets/tyres/INTERMEDIATE.png" alt="Intermediate Tyre" style="width: 18px; vertical-align: middle;">',
        WET: '<img src="assets/tyres/WET.png" alt="Wet Tyre" style="width: 18px; vertical-align: middle;">'
    };

    return tyreImages[compound.toUpperCase()] || '';
}


function clearChart() {
    g.selectAll("*").remove(); 
    d3.select("#tooltip").style("opacity", 0); 

    //
    const rankingSvg = d3.select("#ranking_chart")
        .attr("width", auxChartWidth)
        .attr("height", auxChartHeight);
    rankingSvg.selectAll("*").remove();
    const titulo = rankingSvg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "14px")
        .attr("font-weight", "bold");
    titulo.append("tspan")
        .attr("x", 10)
        .attr("dy", "0em")
        .text("Pontuação dos Pilotos No Campeonato Mundial");
    titulo.append("tspan")
        .attr("x", 10)
        .attr("dy", "1.2em")

    //
    const evolucaoSvg = d3.select("#evolucao_chart")
        .attr("width", auxChartWidth)
        .attr("height", auxChartHeight);
    evolucaoSvg.selectAll("*").remove();
    evolucaoSvg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Posição dos Pilotos ao Longo da Corrida");

    //
    const temposSvg = d3.select("#tempos_chart")
        .attr("width", auxChartWidth)
        .attr("height", auxChartHeight);
    temposSvg.selectAll("*").remove();
    temposSvg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Tempo De Volta dos Pilotos por Volta");
}

// Insere os anos no select
validYears.forEach(eachYear => {
    const option = document.createElement("option");
    option.value = eachYear.year;
    option.textContent = eachYear.year;
    yearSelect.appendChild(option);
});

// Insere corridas no select
yearSelect.addEventListener("change", async () => {
    clearChart();
    selectedYear = yearSelect.value;
    raceSelect.innerHTML = '<option value="">Selecione uma corrida</option>';
    raceSelect.disabled = false;

    const validRaces = await getValidRacesByYear(parseInt(selectedYear));

    if (selectedYear && validRaces.length > 0) {
        validRaces.forEach(race => {
            const opt = document.createElement("option");
            opt.value = race.raceId;
            opt.textContent = race.name;
            raceSelect.appendChild(opt);
        });
        raceSelect.disabled = false;
    }
    stopPlayback();
});


// Muda o clima e o circuito
raceSelect.addEventListener("change", async () => {
    clearChart();

    const raceChosen = raceSelect.options[raceSelect.selectedIndex].text;
    const raceID = raceSelect.value;

    const clima = await getWeatherRace(raceID);
    const dateAndTime = await getDateAndTime(raceID);

    climaIMG.innerHTML = `<img src="assets/weather/${clima.rainfall}.png" alt="">`;
    climaInfo.innerHTML = `
        <p>Data: ${formatDate(dateAndTime.date)}</p>
        <p>Horário: ${dateAndTime.time.split(":")[0]}:${dateAndTime.time.split(":")[1]} UTC</p>
        <p>Temperatura: ${clima.avg_airtemp}°C</p>
        <p>Temp. Pista: ${clima.avg_tracktemp}°C</p>
        <p>Umidade: ${clima.avg_humidity}%</p>
        <p>Vento: ${clima.avg_windspeed} km/h</p>
        <p>Clima: ${clima.rainfall ? "Chuva" : "Limpo"}`;

    const circuitId = await getCircuitIdByRaceId(raceID);
    lapIMG.innerHTML = `<img src="assets/circuits/${circuitId}.png" alt="">`;

    stopPlayback();

    pilotosSelecionados = [];

    const raceDrivers = await getDriversByRace(parseInt(raceID));
    const raceAges = await getAgesByRace(parseInt(raceID));
    const raceTeams = await getTeamsByRace(parseInt(raceID));

    for (const driver of raceDrivers) {
        driver.constructorId = raceTeams[parseInt(driver.driverId)].constructorId;
        driver.grid = raceTeams[parseInt(driver.driverId)].grid;
        driver.fastestLap = raceTeams[parseInt(driver.driverId)].fastestLapTime;
        const teste2 = await getConstructorDataByID(parseInt(driver.constructorId));
        driver.constructorRef = teste2[0].constructorRef;
        driver.constructorName = teste2[0].name;
        driver.age = raceAges[parseInt(driver.driverId)].age;
    }

    const lapsTime = await getLapTimes(raceID);
    const tyreData = await getTyreStintsByRace(raceID);

    laps = generateLaps(raceDrivers, lapsTime, tyreData);
    largerScore = 0;
    for (const each_lap of laps) {
        for (const each_driver of each_lap) {
            if (each_driver.score > largerScore) {
                largerScore = each_driver.score;
            }
        }
    }

    if (laps.length === 0) {
        lapSlider.disabled = true;
        lapSlider.value = 0;
        lapText.textContent = 'Sem voltas';
    } else {
        lapSlider.disabled = false;
        lapSlider.max = laps.length - 1;
        lapSlider.value = 0;
        lapText.textContent = `Volta 1`;
    }

    if (raceChosen) {    // Forçar nova renderização removendo elementos persistentes
        const existingBars = g.selectAll(".bar").data([], d => d.name);
        existingBars.exit().remove();

        const existingLabels = g.selectAll(".label").data([], d => d.name);
        existingLabels.exit().remove();

        const existingSprites = g.selectAll(".sprite").data([], d => d.name);
        existingSprites.exit().remove();
        currentLap = 0;
        renderLap(laps[currentLap], currentLap);
        createRankingChart(raceID);
        createEvolutionChart(raceID);
        createRaceTimesChart(raceID);
        updateUI();
    }
});


function generateLaps(drivers, lapsTime, tyreData) {
    const laps = [];

    const driversWithScore = drivers.map(driver => {
        let totalTime = 0;
        try {
            totalTime = lapsTime[driver.driverId][lapsTime[driver.driverId].length - 1].milliseconds_acumulated;
        } catch (err) {
            totalTime = 0;
        }

        let firstLapTyre = 0;
        try {
            firstLapTyre = tyreData[driver.driverId][1];
        } catch (err) {
            firstLapTyre = "HARD";
        }

        return {
            ...driver,
            score: (20 - driver.grid) / 1000000,
            name: `${driver.forename} ${driver.surname}`,
            totalTime: totalTime,
            running: true,
            lapsCompleted: 0,
            lastAccumulated: 0,
            tyre: firstLapTyre
        };
    });

    laps.push(JSON.parse(JSON.stringify(driversWithScore)));

    
    const lapArrays = Object.values(lapsTime).filter(arr => Array.isArray(arr) && arr.length > 0);
    const realNumberOfLaps = lapArrays.length > 0
        ? Math.max(...lapArrays.map(arr => arr.length))
        : 0;

    for (let lap = 1; lap < realNumberOfLaps; lap++) {
        const previousLap = JSON.parse(JSON.stringify(laps[lap - 1]));

        const newLap = previousLap.map(driver => {
            const driverLaps = lapsTime[driver.driverId];
            if (!driverLaps) {
                // Piloto sem dados de volta: marca como não running
                return {
                    ...driver,
                    running: false
                };
            }
            const currentLapData = driverLaps[lap];
            const previousLapData = driverLaps[lap - 1];

            // Se já abandonou, só copia
            if (!driver.running) {
                return driver;
            }

            // Se não existe volta atual -> abandonou
            if (!currentLapData) {
                return {
                    ...driver,
                    running: false
                };
            }

            // Se acumulado não mudou, também abandonou
            if (currentLapData.milliseconds_acumulated === previousLapData.milliseconds_acumulated) {
                return {
                    ...driver,
                    running: false
                };
            }

            return {
                ...driver,
                lastAccumulated: currentLapData.milliseconds_acumulated,
                lapsCompleted: driver.lapsCompleted + 1,
                tyre: tyreData[driver.driverId][lap + 1] // Atualiza o pneu para a volta atual (lap começa em 0)
            };
        });

        // Só consideramos pilotos que estão "running"
        const activeDrivers = newLap.filter(d => d.running && d.lastAccumulated !== undefined);
        const leaderAccumulated = Math.min(...activeDrivers.map(d => d.lastAccumulated));
        const leaderLapsCompleted = Math.max(...activeDrivers.map(d => d.lapsCompleted));

        const finalLap = newLap.map(driver => {
            if (!driver.running) {
                return {
                    ...driver,
                    score: driver.score,
                    voltasTomadas: leaderLapsCompleted - driver.lapsCompleted
                };
            }
        
            let score;
        
            if (driver.lastAccumulated !== undefined) {
                if (driver.lastAccumulated === leaderAccumulated) {
                    score = driver.lastAccumulated;
                } else {
                    score = leaderAccumulated + 2.5 * (leaderAccumulated - driver.lastAccumulated);
                }
            } else {
                score = leaderAccumulated - 100000;
            }
        
            const lapsBehind = leaderLapsCompleted - driver.lapsCompleted;
            if (lapsBehind > 0) {
                score *= Math.pow(0.9, lapsBehind);
            }
        
            return {
                ...driver,
                score: score,
                voltasTomadas: lapsBehind
            };
        });
        

        laps.push(finalLap);
    }
    
    return laps;
}


// Vai reiniciar a contagem de voltas
function stopPlayback() {
    clearInterval(intervalId);
    isPlaying = false;
    playPauseBtn.textContent = "▶️ Play";
}

// Listener do botão de pause
playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
        stopPlayback();
    } else {
        isPlaying = true;
        playPauseBtn.textContent = "⏸️ Pause";
        let animating = false;
        intervalId = setInterval(async () => {
            if (animating) return; // Evita sobreposição de animações
            if (currentLap < laps.length - 1) {
                const prevLap = laps[currentLap];
                const nextLap = laps[currentLap + 1];
                animating = true;
                for (let step = 1; step <= INTERPOLATION_STEPS; step++) {
                    
                    const tRaw = step / (INTERPOLATION_STEPS + 1);
                    const t = easeInOutCubic(tRaw);
                    const interpolated = prevLap.map((driver, idx) => {
                        const next = nextLap[idx];
                        if (!driver.running || !next.running) {
                            return driver; // Não interpolar se o piloto não está correndo
                        }
                        return {
                            ...driver,
                            score: driver.score + (next.score - driver.score) * t
                        };
                    });
                    renderLap(interpolated, currentLap); // Sempre renderiza, mesmo sem mudança
                    await new Promise(res => setTimeout(res, ANIMATION_DURATION / (INTERPOLATION_STEPS + 1)));
                }
                currentLap++;
                lapSlider.value = currentLap;
                renderLap(laps[currentLap], currentLap);
                updateUI();
                animating = false;
            } else {
                stopPlayback();
            }
        }, ANIMATION_DURATION);
    }
});

// Listener no slicer
lapSlider.addEventListener("input", () => {
    currentLap = parseInt(lapSlider.value);
    renderLap(laps[currentLap], currentLap);
    updateUI();
    stopPlayback();
});

// Atualiza a interface do usuário
function updateUI() {
    lapSlider.max = laps.length - 1;
    lapSlider.disabled = false;
    lapSlider.value = currentLap;
    lapText.textContent = `Volta ${currentLap + 1}`;
}


function renderLap(data, lapNum, raceId) {
    const tooltip = d3.select("#tooltip");

    currentData = data;
    currentLapNum = lapNum;
    currentRaceId = raceId;

    // Ordena por score
    const sorted = [...data].sort((a, b) => b.score - a.score);

    // Atualiza domínios dos eixos
    y.domain(sorted.map(d => d.name));
    x.domain([0, largerScore]);

    // ----- BARRAS -----
    const bars = g.selectAll(".bar")
        .data(sorted, d => d.name);

    const barsEnter = bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.name))
        .attr("width", 0)
        .attr("fill", d => cores_equipes[selectedYear][d.constructorRef] || "#ccc");

    const barsMerge = barsEnter.merge(bars);

    // Eventos (ENTER + UPDATE)
    barsMerge
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", event => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .on("click", (event, d) => {
            togglePilotoSelecionado(d.driverId, raceId, lapNum, data); // Adicione lapNum e data
        });

    // Transição
    barsMerge.transition().duration(ANIMATION_DURATION)
        .ease(d3.easeCubic)
        .attr("y", d => y(d.name))
        .attr("width", d => x(d.score))
        .style("opacity", d =>
            pilotosSelecionados.length === 0 || pilotosSelecionados.includes(d.driverId)
                ? 1 : 0.05
        )
        .attr("fill", d => cores_equipes[selectedYear][d.constructorRef] || "#ccc");

    bars.exit()
        .transition().duration(250)
        .style("opacity", 0)
        .remove();

    // ----- LABELS -----
    const labels = g.selectAll(".label")
        .data(sorted, d => d.name);

    const labelsEnter = labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .text(d => {
            return d.name + (d.running === true ? "" : " ⚠️");
        });

    const labelsMerge = labelsEnter.merge(labels);

    labelsMerge
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", event => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .on("click", (event, d) => {
            togglePilotoSelecionado(d.driverId, raceId, lapNum, data);
        });

    labelsMerge.transition().duration(ANIMATION_DURATION)
        .ease(d3.easeCubic)
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5)
        .attr("x", d => {
            const estWidth = d.name.length * 10;
            const margin = 50;
            const afast = d.running ? 35 : 60;
            return x(d.score) > estWidth + margin
                ? x(d.score) - estWidth - afast
                : x(d.score) + spriteWidth + afast;
        })
        .attr("fill", d => {
            const estWidth = d.name.length * 10
            const margin = 50;
            if (x(d.score) > estWidth + margin){
                return "#ffffff";
            } else {
                return "#000000";
            }
        })
        .style("opacity", d =>
            pilotosSelecionados.length === 0 || pilotosSelecionados.includes(d.driverId)
                ? 1 : 0.3
        )
        .text(d => {
            return d.name + (d.running === true ? "" : " (🚨)");
        });

    labels.exit()
        .transition().duration(250)
        .style("opacity", 0)
        .remove();

    // ----- SPRITES -----
    const sprites = g.selectAll("image.sprite")
        .data(sorted, d => d.name);

    const spritesEnter = sprites.enter()
        .append("image")
        .attr("class", "sprite")
        .attr("width", spriteWidth)
        .attr("height", spriteHeight)
        .attr("xlink:href", d => {
            return `assets/${selectedYear}/sprites/${d.constructorRef}.png`;
        });

    const spritesMerge = spritesEnter.merge(sprites);

    spritesMerge
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", event => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .on("click", (event, d) => {
            togglePilotoSelecionado(d.driverId, raceId, lapNum, data); // Adicione lapNum e data
        });

    spritesMerge.transition().duration(ANIMATION_DURATION)
        .ease(d3.easeCubic)
        .attr("transform", d => {
            const posX = x(d.score) + 5;
            const posY = y(d.name) + (y.bandwidth() - spriteHeight) / 2;
            return `translate(${posX + spriteWidth / 2},${posY + spriteHeight / 2}) rotate(90) translate(${-spriteWidth / 2},${-spriteHeight / 2})`;
        })
        .style("opacity", d =>
            pilotosSelecionados.length === 0 || pilotosSelecionados.includes(d.driverId)
                ? 1 : 0.05)
            .attr("xlink:href", d => {
            return `assets/${selectedYear}/sprites/${d.constructorRef}.png`;
        });

    sprites.exit()
        .transition().duration(250)
        .style("opacity", 0)
        .remove();

    // --- Funções de tooltip ---
    function showTooltip(event, d) {

        const tyreLabel = d.tyre ? (d.tyre.charAt(0) + d.tyre.slice(1).toLowerCase()) : 'N/A';
        const flag = nationalityToFlagEmoji(d.nationality);
        const teamLogo = d.constructorRef ? `<img src=\"assets/constructor_logos/${d.constructorRef}.png\" alt=\"${d.constructorName}\" style=\"height:18px;vertical-align:middle;margin-right:4px;\">` : '';
        tooltip
            .style("opacity", 1)
            .html(`
                <div style="display:flex;align-items:center;background:white;border-radius:5px;padding:4px;">
                    <img src="assets/${selectedYear}/drivers/${d.driverRef}.png"
                        alt="${d.name}" style="width:8vw;margin-right:10px;">
                    <div>
                        <strong>${d.name}${d.running ? "":" (DNF ou Laps Behind)"}</strong><br>
                        Idade: ${d.age} anos<br>
                        Equipe: ${teamLogo}${d.constructorName}<br>
                        Nacionalidade: ${flag ? flag + ' ' : ''}${d.nationality}<br>
                        Pneus: ${tyreLabel} (${tyreImageByString(tyreLabel)})<br>
                        Largada: ${d.grid}º<br>
                        VMR: ${d.fastestLap} min
                    </div>
                </div>
            `);
    }
    function moveTooltip(event) {
        const tipW = tooltip.node().offsetWidth;
        let left = event.pageX + 15;
        if (left + tipW > window.innerWidth) {
            left = event.pageX - tipW - 35;
        }
        tooltip.style("left", left + "px")
            .style("top", (event.pageY - 28) + "px");
    }
    function hideTooltip() {
        tooltip.style("opacity", 0);
    }
}


const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "5px")
    .style("font-size", "16px")
    .style("pointer-events", "none")
    .style("opacity", 0);

function showTooltipAuxCharts1(event, d) {
    const flag = nationalityToFlagEmoji(d.driver.nationality);
    const teamLogo = d.driver.teamRef ? `<img src=\"assets/constructor_logos/${d.driver.teamRef}.png\" alt=\"${d.teamName}\" style=\"height:18px;vertical-align:middle;margin-right:4px;\">` : '';
    tooltip
        .style("opacity", 1)
        .style("visibility", "visible")
        .html(`
        <div style="display: flex; align-items: center; background-color: white; border-radius: 5px; padding: 2px;">
            <img src="assets/${selectedYear}/drivers/${d.driver.driverRef}.png" alt="${d.driver.surname}" style="width:8vw; margin-right:10px;">
            <div>
                <strong>${d.driver.forename} ${d.driver.surname}</strong><br>
                Equipe: ${teamLogo}${d.teamName}<br>
                Nacionalidade: ${flag ? flag + ' ' : ''}${d.driver.nationality}<br>
                Pontos: ${d.points}<br>
            </div>
        </div>
    `);
}

function showTooltipAuxCharts2(event, d, volta) {
    const flag = nationalityToFlagEmoji(d.driver.nationality);
    const teamLogo = d.driver.teamRef ? `<img src=\"assets/constructor_logos/${d.driver.teamRef}.png\" alt=\"${d.driver.teamName}\" style=\"height:18px;vertical-align:middle;margin-right:4px;\">` : '';
    tooltip
        .style("opacity", 1)
        .style("visibility", "visible")
        .html(`
        <div style="display: flex; align-items: center; background-color: white; border-radius: 5px; padding: 2px;">
            <img src="assets/${selectedYear}/drivers/${d.driver.driverRef}.png" alt="${d.driver.surname}" style="width:8vw; margin-right:10px;">
            <div>
                <strong>${d.driver.forename} ${d.driver.surname}</strong><br>
                Equipe: ${teamLogo}${d.driver.teamName}<br>
                Nacionalidade: ${flag ? flag + ' ' : ''}${d.driver.nationality}<br>
                Posição: ${d.positions[volta]}º colocado<br>
                Volta: ${volta + 1}/${d.positions.length}<br>
            </div>
        </div>
    `);
}

function showTooltipAuxCharts3(event, d, lap = "Nada") {
    console.log(d);
    const flag = nationalityToFlagEmoji(d.driver.nationality);
    const teamLogo = d.driver.teamRef ? `<img src=\"assets/constructor_logos/${d.driver.teamRef}.png\" alt=\"${d.driver.teamName}\" style=\"height:18px;vertical-align:middle;margin-right:4px;\">` : '';
    tooltip
        .style("opacity", 1)
        .style("visibility", "visible")
        .html(`
        <div style="display: flex; align-items: center; background-color: white; border-radius: 5px; padding: 2px;">
            <img src="assets/${selectedYear}/drivers/${d.driver.driverRef}.png" alt="${d.driver.surname}" style="width:8vw; margin-right:10px;">
            <div>
                <strong>${d.driver.forename} ${d.driver.surname}</strong><br>
                Equipe: ${teamLogo}${d.driver.teamName}<br>
                Nacionalidade: ${flag ? flag + ' ' : ''}${d.driver.nationality}<br>
                ${lap != "Nada" ? `Tempo de Volta: ${d.laps[lap-1].time} min` : ""}<br>
                ${lap != "Nada" ? `Volta: ${lap}/${d.laps.length}` : ""}<br>
            </div>
        </div>
    `);
}

// Função principal do gráfico de ranking
async function createRankingChart(raceId) {
    try {
        const data = await getDriversSeasonScorebyRace(raceId, resultsFilePath, driversFilePath, racesFilePath);
        const data2 = await getTeamsByRace(raceId);

        for (const driver of data) {
            const teamInfo = data2[driver.driverId];
            if (!teamInfo) {
                console.warn(`Dados de equipe não encontrados para o piloto ${driver.driverId}`);
                continue;
            }
            driver.teamId = teamInfo.constructorId;
            const teamName = await getConstructorDataByID(driver.teamId);
            driver.teamRef = teamName[0].constructorRef;
            driver.teamName = teamName[0].name;
        }

        if (data.length === 0) {
            console.log("Nenhum dado encontrado para esta corrida.");
            return;
        }

        const pilotosOrdenadosGrid = data
            .sort((a, b) => b.points - a.points)
            .map(d => d.driver.code);

        const valoresRanking = data.map(d => d.points);

        const rankingSvg = d3.select("#ranking_chart")
            .attr("width", auxChartWidth)
            .attr("height", auxChartHeight);

        rankingSvg.selectAll("*").remove();

        // Título
        const titulo = rankingSvg.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", "14px")
            .attr("font-weight", "bold");

        titulo.append("tspan")
            .attr("x", 10)
            .attr("dy", "0em")
            .text("Pontuação dos Pilotos No Campeonato Mundial");

        titulo.append("tspan")
            .attr("x", 10)
            .attr("dy", "1.2em")
            .text("(Na Data da Corrida)");

        const rankingX = d3.scaleLinear()
            .domain([-10, d3.max(valoresRanking)])
            .range([0, auxChartWidth - auxChartMargin.left - auxChartMargin.right]);

        const rankingY = d3.scaleBand()
            .domain(pilotosOrdenadosGrid)
            .range([auxChartMargin.top, auxChartHeight - auxChartMargin.bottom])
            .padding(0.1);

        rankingSvg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", auxChartMargin.left)
            .attr("y", d => rankingY(d.driver.code))
            .attr("width", d => rankingX(d.points))
            .attr("height", rankingY.bandwidth())
            .style("fill", d => cores_equipes[selectedYear][d.teamRef])
            .style("opacity", d =>
                pilotosSelecionados.length === 0 || pilotosSelecionados.includes(d.driver.driverId)
                    ? 1 : 0.3
            )
            .on("mouseover", (event, d) => showTooltipAuxCharts1(event, d))
            .on("mousemove", event => {
                tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0).style("visibility", "hidden");
            })
            .on("click", (event, d) => {
                togglePilotoSelecionado(d.driver.driverId, raceId, currentLapNum, currentData);
            });

        // Eixos
        rankingSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left}, 0)`)
            .call(d3.axisLeft(rankingY).tickSize(0))
            .selectAll("text")
            .style("text-anchor", "end");

        rankingSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", - auxChartMargin.top - (auxChartHeight - auxChartMargin.top - auxChartMargin.bottom) / 2)
            .attr("y", Math.max(auxChartWidth / 8, 85)/3)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Pilotos");

        rankingSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left},${auxChartHeight - auxChartMargin.bottom})`)
            .call(d3.axisBottom(rankingX).ticks(5))
            .selectAll("text")
            .style("text-anchor", "middle");

        rankingSvg.append("text")
            .attr("x", auxChartMargin.left + (auxChartWidth - auxChartMargin.left - auxChartMargin.right) / 2)
            .attr("y", auxChartHeight - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Pontuação");

    } catch (err) {
        console.error("Erro ao gerar o gráfico de ranking:", err);
    }
}

// Alterna seleção e atualiza todos os gráficos
function togglePilotoSelecionado(driverId, raceId, lapNum, data) {
    if (pilotosSelecionados.includes(driverId)) {
        pilotosSelecionados = pilotosSelecionados.filter(id => id !== driverId);
    } else {
        pilotosSelecionados.push(driverId);
    }
    createRankingChart(raceId);
    createEvolutionChart(raceId);
    createRaceTimesChart(raceId);
    renderLap(data, lapNum, raceId);
}

// Função do gráfico de evolução de posições
async function createEvolutionChart(raceId) {
    try {
        const evolucaoData = await getRaceEvolution(raceId);
        const data2 = await getTeamsByRace(raceId);

        for (const item of evolucaoData) {
            try {
                item.driver.teamId = data2[item.driver.driverId].constructorId;
                const teamName = await getConstructorDataByID(item.driver.teamId);
                item.driver.teamRef = teamName[0].constructorRef;
                item.driver.teamName = teamName[0].name;
            } catch (err) {
                console.warn(`Erro ao buscar dados para o piloto ${item.driver.driverId}:`, err);
                continue;
            }
        }

        if (evolucaoData.length === 0) {
            console.log("Nenhum dado encontrado para evolução da corrida.");
            return;
        }

        // SVG setup
        const evolucaoSvg = d3.select("#evolucao_chart")
            .attr("width", auxChartWidth)
            .attr("height", auxChartHeight);

        evolucaoSvg.selectAll("*").remove();

        // Título
        evolucaoSvg.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text("Posição dos Pilotos ao Longo da Corrida");

        // Escalas X e Y
        const numVoltas = evolucaoData[0].positions.length;
        const evolucaoX = d3.scaleLinear()
            .domain([0, numVoltas - 1])
            .range([auxChartMargin.left, auxChartWidth - auxChartMargin.right]);

        const evolucaoY = d3.scaleLinear()
            .domain([20.5, 0.5])
            .range([auxChartHeight - auxChartMargin.bottom, auxChartMargin.top]);

        const line = d3.line()
            .defined(d => d != null && !isNaN(d))
            .x((d, i) => evolucaoX(i))
            .y(d => evolucaoY(d));

        // Desenha todas as linhas, mas controla opacidade
        evolucaoSvg.selectAll(".linha-piloto")
            .data(evolucaoData)
            .enter()
            .append("path")
            .attr("class", "linha-piloto")
            .attr("d", d => line(d.positions))
            .attr("fill", "none")
            .attr("stroke", d => cores_equipes[selectedYear][d.driver.teamRef])
            .attr("stroke-width", 2.5)
            .style("opacity", d =>
                pilotosSelecionados.length === 0 || pilotosSelecionados.includes(d.driver.driverId)
                    ? 1 : 0.15
            )
            .on("click", (event, d) => {
                togglePilotoSelecionado(d.driver.driverId, raceId, currentLapNum, currentData);
            });

        // Eixos
        evolucaoSvg.append("g")
            .attr("transform", `translate(0,${auxChartHeight - auxChartMargin.bottom})`)
            .call(d3.axisBottom(evolucaoX)
                .ticks(Math.ceil(numVoltas / 10))
                .tickFormat(d => `${d + 1}`)
            );

        evolucaoSvg.append("text")
            .attr("x", auxChartWidth / 2)
            .attr("y", auxChartHeight - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Voltas");

        // Mapeia primeira posição para label do eixo Y
        const posicaoParaPiloto = {};
        evolucaoData.forEach(p => {
            const posIni = p.positions[0];
            if (posIni !== null) posicaoParaPiloto[Math.round(posIni)] = p.driver.code;
        });

        // Desenha bolinhas em cada ponto
        evolucaoData.forEach(piloto => {
            evolucaoSvg.selectAll(`.ponto-${piloto.driver.driverId}`)
            .data(piloto.positions.map((pos, i) => ({ pos, lap: i })))
            .enter()
            .filter(d => d.pos != null && !isNaN(d.pos))
            .append("circle")
            .attr("class", `ponto`)
            .attr("cx", d => evolucaoX(d.lap))
            .attr("cy", d => evolucaoY(d.pos))
            .attr("r", 3)
            .attr("fill", cores_equipes[selectedYear][piloto.driver.teamRef])
            .style("opacity", pilotosSelecionados.length === 0 || pilotosSelecionados.includes(piloto.driver.driverId) ? 1 : 0.15)
            .on("mouseover", (event, d) => showTooltipAuxCharts2(event, piloto, d.lap))
            .on("mousemove", event => {
                tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0).style("visibility", "hidden");
            })
            .on("click", (event, d) => {
                togglePilotoSelecionado(piloto.driver.driverId, raceId, currentLapNum, currentData);
            });
        });


        evolucaoSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left}, 0)`)
            .call(d3.axisLeft(evolucaoY)
                .ticks(20)
                .tickFormat(pos => posicaoParaPiloto[Math.round(pos)] || "")
            );

        evolucaoSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -auxChartHeight / 2)
            .attr("y", Math.max(auxChartWidth / 8, 85)/3)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Posição dos Pilotos");

    } catch (err) {
        console.error("Erro ao gerar gráfico de evolução:", err);
    }
}

// Função do gráfico de tempos de volta
async function createRaceTimesChart(raceId) {
    try {
        const temposData = await getRaceTimes(raceId);
        const data2 = await getTeamsByRace(raceId);

        for (const item of temposData) {
            try {
                item.driver.teamId = data2[item.driver.driverId].constructorId;
                const teamName = await getConstructorDataByID(item.driver.teamId);
                item.driver.teamRef = teamName[0].constructorRef;
                item.driver.teamName = teamName[0].name;
            } catch (err) {
                console.warn(`Erro ao buscar dados para o piloto ${item.driver.driverId}:`, err);
                continue;
            }
        }

        if (temposData.length === 0) {
            console.log("Nenhum dado de tempo encontrado para essa corrida.");
            return;
        }

        // SVG setup
        const temposSvg = d3.select("#tempos_chart")
            .attr("width", auxChartWidth)
            .attr("height", auxChartHeight);

        temposSvg.selectAll("*").remove();

        // Título
        temposSvg.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text("Tempo De Volta dos Pilotos por Volta");

        // Escalas X e Y (baseadas em todo o dataset)
        const maxLapNumber = d3.max(temposData.flatMap(d => d.laps.map(l => l.lap)));
        const maxMilliseconds = d3.max(temposData.flatMap(d => d.laps.map(l => l.milliseconds)));
        const minMilliseconds = d3.min(temposData.flatMap(d => d.laps.map(l => l.milliseconds)));

        const temposX = d3.scaleLinear()
            .domain([1, maxLapNumber])
            .range([auxChartMargin.left, auxChartWidth - auxChartMargin.right]);

        const temposY = d3.scaleLinear()
            .domain([minMilliseconds - 10, maxMilliseconds])
            .range([auxChartHeight - auxChartMargin.bottom, auxChartMargin.top]);

        const line = d3.line()
            .defined(d => d.milliseconds != null && !isNaN(d.milliseconds))
            .x(d => temposX(d.lap))
            .y(d => temposY(d.milliseconds));

        // Desenha todas as linhas, controlando a opacidade
        temposSvg.selectAll(".linha-tempo")
            .data(temposData)
            .enter()
            .append("path")
            .attr("class", "linha-tempo")
            .attr("d", d => line(d.laps))
            .attr("fill", "none")
            .attr("stroke", d => cores_equipes[selectedYear][d.driver.teamRef])
            .attr("stroke-width", 2.5)
            .style("opacity", d =>
                pilotosSelecionados.length === 0 || pilotosSelecionados.includes(d.driver.driverId)
                    ? 1 : 0.15
            )
            .on("click", (event, d) => {
                togglePilotoSelecionado(d.driver.driverId, raceId, currentLapNum, currentData);
            });
        
        function moveTooltip(event) {
            const tipW = tooltip.node().offsetWidth;
            let left = event.pageX + 15;
            if (left + tipW > window.innerWidth) {
                left = event.pageX - tipW - 35;
            }
            tooltip.style("left", left + "px")
                .style("top", (event.pageY - 28) + "px");
        };

        // Eixos
        temposSvg.append("g")
            .attr("transform", `translate(0,${auxChartHeight - auxChartMargin.bottom})`)
            .call(d3.axisBottom(temposX)
                .ticks(Math.floor(maxLapNumber / 10))
                .tickFormat(d => `${d}`)
            );

        temposSvg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", auxChartWidth / 2)
            .attr("y", auxChartHeight - 10)
            .attr("font-size", "12px")
            .text("Voltas");

        // Desenha bolinhas em cada ponto
        temposData.forEach(piloto => {
            temposSvg.selectAll(`.ponto-tempo-${piloto.driver.driverId}`)
                .data(piloto.laps.filter(lap => lap.milliseconds != null && !isNaN(lap.milliseconds)))
                .enter()
                .append("circle")
                .attr("class", "ponto")
                .attr("cx", d => temposX(d.lap))
                .attr("cy", d => temposY(d.milliseconds))
                .attr("r", 2.5)
                .attr("fill", cores_equipes[selectedYear][piloto.driver.teamRef])
                .style("opacity", pilotosSelecionados.length === 0 || pilotosSelecionados.includes(piloto.driver.driverId) ? 1 : 0.15)
                .on("mouseover", (event, d) => showTooltipAuxCharts3(event, piloto, d.lap))
                .on("mousemove", moveTooltip)
                .on("mouseout", () => {
                    tooltip.style("opacity", 0).style("visibility", "hidden");
                })
                .on("click", (event, d) => {
                    togglePilotoSelecionado(piloto.driver.driverId, raceId, currentLapNum, currentData);
                });
        });

        temposSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left},0)`)
            .call(d3.axisLeft(temposY)
                .ticks(6)
                .tickFormat(d => `${Math.round(d / 1000)}`)
            );

        temposSvg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -auxChartHeight / 2)
            .attr("y", Math.max(auxChartWidth / 8, 85)/3)
            .attr("font-size", "12px")
            .text("Tempo (s)");

    } catch (err) {
        console.error("Erro ao gerar o gráfico de tempos:", err);
    }
}


