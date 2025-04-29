import {
        cores_equipes
 } from "./mock-consts.js";

// FUNÇÕES DOS DADOS --------------------------------------------------------------------------------------------------------------------------------

const racesFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/races.csv";
const pitStopsFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/pit_stops.csv";
const resultsFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/results.csv";
const driversFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/drivers.csv";
const constructorsFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/constructors.csv";
const weatherDataFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/weather.csv";
const lapTimesFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/lap_times.csv";
const circuitsFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/circuits.csv";
const tyreStintsFilePath = "https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/main/f1db/tyre_stints.csv";


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

function loadCSVData(filePath) {
    return d3.csv(filePath);
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
    try{
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

function timeInSeconds(time){
    const aux = time.split(":");
    const seconds = Number(aux[1]);
    const minutesInSeconds = Number(aux[0])*60;
    return seconds + minutesInSeconds;
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

async function getCircuitIdByRaceId(raceId){
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
const mainChartMargin = { top: bbox0.height/20, left: 20 };

const mainChartRealWidth = mainChartWidth - mainChartMargin.left - mainChartMargin.right;
const mainChartRealHeight = mainChartHeight - mainChartMargin.top - mainChartMargin.bottom;
const g = mainChartSVG.append("g").attr("transform", `translate(${mainChartMargin.left},${mainChartMargin.top})`);

// Manter a proporção 8:5
const bbox2 = rect2.getBBox();
const altura = bbox2.height/19
const spriteWidth = altura*1.6;
const spriteHeight = altura;

let largerScore = 0;

// Escala X dinâmica (alteração crucial)
const x = d3.scaleLinear()
  .range([0, bbox0.width*0.85]); 

// Escala Y com padding reduzido para barras mais altas (alteração importante)
const y = d3.scaleBand()
  .range([0, bbox0.height*0.9])
  .padding(0.05); // Reduzindo o espaçamento entre as barras


const validYears = getAllValidSeasons();

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

// -----------------------------------------------------------------------------------------------------------------------------------------------

function emojiByStringTyre(compound) {
    const tyreEmojis = {
      MEDIUM: '(⚪)', 
      HARD: '(🔴)',   
      SOFT: '(🟡)',   
      INTERMEDIATE: '(🟢)', 
      WET: '(🔵)'     
    };
  
    return tyreEmojis[compound.toUpperCase()] || ''; 
}

function clearChart() {
    g.selectAll("*").remove(); // Remove todos os elementos do grupo principal
    d3.select("#tooltip").style("opacity", 0); // Esconde o tooltip
    d3.select("h2").text("F1 Bar Chart Race"); // Reseta o título
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

    const raceChosen = raceSelect.textContent;
    const raceID = raceSelect.value;

    const clima = await getWeatherRace(raceID);
    const dateAndTime = await getDateAndTime(raceID);

    climaIMG.innerHTML = `<img src="https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/refs/heads/main/assets/weather/${clima.rainfall}.png" alt="">`;
    climaInfo.innerHTML = `
        <p>Data: ${formatDate(dateAndTime.date)}</p>
        <p>Horário: ${dateAndTime.time.split(":")[0]}:${dateAndTime.time.split(":")[1]} UTC</p>
        <p>Temperatura: ${clima.avg_airtemp}°C</p>
        <p>Temp. Pista: ${clima.avg_tracktemp}°C</p>
        <p>Umidade: ${clima.avg_humidity}%</p>
        <p>Vento: ${clima.avg_windspeed} km/h</p>
        <p>Clima: ${clima.rainfall ? "Chuva" : "Limpo"}`;

    const circuitId = await getCircuitIdByRaceId(raceID);
    lapIMG.innerHTML = `<img src="https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/refs/heads/main/assets/circuits/${circuitId}.png" alt="">`;

    stopPlayback();

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

    if (raceChosen) {    // Forçar nova renderização removendo elementos persistentes
        const existingBars = g.selectAll(".bar").data([], d => d.name);
        existingBars.exit().remove();
    
        const existingLabels = g.selectAll(".label").data([], d => d.name);
        existingLabels.exit().remove();
    
        const existingSprites = g.selectAll(".sprite").data([], d => d.name);
        existingSprites.exit().remove();
        currentLap = 0;
        renderLap(laps[currentLap], currentLap);
        updateUI();
    }
});

function generateLaps(drivers, lapsTime, tyreData) {
    const laps = [];

    const driversWithScore = drivers.map(driver => ({
        ...driver,
        score: (20 - driver.grid)/1000000,
        name: `${driver.forename} ${driver.surname}`,
        totalTime: lapsTime[driver.driverId][lapsTime[driver.driverId].length - 1].milliseconds_acumulated,
        running: true,
        lapsCompleted: 0,
        lastAccumulated: 0,
        tyre: tyreData[driver.driverId][1] // Pneu da primeira volta
    }));

    laps.push(JSON.parse(JSON.stringify(driversWithScore)));

    const realNumberOfLaps = lapsTime[Number(drivers[0].driverId)].length;

    for (let lap = 1; lap < realNumberOfLaps; lap++) {
        const previousLap = JSON.parse(JSON.stringify(laps[lap - 1]));

        const newLap = previousLap.map(driver => {
            const driverLaps = lapsTime[driver.driverId];
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
                    score: driver.score
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

            // Penalização pra quem tomou volta
            const lapsBehind = leaderLapsCompleted - driver.lapsCompleted;
            if (lapsBehind > 0) {
                score *= Math.pow(0.9, lapsBehind);
            }

            return {
                ...driver,
                score: score
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
        intervalId = setInterval(() => {
            if (currentLap < laps.length - 1) {
                currentLap++;
                lapSlider.value = currentLap;
                renderLap(laps[currentLap], currentLap);
                updateUI();
            } else {
                stopPlayback();
            }
        }, 1500);
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


function renderLap(data, lapNum) {
    const tooltip = d3.select("#tooltip");

    const sorted = [...data].sort((a, b) => b.score - a.score);

    y.domain(sorted.map(d => d.name));
    x.domain([0, largerScore]);

    const bars = g.selectAll(".bar").data(sorted, d => d.name);
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.name))  // Posicionamento vertical corrigido
        .attr("x", 0)
        .attr("width", 0)  // Inicialmente com largura 0 para animação
        .attr("fill", d => cores_equipes[d.constructorRef] || "#ccc")
        .attr("fill-opacity", 1)
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .merge(bars)
        .transition().duration(500)
        .attr("width", d => x(d.score))  // Largura da barra de acordo com o score
        .attr("y", d => y(d.name))
        .attr("fill", d => cores_equipes[selectedYear][d.constructorRef] || "#ccc");
    bars.exit().remove();

    // LABELS
    const labels = g.selectAll(".label").data(sorted, d => d.name);
    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5)  // Posicionamento vertical corrigido
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .text(d => d.name)
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .merge(labels)
        .transition().duration(500)
        .attr("fill", d => {
            const estimatedTextWidth = d.name.length * 10;
            const margemErro = 50;
            return x(d.score) > estimatedTextWidth + margemErro
                ? "#ffffff"
                : "#000000"
        })
        .attr("x", d => {
            const estimatedTextWidth = d.name.length * 10;
            const margemErro = 50;
            return x(d.score) > estimatedTextWidth + margemErro
                ? x(d.score) - estimatedTextWidth - 35
                : x(d.score) + spriteWidth + 35;
        })
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5);
    labels.exit().remove();

    // SPRITES
    const sprites = g.selectAll("image.sprite").data(sorted, d => d.name);
    sprites.enter()
        .append("image")
        .attr("class", "sprite")
        .attr("xlink:href", d => `https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/refs/heads/main/assets/${selectedYear}/sprites/${d.constructorRef}.png`)
        .attr("width", spriteWidth)
        .attr("height", spriteHeight)
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .merge(sprites)
        .transition().duration(500)
        .attr("transform", d => {
          const posX = x(d.score) + 5;
          const posY = y(d.name) + (y.bandwidth() - spriteHeight) / 2;  // Posicionamento corrigido
          return `translate(${posX + spriteWidth/2},${posY + spriteHeight/2}) rotate(90) translate(${-spriteWidth/2},${-spriteHeight/2})`;
        });

    // Atualiza o título
    d3.select("h2").text(`F1 Bar Chart Race - Volta ${lapNum + 1}`);
    
    // Funções auxiliares para tooltip
    function showTooltip(event, d) {
        tooltip
            .style("opacity", 1)
            .html(`
                <div style="display: flex; align-items: center; background-color: white; border-radius: 5px; padding: 2px;">
                    <img src="https://raw.githubusercontent.com/FGV-VIS-2025/speed-data-circuit/refs/heads/main/assets/${selectedYear}/drivers/${d.driverRef}.png" alt="${d.name}" style="width:8vw; margin-right:10px;">
                    <div>
                        <strong>${d.name}</strong><br>
                        Idade: ${d.age} anos<br>
                        Equipe: ${d.constructorName}<br>
                        Nacionalidade: ${d.nationality}<br>
                        Pneus: ${d.tyre.charAt(0) + d.tyre.slice(1).toLowerCase() + " " + emojiByStringTyre(d.tyre)}<br>
                        Largada: ${d.grid}º<br>
                        VMR: ${d.fastestLap} min<br>
                    </div>
                </div>
            `);
    }

    function moveTooltip(event) {
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipX = event.pageX + 15;
        const tooltipY = event.pageY - 28;

        if (tooltipX + tooltipWidth > window.innerWidth) {
            tooltip.style("left", (event.pageX - tooltipWidth - 35) + "px");
        } else {
            tooltip.style("left", tooltipX + "px");
        }

        tooltip.style("top", tooltipY + "px");
    }

    function hideTooltip() {
        tooltip.style("opacity", 0);
    }
}

const auxChartWidth = 450;
const auxChartHeight = 300;
const auxChartMargin = { top: 50, right: 50, bottom: 50, left: 100 };

// Função para calcular a pontuação dos pilotos por corrida
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
  
// Exemplo de uso da função com dados
const raceId = 1139;

// Função para criar o gráfico de ranking
async function createRankingChart() {
    try {
        // Obtendo os dados de pontuação dos pilotos pela corrida
        const data = await getDriversSeasonScorebyRace(raceId, resultsFilePath, driversFilePath, racesFilePath);
        
        if (data.length === 0) {
            console.log("Nenhum dado encontrado para esta corrida.");
            return;
        }

        // Pegando os nomes dos pilotos e suas pontuações
        const pilotosOrdenadosGrid = data
            .sort((a, b) => b.points - a.points)  // Ordena por pontuação decrescente
            .map(d => d.driver.code);

        const valoresRanking = data
            .sort((a, b) => b.points - a.points)
            .map(d => d.points);

        // Criando o SVG para o gráfico
        const rankingSvg = d3.select("#ranking_chart")
            .attr("width", auxChartWidth)
            .attr("height", auxChartHeight);

        // Escalas
        const rankingX = d3.scaleLinear()
            .domain([0, d3.max(valoresRanking)])
            .range([0, auxChartWidth - auxChartMargin.left - auxChartMargin.right]);

        const rankingY = d3.scaleBand()
            .domain(pilotosOrdenadosGrid)
            .range([auxChartMargin.top, auxChartHeight - auxChartMargin.bottom])
            .padding(0.1);

        // Adiciona barras ao gráfico
        rankingSvg.selectAll("rect")
            .data(data.sort((a, b) => b.points - a.points))
            .enter()
            .append("rect")
            .attr("x", auxChartMargin.left)
            .attr("y", d => rankingY(d.driver.code))
            .attr("width", d => rankingX(d.points))
            .attr("height", rankingY.bandwidth())
            .style("fill", "#4CAF50");

        // Adiciona eixo Y com os nomes dos pilotos
        rankingSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left}, 0)`)
            .call(d3.axisLeft(rankingY).tickSize(0))  // remove ticks
            .selectAll("text")
            .style("text-anchor", "end"); 

        // Adiciona eixo X com os valores de pontuação
        rankingSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left},${auxChartHeight - auxChartMargin.bottom})`)
            .call(d3.axisBottom(rankingX).ticks(5))
            .selectAll("text")
            .style("text-anchor", "middle");

    } catch (err) {
        console.error("Erro ao gerar o gráfico:", err);
    }
}

// Chama a função para criar o gráfico de ranking
createRankingChart();


// EVOLUÇÃO
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

async function createEvolutionChart() {
    try {
        const evolucaoData = await getRaceEvolution(raceId);

        if (evolucaoData.length === 0) {
            console.log("Nenhum dado encontrado para evolução da corrida.");
            return;
        }

        // Escala X: voltas
        const evolucaoX = d3.scaleLinear()
            .domain([0, evolucaoData[0].positions.length - 1]) // Número de voltas - 1
            .range([auxChartMargin.left, auxChartWidth - auxChartMargin.right]);

        // Escala Y: posições (invertido)
        const evolucaoY = d3.scaleLinear()
            .domain([20.5, 0.5]) // da posição 20 até posição 1
            .range([auxChartHeight - auxChartMargin.bottom, auxChartMargin.top]);

        // Criando o SVG
        const evolucaoSvg = d3.select("#evolucao_chart")
            .attr("width", auxChartWidth)
            .attr("height", auxChartHeight);

        // Linha para cada piloto
        const line = d3.line()
            .x((d, i) => evolucaoX(i)) // i é o número da volta
            .y(d => evolucaoY(d));     // d é a posição

        // Desenhando as linhas dos pilotos
        evolucaoSvg.selectAll(".linha-piloto")
            .data(evolucaoData)
            .enter()
            .append("path")
            .attr("class", "linha-piloto")
            .attr("d", d => line(d.positions))
            .attr("fill", "none")
            .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
            .attr("stroke-width", 2);

        // Eixo X: voltas
        evolucaoSvg.append("g")
            .attr("transform", `translate(0,${auxChartHeight - auxChartMargin.bottom})`)
            .call(d3.axisBottom(evolucaoX)
                .ticks(Math.ceil(evolucaoData[0].positions.length / 10)) // <-- menos ticks
                .tickFormat(d => `${d + 1}`) // volta começa de 1
            );

        const posicaoParaPiloto = {};
        evolucaoData.forEach(piloto => {
            const posicaoInicial = piloto.positions[0];
            if (posicaoInicial !== null) {
                posicaoParaPiloto[posicaoInicial] = piloto.driver.code;
            }
        });
            
        // Eixo Y
        evolucaoSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left}, 0)`)
            .call(d3.axisLeft(evolucaoY)
                .ticks(20) // para posições de 1 a 20
                .tickFormat(pos => posicaoParaPiloto[Math.round(pos)] || "")
            );

    } catch (err) {
        console.error("Erro ao gerar gráfico de evolução:", err);
    }
}

// Chamando para gerar o gráfico:
createEvolutionChart();

// TEMPOS
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

async function createRaceTimesChart() {
    try {
        const temposData = await getRaceTimes(raceId);

        if (temposData.length === 0) {
            console.log("Nenhum dado de tempo encontrado para essa corrida.");
            return;
        }

        // SVG setup
        const temposSvg = d3.select("#tempos_chart")
            .attr("width", auxChartWidth)
            .attr("height", auxChartHeight);

        // Definindo máximo de voltas e máximo de tempo (em ms)
        const maxLapNumber = d3.max(temposData.flatMap(d => d.laps.map(l => l.lap)));
        const maxMilliseconds = d3.max(temposData.flatMap(d => d.laps.map(l => l.milliseconds)));

        // Escala X: número da volta
        const temposX = d3.scaleLinear()
            .domain([1, maxLapNumber])
            .range([auxChartMargin.left, auxChartWidth - auxChartMargin.right]);

        // Escala Y: tempo de volta (milissegundos)
        const temposY = d3.scaleLinear()
            .domain([0, maxMilliseconds])
            .range([auxChartHeight - auxChartMargin.bottom, auxChartMargin.top]);

        // Criar linha
        const line = d3.line()
            .x(d => temposX(d.lap))
            .y(d => temposY(d.milliseconds));

        // Desenhando as linhas dos pilotos
        temposSvg.selectAll(".linha-tempo")
            .data(temposData)
            .enter()
            .append("path")
            .attr("class", "linha-tempo")
            .attr("d", d => line(d.laps))
            .attr("fill", "none")
            .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
            .attr("stroke-width", 2);

        // Eixo X
        temposSvg.append("g")
            .attr("transform", `translate(0,${auxChartHeight - auxChartMargin.bottom})`)
            .call(d3.axisBottom(temposX).ticks(Math.floor(maxLapNumber / 10)).tickFormat(d => `${d}`)); // ticks de 10 em 10

        // Eixo Y (tempo em ms)
        temposSvg.append("g")
            .attr("transform", `translate(${auxChartMargin.left},0)`)
            .call(d3.axisLeft(temposY).ticks(6).tickFormat(d => `${Math.round(d/1000)}s`)); // converter ms para segundos no eixo Y

    } catch (err) {
        console.error("Erro ao gerar o gráfico de tempos:", err);
    }
}

// Chamar a função para criar o gráfico
createRaceTimesChart();