const initialDrivers = [
{ name: "Max Verstappen", equipe: "red_bull", equipe_real: "Red Bull (🇦🇹)", idade: 25, nacionalidade: "🇳🇱", pneus: "Macios (⚪)", posicao_grid: 1, volta_mais_rapida: "1:18.235" },
{ name: "Yuki Tsunoda", equipe: "red_bull", equipe_real: "Red Bull (🇦🇹)", idade: 23, nacionalidade: "🇯🇵", pneus: "Médios (🟡)", posicao_grid: 2, volta_mais_rapida: "1:20.412" },
{ name: "Lewis Hamilton", equipe: "ferrari", equipe_real: "Ferrari (🇮🇹)", idade: 39, nacionalidade: "🇬🇧", pneus: "Duros (🔴)", posicao_grid: 3, volta_mais_rapida: "1:19.832" },
{ name: "Charles Leclerc", equipe: "ferrari", equipe_real: "Ferrari (🇮🇹)", idade: 26, nacionalidade: "🇲🇨", pneus: "Macios (⚪)", posicao_grid: 4, volta_mais_rapida: "1:19.574" },
{ name: "Lando Norris", equipe: "mclaren", equipe_real: "McLaren (🇬🇧)", idade: 24, nacionalidade: "🇬🇧", pneus: "Médios (🟡)", posicao_grid: 5, volta_mais_rapida: "1:20.001" },
{ name: "Oscar Piastri", equipe: "mclaren", equipe_real: "McLaren (🇬🇧)", idade: 23, nacionalidade: "🇦🇺", pneus: "Duros (🔴)", posicao_grid: 6, volta_mais_rapida: "1:21.033" },
{ name: "Pierre Gasly", equipe: "alpine", equipe_real: "Alpine (🇫🇷)", idade: 28, nacionalidade: "🇫🇷", pneus: "Macios (⚪)", posicao_grid: 7, volta_mais_rapida: "1:20.546" },
{ name: "Jack Doohan", equipe: "alpine", equipe_real: "Alpine (🇫🇷)", idade: 21, nacionalidade: "🇦🇺", pneus: "Médios (🟡)", posicao_grid: 8, volta_mais_rapida: "1:21.928" },
{ name: "Fernando Alonso", equipe: "aston_martin", equipe_real: "Aston Martin (🇬🇧)", idade: 43, nacionalidade: "🇪🇸", pneus: "Duros (🔴)", posicao_grid: 9, volta_mais_rapida: "1:20.238" },
{ name: "Lance Stroll", equipe: "aston_martin", equipe_real: "Aston Martin (🇬🇧)", idade: 26, nacionalidade: "🇨🇦", pneus: "Macios (⚪)", posicao_grid: 10, volta_mais_rapida: "1:21.411" },
{ name: "Alexander Albon", equipe: "willians", equipe_real: "Williams (🇬🇧)", idade: 28, nacionalidade: "🇹🇭", pneus: "Médios (🟡)", posicao_grid: 11, volta_mais_rapida: "1:21.015" },
{ name: "Carlos Sainz", equipe: "willians", equipe_real: "Williams (🇬🇧)", idade: 30, nacionalidade: "🇪🇸", pneus: "Duros (🔴)", posicao_grid: 12, volta_mais_rapida: "1:20.372" },
{ name: "Isack Hadjar", equipe: "toro_roso", equipe_real: "Toro Roso (🇮🇹)", idade: 20, nacionalidade: "🇫🇷", pneus: "Macios (⚪)", posicao_grid: 13, volta_mais_rapida: "1:22.007" },
{ name: "Liam Lawson", equipe: "toro_roso", equipe_real: "Toro Roso (🇮🇹)", idade: 23, nacionalidade: "🇳🇿", pneus: "Médios (🟡)", posicao_grid: 14, volta_mais_rapida: "1:21.842" },
{ name: "Kimi Antonelli", equipe: "mercedez", equipe_real: "Mercedes (🇩🇪)", idade: 18, nacionalidade: "🇮🇹", pneus: "Duros (🔴)", posicao_grid: 15, volta_mais_rapida: "1:23.001" },
{ name: "George Russell", equipe: "mercedez", equipe_real: "Mercedes (🇩🇪)", idade: 26, nacionalidade: "🇬🇧", pneus: "Macios (⚪)", posicao_grid: 16, volta_mais_rapida: "1:19.617" },
{ name: "Oliver Bearman", equipe: "hass", equipe_real: "Haas (🇺🇸)", idade: 19, nacionalidade: "🇬🇧", pneus: "Médios (🟡)", posicao_grid: 17, volta_mais_rapida: "1:22.366" },
{ name: "Esteban Ocon", equipe: "hass", equipe_real: "Haas (🇺🇸)", idade: 28, nacionalidade: "🇫🇷", pneus: "Duros (🔴)", posicao_grid: 18, volta_mais_rapida: "1:21.774" },
{ name: "Nico Hülkenberg", equipe: "sauber", equipe_real: "Sauber (🇨🇭)", idade: 37, nacionalidade: "🇩🇪", pneus: "Macios (⚪)", posicao_grid: 19, volta_mais_rapida: "1:23.377" },
{ name: "Gabriel Bortoleto", equipe: "sauber", equipe_real: "Sauber (🇨🇭)", idade: 20, nacionalidade: "🇧🇷", pneus: "Médios (🟡)", posicao_grid: 20, volta_mais_rapida: "1:18.983" }
];

const climas = {
"1": ["sol", "../assets/weather/clima_sol.jpg"],
"2": ["neve", "../assets/weather/clima_neve.jpg"],
"3": ["chuva", "../assets/weather/clima_chuva.jpg"]
};

const mockRacesByYear = {
"2024": [
    "Bahrain GP (🇧🇭)", "Saudi Arabian GP (🇸🇦)", "Australian GP (🇦🇺)", "Japanese GP (🇯🇵)", "Chinese GP (🇨🇳)",
    "Miami GP (🇺🇸)", "Emilia Romagna GP (🇮🇹)", "Monaco GP (🇲🇨)", "Canadian GP (🇨🇦)", "Spanish GP (🇪🇸)",
    "Austrian GP (🇦🇹)", "British GP (🇬🇧)", "Hungarian GP (🇭🇺)", "Belgian GP (🇧🇪)", "Dutch GP (🇳🇱)",
    "Italian GP (🇮🇹)", "Azerbaijan GP (🇦🇿)", "Singapore GP (🇸🇬)", "United States GP (🇺🇸)",
    "Mexico City GP (🇲🇽)", "São Paulo GP (🇧🇷)", "Las Vegas GP (🇺🇸)", "Qatar GP (🇶🇦)", "Abu Dhabi GP (🇦🇪)"
],
"2023": [
    "Bahrain GP (🇧🇭)", "Saudi Arabian GP (🇸🇦)", "Australian GP (🇦🇺)", "Azerbaijan GP (🇦🇿)", "Miami GP (🇺🇸)",
    "Monaco GP (🇲🇨)", "Spanish GP (🇪🇸)", "Canadian GP (🇨🇦)", "Austrian GP (🇦🇹)", "British GP (🇬🇧)",
    "Hungarian GP (🇭🇺)", "Belgian GP (🇧🇪)", "Dutch GP (🇳🇱)", "Italian GP (🇮🇹)", "Singapore GP (🇸🇬)",
    "Japanese GP (🇯🇵)", "Qatar GP (🇶🇦)", "United States GP (🇺🇸)", "Mexico City GP (🇲🇽)",
    "São Paulo GP (🇧🇷)", "Las Vegas GP (🇺🇸)", "Abu Dhabi GP (🇦🇪)"
],
"2022": [
    "Bahrain GP (🇧🇭)", "Saudi Arabian GP (🇸🇦)", "Australian GP (🇦🇺)", "Emilia Romagna GP (🇮🇹)", "Miami GP (🇺🇸)",
    "Spanish GP (🇪🇸)", "Monaco GP (🇲🇨)", "Azerbaijan GP (🇦🇿)", "Canadian GP (🇨🇦)", "British GP (🇬🇧)",
    "Austrian GP (🇦🇹)", "French GP (🇫🇷)", "Hungarian GP (🇭🇺)", "Belgian GP (🇧🇪)", "Dutch GP (🇳🇱)",
    "Italian GP (🇮🇹)", "Singapore GP (🇸🇬)", "Japanese GP (🇯🇵)", "United States GP (🇺🇸)",
    "Mexico City GP (🇲🇽)", "São Paulo GP (🇧🇷)", "Abu Dhabi GP (🇦🇪)"
],
"2021": [
    "Bahrain GP (🇧🇭)", "Emilia Romagna GP (🇮🇹)", "Portuguese GP (🇵🇹)", "Spanish GP (🇪🇸)", "Monaco GP (🇲🇨)",
    "Azerbaijan GP (🇦🇿)", "French GP (🇫🇷)", "Styrian GP (🇦🇹)", "Austrian GP (🇦🇹)", "British GP (🇬🇧)",
    "Hungarian GP (🇭🇺)", "Belgian GP (🇧🇪)", "Dutch GP (🇳🇱)", "Italian GP (🇮🇹)", "Russian GP (🇷🇺)",
    "Turkish GP (🇹🇷)", "United States GP (🇺🇸)", "Mexico City GP (🇲🇽)", "São Paulo GP (🇧🇷)",
    "Qatar GP (🇶🇦)", "Saudi Arabian GP (🇸🇦)", "Abu Dhabi GP (🇦🇪)"
],
"2020": [
    "Austrian GP (🇦🇹)", "Styrian GP (🇦🇹)", "Hungarian GP (🇭🇺)", "British GP (🇬🇧)", "70th Anniversary GP (🇬🇧)",
    "Spanish GP (🇪🇸)", "Belgian GP (🇧🇪)", "Italian GP (🇮🇹)", "Tuscan GP (🇮🇹)", "Russian GP (🇷🇺)",
    "Eifel GP (🇩🇪)", "Portuguese GP (🇵🇹)", "Emilia Romagna GP (🇮🇹)", "Turkish GP (🇹🇷)",
    "Bahrain GP (🇧🇭)", "Sakhir GP (🇧🇭)", "Abu Dhabi GP (🇦🇪)"
]
};

const cores_equipes = {
    red_bull: "#181740",
    mercedez: "#41F2D2",
    ferrari: "#D90707",
    alpine: "#0090FF",
    hass: "#BF0A2B",
    aston_martin: "#048C5A",
    mclaren: "#F28D35",
    sauber: "#05A61D",
    willians: "#113A8C",
    toro_roso: "#F2F2F2"
};

// Dados fictícios para os gráficos
const pilotos = ["Piloto 1", "Piloto 2", "Piloto 3", "Piloto 4"];
const tempos = [12, 15, 10, 13]; // Ranking com tempo de volta
const velocidades = [200, 195, 210, 205]; // Velocidade média dos pilotos
const voltas = [1, 2, 3, 4, 5]; // Exemplo de voltas
const evolucao = [
    [1, 2, 3, 4], // Volta 1
    [1, 2, 4, 3], // Volta 2
    [1, 3, 4, 2], // Volta 3
    [2, 1, 4, 3], // Volta 4
    [1, 2, 3, 4], // Volta 5
];

// CONSTRUINDO A LINHA DE CHEGADA
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

const svg = d3.select("#main_chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 20, right: 200, bottom: 20, left: 25 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Fixando o tamanho da corrida em 300
const x = d3.scaleLinear().range([0, chartWidth]).domain([0, 300]);
const y = d3.scaleBand().range([0, chartHeight]).padding(0.1);

// Ordenar os pilotos pela posição de grid
const pilotosOrdenadosGrid = [...initialDrivers]
    .sort((a, b) => a.posicao_grid - b.posicao_grid)
    .map(d => d.name);

// Criar uma escala fictícia de ranking (maior barra = melhor posição)
const valoresRanking = pilotosOrdenadosGrid.map((_, i) => 20 - i); // ex: 20, 19, ..., 1

// Espaço para o título
const marginTop = 30;

// Escalas
const rankingSvg = d3.select("#ranking_chart");
const rankingX = d3.scaleLinear()
    .domain([0, d3.max(valoresRanking)])
    .range([0, 460]);

const rankingY = d3.scaleBand()
    .domain(pilotosOrdenadosGrid)
    .range([0, 280])
    .padding(0.1);

// Adiciona título
rankingSvg.append("text")
    .attr("x", 230)
    .attr("y", marginTop / 2)
    .attr("text-anchor", "middle")
    .text("Ranking pela Posição no Grid")
    .style("font-weight", "bold");

// Adiciona barras
rankingSvg.selectAll("rect")
    .data(valoresRanking)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => rankingY(pilotosOrdenadosGrid[i]) + marginTop)
    .attr("width", d => rankingX(d))
    .attr("height", rankingY.bandwidth())
    .style("fill", "#4CAF50");

// Adiciona nomes dos pilotos
rankingSvg.selectAll("text.label")
    .data(pilotosOrdenadosGrid)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", 5)
    .attr("y", (d, i) => rankingY(d) + marginTop + rankingY.bandwidth() / 2)
    .attr("dy", ".35em")
    .text(d => d)
    .style("fill", "white");

// EVOLUÇÃO
const evolucaoSvg = d3.select("#evolucao_chart");
const evolucaoX = d3.scaleLinear().domain([0, d3.max(voltas)]).range([0, 460]);
const evolucaoY = d3.scaleBand().domain(pilotos).range([0, 280]).padding(0.1);

evolucaoSvg.selectAll("path")
    .data(evolucao)
    .enter()
    .append("path")
    .attr("d", (d, i) => {
        const line = d3.line()
            .x((d, j) => evolucaoX(voltas[j]))
            .y((d, j) => evolucaoY(pilotos[i]) + marginTop);
        return line(d);
    })
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2);

// VELOCIDADE
const velocidadeSvg = d3.select("#velocidade_chart");
const velocidadeX = d3.scaleLinear().domain([0, d3.max(voltas)]).range([0, 460]);
const velocidadeY = d3.scaleLinear().domain([0, d3.max(velocidades)]).range([280, 0]);

velocidadeSvg.selectAll("path")
    .data([velocidades])
    .enter()
    .append("path")
    .attr("transform", `translate(0, ${marginTop})`)
    .attr("d", d3.line()
        .x((d, i) => velocidadeX(i + 1))
        .y(d => velocidadeY(d)))
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2);
// Tamanho do sprite
const spriteWidth = 72;
const spriteHeight = 45;

// Carregando os elementos da página
const yearSelect = document.getElementById("yearSelect");
const raceSelect = document.getElementById("raceSelect");
const playPauseBtn = document.getElementById("playPause");
const lapSlider = document.getElementById("lapSlider");
const lapDisplay = document.getElementById("lapDisplay");

let currentLap = 0;
let intervalId = null;
let isPlaying = false;
const numberOfLaps = 20;
let laps = [];

// Função que gera dados falsos
function generateMockLaps() {
const laps = [];
// Volta 0: score inicial 0
const drivers = initialDrivers.map(driver => ({ ...driver, score: 0 }));
laps.push(JSON.parse(JSON.stringify(drivers)));

for (let lap = 1; lap < numberOfLaps; lap++) {
    const previousLap = JSON.parse(JSON.stringify(laps[lap - 1]));
    const newLap = previousLap.map(driver => {
    const noise = d3.randomNormal(0, Math.sqrt(5))();
    const increment = 15 + noise;
    return {
        ...driver,
        score: Math.max(0, driver.score + increment)
    };
    });
    laps.push(newLap);
}
return laps;
}

laps = generateMockLaps();

// Insere anos no select
const availableYears = ["2024", "2023", "2022", "2021", "2020"];
availableYears.forEach(year => {
const option = document.createElement("option");
option.value = year;
option.textContent = year;
yearSelect.appendChild(option);
});

// Insere corridas no select
yearSelect.addEventListener("change", () => {
const selectedYear = yearSelect.value;
raceSelect.innerHTML = '<option value="">Selecione uma corrida</option>';
raceSelect.disabled = true;

if (selectedYear && mockRacesByYear[selectedYear]) {
    mockRacesByYear[selectedYear].forEach(race => {
    const opt = document.createElement("option");
    opt.value = race;
    opt.textContent = race;
    raceSelect.appendChild(opt);
    });
    raceSelect.disabled = false;
}
stopPlayback();
});

// Renderiza a volta
raceSelect.addEventListener("change", () => {
const raceChosen = raceSelect.value;
if (raceChosen) {
    currentLap = 0;
    renderLap(laps[currentLap], currentLap);
    updateUI();
}
stopPlayback();

// definindo um clima aleatório para cada corrida
const clima_img = document.getElementById("clima_display");
clima_img.innerHTML = `<img src="${climas[Math.floor(Math.random() * 3) + 1][1]}" alt="">`;
const infos = document.getElementById("clima_info");
infos.innerHTML = `
    <p>Horário: ${new Date().toLocaleTimeString()}</p>
    <p>Data: ${new Date().toLocaleDateString()}</p>
    <p>Temperatura: ${Math.floor(Math.random() * 30) + 20}°C</p>
    <p>Temp. Pista: ${Math.floor(Math.random() * 40) + 20}°C</p>
    <p>Umidade: ${Math.floor(Math.random() * 100)}%</p>
    <p>Vento: ${Math.floor(Math.random() * 20) + 5} km/h</p>
`;

    const select_pilotos = document.getElementById("multiselect");
    select_pilotos.innerHTML = "";

    // Adiciona a opção "Selecionar Todos"
    let selectAllDiv = document.createElement('div');
    let selectAllCheckbox = document.createElement('input');
    let selectAllLabel = document.createElement('label');

    selectAllCheckbox.type = "checkbox";
    selectAllCheckbox.id = "selectAll";
    selectAllLabel.htmlFor = "selectAll";
    selectAllLabel.textContent = "Selecionar Todos";

    selectAllDiv.appendChild(selectAllCheckbox);
    selectAllDiv.appendChild(selectAllLabel);
    select_pilotos.appendChild(selectAllDiv);

    // Adiciona cada piloto como uma checkbox
    initialDrivers.forEach((driver, index) => {
        let wrapper = document.createElement('div');
    
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.id = `driver_${index}`;
        checkbox.name = "drivers";
        checkbox.value = driver.name;
    
        let label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = driver.name;
    
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        select_pilotos.appendChild(wrapper);
    });
  
    // Funcionalidade "Selecionar Todos"
    selectAllCheckbox.addEventListener("change", () => {
        const checkboxes = document.querySelectorAll('input[name="drivers"]');
        checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    });
});

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

lapSlider.addEventListener("input", () => {
    currentLap = parseInt(lapSlider.value);
    renderLap(laps[currentLap], currentLap);
    updateUI();
    stopPlayback();
});

function stopPlayback() {
    clearInterval(intervalId);
    isPlaying = false;
    playPauseBtn.textContent = "▶️ Play";
}

// ATUALIZA A INTERFACE DO USUÁRIO
function updateUI() {
    lapSlider.max = laps.length - 1;
    lapSlider.disabled = false;
    lapSlider.value = currentLap;
    lapDisplay.textContent = `Volta ${currentLap + 1}`;
}

// RENDERIZA A VOLTA COM BASE NOS DADOS
function renderLap(data, lapNum) {
    
    // ORDENA OS PILOTOS COM BASE NO SCORE
    const sorted = [...data].sort((a, b) => b.score - a.score);
    y.domain(sorted.map(d => d.name));

    // ATUALIZA AS BARRAS
    const bars = g.selectAll(".bar").data(sorted, d => d.name);
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.name))
        .attr("width", d => x(d.score))
        .attr("fill", d => cores_equipes[d.equipe] || "#ccc")
        .attr("fill-opacity", 1)

        // ADICIONA O TOOLTIP
        .on("mouseover", function(event, d) {
            tooltip
                .style("opacity", 1)
                .html(`
                    <div style="display: flex; align-items: center; background-color: white; border-radius: 5px; padding: 2px;">
                        <img src="../assets/drivers/${d.name.replace(/ /g, '_').toLowerCase()}.png" alt="${d.name}" style="width:8vw; margin-right:10px;">
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
        })

        // MOVER O TOOLTIP COM O MOUSE
        .on("mousemove", function(event) {
            const tooltipWidth = parseInt(tooltip.style("width"));
            const tooltipX = event.pageX + 15;
            const tooltipY = event.pageY - 28;

            // SE TIVER MUITO À DIREITA, COLOCA O TOOLLTIP À ESQUERDA
            if (tooltipX + tooltipWidth > window.innerWidth) {
                tooltip.style("left", (event.pageX - tooltipWidth - 35) + "px");
            } else {
                tooltip.style("left", tooltipX + "px");
            }

            tooltip.style("top", (event.pageY - 28) + "px");
        })

        // QUANDO O MOUSE SAI, ESCONDE O TOOLTIP
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        })

        .merge(bars)
        .transition().duration(1000)
        .attr("y", d => y(d.name))
        .attr("width", d => x(d.score))
    bars.exit().remove();

    // ATUALIZA O NOME DOS PILOTOS
    const labels = g.selectAll(".label").data(sorted, d => d.name);
    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("fill", d => {
            const estimatedTextWidth = d.name.length * 9;
            const margemErro = 15;
            return x(d.score) > estimatedTextWidth + margemErro ? "white" : "black";
        })
        .attr("x", d => {
            const estimatedTextWidth = d.name.length * 9;
            const margemErro = 15;
            return x(d.score) > estimatedTextWidth + margemErro
                ? x(d.score) - estimatedTextWidth - 10  
                : x(d.score) + spriteWidth + 10;         
        })
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5)
        .text(d => d.name)
        .merge(labels)
        .transition().duration(1000)
        .attr("fill", d => {
            const estimatedTextWidth = d.name.length * 9;
            const margemErro = 15;
            return x(d.score) > estimatedTextWidth + margemErro ? "white" : "black";
        })
        .attr("x", d => {
            const estimatedTextWidth = d.name.length * 9;
            const margemErro = 15;
            return x(d.score) > estimatedTextWidth + margemErro
                ? x(d.score) - estimatedTextWidth - 10
                : x(d.score) + spriteWidth + 10;
        })
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5);
    labels.exit().remove();

    // ATUALIZA OS SPRITES E O TOOLTIP
    const tooltip = d3.select("#tooltip");
    const sprites = g.selectAll("image.sprite").data(sorted, d => d.name);
    sprites.enter()
        .append("image")
        .attr("class", "sprite")
        .attr("xlink:href", d => `../assets/sprites/${d.equipe}.png`)
        .attr("width", spriteWidth)
        .attr("height", spriteHeight)

        // ADICIONA O TOOLTIP
        .attr("x", d => x(d.score) + 5)
        .on("mouseover", function(event, d) {
            tooltip
                .style("opacity", 1)
                .html(`
                    <div style="display: flex; align-items: center; background-color: white; border-radius: 5px; padding: 2px;">
                        <img src="../assets/drivers/${d.name.replace(/ /g, '_').toLowerCase()}.png" alt="${d.name}" style="width:8vw; margin-right:10px;">
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
        })

        // MOVER O TOOLTIP COM O MOUSE
        .on("mousemove", function(event) {
            const tooltipWidth = parseInt(tooltip.style("width"));
            const tooltipX = event.pageX + 15;
            const tooltipY = event.pageY - 28;

            // SE TIVER MUITO À DIREITA, COLOCA O TOOLLTIP À ESQUERDA
            if (tooltipX + tooltipWidth > window.innerWidth) {
                tooltip.style("left", (event.pageX - tooltipWidth - 35) + "px");
            } else {
                tooltip.style("left", tooltipX + "px");
            }

            tooltip.style("top", (event.pageY - 28) + "px");
        })

        // QUANDO O MOUSE SAI, ESCONDE O TOOLTIP
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        })
        
        .merge(sprites)
        .transition().duration(1000)
        .attr("transform", d => {
            const posX = x(d.score) + 5;
            const posY = y(d.name) + (y.bandwidth() - spriteHeight) / 2;
            return `translate(${posX + spriteWidth/2},${posY + spriteHeight/2}) rotate(90) translate(${-spriteWidth/2},${-spriteHeight/2})`;
        });

    sprites.exit().remove();

    d3.select("h2").text(`F1 Bar Chart Race - Volta ${lapNum + 1}`);
}