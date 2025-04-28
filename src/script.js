import {initialDrivers,
        evolucaoData,
        mockRacesByYear,
        climas,
        cores_equipes
 } from "./mock-consts.js";

// FUNÇÕES DOS DADOS --------------------------------------------------------------------------------------------------------------------------------

const racesFilePath = "../f1db/races.csv";
const pitStopsFilePath = "../f1db/pit_stops.csv";

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

// CONSTRUINDO A LINHA DE CHEGADA -------------------------------------------------------------------------------------------------------------------
const grid = document.getElementById('grid');
const cols = [1360, 1380, 1400, 1420];
const numRows = Math.floor((860 - 20) / 20) + 1;

for (let row = 0; row < numRows - 2; row++) {
    const y = 20 + row * 20;
    for (let i = 0; i < cols.length; i++) {
    const x = cols[cols.length - 1 - i];
    let fill;
    if (row % 2 === 0) {
        fill = (i % 2 === 0) ? "#ffffff" : "#000000";
    } else {
        fill = (i % 2 === 0) ? "#000000" : "#ffffff";
    }
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "20");
    rect.setAttribute("height", "20");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("style", "fill:" + fill + ";");
    grid.appendChild(rect);
    }
}
// VARIÁVEIS ------------------------------------------------------------------------------------------------------------------------------------

const mainChartSVG = d3.select("#main_chart");
const mainChartWidth = +mainChartSVG.attr("width");
const mainChartHeight = +mainChartSVG.attr("height");
const mainChartMargin = { top: 825, right: 200, bottom: -30, left: 30 };

const mainChartRealWidth = mainChartWidth - mainChartMargin.left - mainChartMargin.right;
const mainChartRealHeight = mainChartHeight - mainChartMargin.top - mainChartMargin.bottom;
const g = mainChartSVG.append("g").attr("transform", `translate(${mainChartMargin.left},${mainChartMargin.top})`);

const auxChartWidth = 450;
const auxChartHeight = 300;
const auxChartMargin = { top: 30, right: 20, bottom: 30, left: 110 };

// Manter a proporção 8:5
const spriteWidth = 72;
const spriteHeight = 45;

// Escala X dinâmica (alteração crucial)
const x = d3.scaleLinear()
  .range([mainChartRealWidth, 0]).domain([mainChartRealWidth, 0]); // Agora usa toda a largura disponível

// Escala Y com padding reduzido para barras mais altas (alteração importante)
const y = d3.scaleBand()
  .range([mainChartRealHeight, 0])
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
            opt.value = race.name;
            opt.textContent = race.name;
            raceSelect.appendChild(opt);
        });
        raceSelect.disabled = false;
    }
    stopPlayback();
});


// Muda o clima e o circuito
raceSelect.addEventListener("change", () => {
    clearChart();

    climaIMG.innerHTML = `<img src="${climas[Math.floor(Math.random() * 3) + 1][1]}" alt="">`;
    climaInfo.innerHTML = `
        <p>Horário: ${new Date().toLocaleTimeString()}</p>
        <p>Data: ${new Date().toLocaleDateString()}</p>
        <p>Temperatura: ${Math.floor(Math.random() * 30) + 20}°C</p>
        <p>Temp. Pista: ${Math.floor(Math.random() * 40) + 20}°C</p>
        <p>Umidade: ${Math.floor(Math.random() * 100)}%</p>
        <p>Vento: ${Math.floor(Math.random() * 20) + 5} km/h</p>`;

    lapIMG.innerHTML = `<img src="${"../assets/others/interlagos.jpg"}" alt="">`;

    stopPlayback();

    laps = generateMockLaps(selectedYear);

    const raceChosen = raceSelect.value;

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

// Função que gera dados falsos
function generateMockLaps(year){
    const laps = [];
    const drivers = initialDrivers[year].map(driver => ({ ...driver, score: 0 }));
    laps.push(JSON.parse(JSON.stringify(drivers)));

    for (let lap = 1; lap < numberOfLaps; lap++) {
        const previousLap = JSON.parse(JSON.stringify(laps[lap - 1]));
        const newLap = previousLap.map(driver => {
        const noise = d3.randomNormal(0, Math.sqrt(5))();
        const increment = (15 + noise)*4.25;
        return {
            ...driver,
            score: Math.max(0, driver.score + increment)
        };
    });
    laps.push(newLap);  
    }
    return laps;
};

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
    
    // BARRAS
    const bars = g.selectAll(".bar").data(sorted, d => d.name);
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.name))  // Posicionamento vertical corrigido
        .attr("x", 0)
        .attr("width", 0)  // Inicialmente com largura 0 para animação
        .attr("fill", d => cores_equipes[d.equipe] || "#ccc")
        .attr("fill-opacity", 1)
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .merge(bars)
        .transition().duration(1000)
        .attr("width", d => x(d.score))  // Largura da barra de acordo com o score
        .attr("y", d => y(d.name))
        .attr("fill", d => cores_equipes[d.equipe] || "#ccc");
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
        .transition().duration(1000)
        .attr("fill", d => {
            const estimatedTextWidth = d.name.length * 10;
            const margemErro = 15;
            return x(d.score) > estimatedTextWidth + margemErro ? "white" : "black";
        })
        .attr("x", d => {
            const estimatedTextWidth = d.name.length * 10;
            const margemErro = 25;
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
        .attr("xlink:href", d => `../assets/${selectedYear}/sprites/${d.equipe}.png`)
        .attr("width", spriteWidth)
        .attr("height", spriteHeight)
        .on("mouseover", (event, d) => showTooltip(event, d))
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseout", () => hideTooltip())
        .merge(sprites)
        .transition().duration(1000)
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
                    <img src="../assets/${selectedYear}/drivers/${d.name.split(" ")[1].toLowerCase()}.png" alt="${d.name}" style="width:8vw; margin-right:10px;">
                    <div>
                        <strong>${d.name}</strong><br>
                        Idade: ${d.idade} anos<br>
                        Equipe: ${d.equipe_real}<br>
                        Nacionalidade: ${d.nacionalidade}<br>
                        Pneus: ${d.pneus}<br>
                        Largada: ${d.posicao_grid}º<br>
                        VMR: ${d.volta_mais_rapida} min<br>
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





















// // Pegando os nomes dos pilotos e suas pontuações
// const pilotosOrdenadosGrid = evolucaoData
//     .sort((a, b) => b.pontuacao - a.pontuacao) // ordena por pontuação decrescente
//     .map(d => d.name);

// const valoresRanking = evolucaoData
//     .sort((a, b) => b.pontuacao - a.pontuacao)
//     .map(d => d.pontuacao);

// // Criando SVG
// const rankingSvg = d3.select("#ranking_chart")
//     .attr("width", auxChartWidth)
//     .attr("height", auxChartHeight);

// // Escalas
// const rankingX = d3.scaleLinear()
//     .domain([0, d3.max(valoresRanking)])
//     .range([0, auxChartWidth - auxChartMargin.left - auxChartMargin.right]);

// const rankingY = d3.scaleBand()
//     .domain(pilotosOrdenadosGrid)
//     .range([auxChartMargin.top, auxChartHeight - auxChartMargin.bottom])
//     .padding(0.1);

// // Adiciona barras
// rankingSvg.selectAll("rect")
//     .data(evolucaoData.sort((a, b) => b.pontuacao - a.pontuacao))
//     .enter()
//     .append("rect")
//     .attr("x", auxChartMargin.left)
//     .attr("y", d => rankingY(d.name))
//     .attr("width", d => rankingX(d.pontuacao))
//     .attr("height", rankingY.bandwidth())
//     .style("fill", "#4CAF50");

// // Adiciona eixo Y com nomes dos pilotos
// rankingSvg.append("g")
//     .attr("transform", `translate(${auxChartMargin.left}, 0)`)
//     .call(d3.axisLeft(rankingY).tickSize(0)) // remove ticks
//     .selectAll("text")
//     .style("text-anchor", "end"); // Alinha os nomes melhor

// // Eixo X com valores da pontuação
// rankingSvg.append("g")
//     .attr("transform", `translate(${auxChartMargin.left},${auxChartHeight - auxChartMargin.bottom})`)
//     .call(d3.axisBottom(rankingX).ticks(5)) // você pode mudar o número de ticks se quiser
//     .selectAll("text")
//     .style("text-anchor", "middle");

// // EVOLUÇÃO
// // Escala X: voltas
// const evolucaoX = d3.scaleLinear()
//     .domain([0, 9]) // 0 até 9, ou ajuste para o número real de voltas - 1
//     .range([auxChartMargin.left, auxChartWidth - auxChartMargin.right]);

// // Escala Y: posições (1º lugar no topo, 20º embaixo)
// const evolucaoY = d3.scaleLinear()
//     .domain([20.5, 0.5]) // invertido porque 1º lugar fica no topo
//     .range([auxChartHeight - auxChartMargin.bottom, auxChartMargin.top]);

// // Criando o SVG
// const evolucaoSvg = d3.select("#evolucao_chart")
//     .attr("width", auxChartWidth)
//     .attr("height", auxChartHeight);

// // Linha para cada piloto
// const line = d3.line()
//     .x((d, i) => evolucaoX(i)) // i é o número da volta
//     .y(d => evolucaoY(d));     // d é a posição na volta

// // Desenhando as linhas dos pilotos
// evolucaoSvg.selectAll(".linha-piloto")
//     .data(evolucaoData) // Um item para cada piloto
//     .enter()
//     .append("path")
//     .attr("class", "linha-piloto")
//     .attr("d", d => line(d.posicoes)) // d.posicoes = vetor de posições do piloto nas voltas
//     .attr("fill", "none")
//     .attr("stroke", (d, i) => d3.schemeCategory10[i % 10]) // cores diferentes
//     .attr("stroke-width", 2);

// // Eixo X
// evolucaoSvg.append("g")
//     .attr("transform", `translate(0,${auxChartHeight - auxChartMargin.bottom})`)
//     .call(d3.axisBottom(evolucaoX).ticks(10).tickFormat(d => `${d + 1}`));

// // Eixo Y: posições, mas trocando números pelos nomes dos pilotos
// const posicaoParaPiloto = {};
// evolucaoData.forEach(piloto => {
//     // Pega a posição inicial do piloto na volta 0
//     const posicaoInicial = piloto.posicoes[0];
//     posicaoParaPiloto[posicaoInicial] = piloto.name;
// });

// // Eixo Y
// evolucaoSvg.append("g")
//     .attr("transform", `translate(${auxChartMargin.left},0)`)
//     .call(d3.axisLeft(evolucaoY)
//         .ticks(20)
//         .tickFormat(d => posicaoParaPiloto[d]));

// // VELOCIDADE
// const velocidadeSvg = d3.select("#velocidade_chart");
// const velocidadeX = d3.scaleLinear().domain([0, d3.max(voltas)]).range([0, 460]);
// const velocidadeY = d3.scaleLinear().domain([0, d3.max(velocidades)]).range([280, 0]);

// velocidadeSvg.selectAll("path")
//     .data([velocidades])
//     .enter()
//     .append("path")
//     .attr("transform", `translate(0, ${auxChartMargin.top})`)
//     .attr("d", d3.line()
//         .x((d, i) => velocidadeX(i + 1))
//         .y(d => velocidadeY(d)))
//     .attr("fill", "none")
//     .attr("stroke", "orange")
//     .attr("stroke-width", 2);


































    