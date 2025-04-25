import * as d3 from 'd3';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadCSVData(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const parsedData = d3.csvParse(data);
                resolve(parsedData);
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
}

function getUniqueRaceIds(data) {
    const uniqueRaceIds = new Set();
    data.forEach(row => {
        if (row.raceId) {
            uniqueRaceIds.add(Number(row.raceId));
        }
    });
    return Array.from(uniqueRaceIds).sort((a, b) => a - b);
}

function getYears(data) {
    const years = new Set();
    data.forEach(row => {
        if (row.date) {
            const year = new Date(row.date).getFullYear();
            years.add(year);
        }
    });
    return Array.from(years).sort((a, b) => a - b);
}

function filterValidRaces(data, raceIds) {
    return data.filter(row => {
        const raceId = Number(row.raceId);
        return raceIds.includes(raceId);
    });
}

const dbPath = path.join(__dirname, '../f1db');

const circuitsFilePath = path.join(dbPath, 'circuits.csv');
const constructorResultsFilePath = path.join(dbPath, 'constructor_results.csv');
const constructorStandingsFilePath = path.join(dbPath, 'constructor_standings.csv');
const constructorsFilePath = path.join(dbPath, 'constructors.csv');
const driverStandingsFilePath = path.join(dbPath, 'driver_standings.csv');
const driversFilePath = path.join(dbPath, 'drivers.csv');
const lapTimesFilePath = path.join(dbPath, 'lap_times.csv');
const pitStopsFilePath = path.join(dbPath, 'pit_stops.csv');
const qualifyingFilePath = path.join(dbPath, 'qualifying.csv');
const racesFilePath = path.join(dbPath, 'races.csv');
const resultsFilePath = path.join(dbPath, 'results.csv');
const seasonsFilePath = path.join(dbPath, 'seasons.csv');
const sprintResultsFilePath = path.join(dbPath, 'sprint_results.csv');
const statusFilePath = path.join(dbPath, 'status.csv');

async function main() {
    try {
        const [pitStopsData, racesData] = await Promise.all([
            loadCSVData(pitStopsFilePath),
            loadCSVData(racesFilePath)
        ]);

        const uniqueRaceIds = getUniqueRaceIds(pitStopsData);
        const filteredData = filterValidRaces(racesData, uniqueRaceIds);
        const years = getYears(filteredData);

        console.log(years);
    } catch (error) {
        console.error('Erro ao processar os dados:', error);
    }
}

main();

export { loadCSVData };
