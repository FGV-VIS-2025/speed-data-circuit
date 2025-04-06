const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 20, right: 200, bottom: 20, left: 20 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
d3.select("svg").style("background-color", "#A39B9B");

// Fixando o Tamanho da Corrida em 300
const x = d3.scaleLinear().range([0, chartWidth]).domain([0, 300]);
const y = d3.scaleBand().range([0, chartHeight]).padding(0.1);

// Tamanho do Sprite
const spriteWidth = 64;
const spriteHeight = 40;

// Carregando os Elementos da Página
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

// Cores de Cada Equipe
const cores_equipes = {
    red_bull: "#181740",
    mercedez: "#3D3E40",
    ferrari: "#D90707",
    alpine: "#0090FF",
    hass: "#BF0A2B",
    aston_martin: "#048C5A",
    mclaren: "#F28D35",
    sauber: "#05A61D",
    willians: "#113A8C",
    toro_roso: "#F2F2F2"
};

// Opções de Anos e Corridas
const mockRacesByYear = {
    "2022": ["Bahrain GP", "Monaco GP", "Brazil GP"],
    "2023": ["Bahrain GP", "Miami GP", "Japan GP"],
    "2024": ["Australia GP", "Canada GP", "Italy GP"]
};

// Array Com Nomes dos Pilotos e Equipes (2025)
const initialDrivers = [
    { name: "Max Verstappen", equipe: "red_bull" },
    { name: "Lewis Hamilton", equipe: "ferrari" },
    { name: "Charles Leclerc", equipe: "ferrari" },
    { name: "Lando Norris", equipe: "mclaren" },
    { name: "Yuki Tsunoda", equipe: "red_bull" },
    { name: "Carlos Sainz", equipe: "ferrari" },
    { name: "Pierre Gasly", equipe: "alpine" },
    { name: "Fernando Alonso", equipe: "aston_martin" },
    { name: "Oscar Piastri", equipe: "mclaren" },
    { name: "Jack Doohan", equipe: "alpine" },
    { name: "Lance Stroll", equipe: "aston_martin" },
    { name: "Alexander Albon", equipe: "willians" },
    { name: "Isack Hadjar", equipe: "toro_roso" },
    { name: "Kimi Antonelli", equipe: "mercedez" },
    { name: "Oliver Bearman", equipe: "hass" },
    { name: "Esteban Ocon", equipe: "hass" },
    { name: "Carlos Sainz", equipe: "willians" },
    { name: "Liam Lawson", equipe: "toro_roso" },
    { name: "Nico Hülkenberg", equipe: "sauber" },
    { name: "Gabriel Bortoleto", equipe: "sauber" },
    { name: "George Russell", equipe: "mercedez" }];

// Função que Gera Dados Falsos
function generateMockLaps() {
    const laps = [];
    // Volta 0: score inicial 0
    const drivers = initialDrivers.map(driver => ({ ...driver, score: 0 }));
    laps.push(JSON.parse(JSON.stringify(drivers)));

    for (let lap = 1; lap < numberOfLaps; lap++) {
        const previousLap = JSON.parse(JSON.stringify(laps[lap - 1]));
        const newLap = previousLap.map(driver => {
        const noise = d3.randomNormal(0, Math.sqrt(5))();
        const increment = 13 + noise;
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

// Insere anos no Select
const availableYears = ["2023", "2024", "2025"];
availableYears.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
});

// Insere corridas no Select
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

// Renderiza a Volta
raceSelect.addEventListener("change", () => {
    const raceChosen = raceSelect.value;
    if (raceChosen) {
      currentLap = 0;
      renderLap(laps[currentLap], currentLap);
      updateUI();
    }
    stopPlayback();
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

function updateUI() {
    lapSlider.max = laps.length - 1;
    lapSlider.disabled = false;
    lapSlider.value = currentLap;
    lapDisplay.textContent = `Volta ${currentLap + 1}`;
}

// Renderiza a volta usando o score acumulado (o eixo x é fixo de 0 a 300)
function renderLap(data, lapNum) {
    // Ordena os Pilotos pelo Nome da Equipe
    data.sort((a, b) => {
        if (a.equipe < b.equipe) return -1;
        if (a.equipe > b.equipe) return 1;
        return 0;
    });

    const sorted = [...data].sort((a, b) => b.score - a.score);
    y.domain(sorted.map(d => d.name));

    // Atualiza as barras
    const bars = g.selectAll(".bar").data(sorted, d => d.name);
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("y", d => y(d.name))
      .attr("width", d => x(d.score))
      .attr("fill", d => cores_equipes[d.equipe] || "#ccc")
      .merge(bars)
      .transition().duration(600)
      .attr("y", d => y(d.name))
      .attr("width", d => x(d.score));
    bars.exit().remove();

    // Atualiza os labels
    const labels = g.selectAll(".label").data(sorted, d => d.name);
    labels.enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.score) + spriteWidth + 10)
      .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5)
      .text(d => d.name)
      .merge(labels)
      .transition().duration(600)
      .attr("x", d => x(d.score) + spriteWidth + 10)
      .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5);
    labels.exit().remove();

    // Atualiza os sprites
    const sprites = g.selectAll("image.sprite").data(sorted, d => d.name);
    sprites.enter()
      .append("image")
      .attr("class", "sprite")
      .attr("xlink:href", d => `sprites/${d.equipe}.png`)
      .attr("width", spriteWidth)
      .attr("height", spriteHeight)
      .merge(sprites)
      .transition().duration(600)
      .attr("transform", d => {
        const posX = x(d.score) + 5;
        const posY = y(d.name) + (y.bandwidth() - spriteHeight) / 2;
        return `translate(${posX + spriteWidth/2},${posY + spriteHeight/2}) rotate(90) translate(${-spriteWidth/2},${-spriteHeight/2})`;
      });
    sprites.exit().remove();

    d3.select("h2").text(`F1 Bar Chart Race - Volta ${lapNum + 1}`);
}