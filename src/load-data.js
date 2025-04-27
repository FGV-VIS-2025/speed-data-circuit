import * as d3 from 'd3';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

async function getValidRaceIds() {
    const data = await loadCSVData(pitStopsFilePath);
    if (!data) {
        console.error('Erro ao carregar os dados de pit stops.');
        return [];
    }
    const validRaceIds = new Set();
    data.forEach(row => {
        if (row.raceId) {
            validRaceIds.add(Number(row.raceId));
        }
    });
    return Array.from(validRaceIds);
}

async function getAllValidSeasons() {
    const data = await loadCSVData(seasonsFilePath);
    if (!data) {
        console.error('Erro ao carregar os dados de temporadas.');
        return [];
    }
    const validRaceIds = await getValidRaceIds();
    const validSeasons = data.filter(row => {
        const raceId = Number(row.raceId);
        return validRaceIds.includes(raceId);
    });
    return validSeasons;
}

async function getRacesByYear(year) {
    const data = await loadCSVData(racesFilePath);
    return data.filter(row => Number(row.year) === Number(year));
}

async function getDriversByRace(raceId) {
    const results = await loadCSVData(resultsFilePath);
    const drivers = await loadCSVData(driversFilePath);
    const driverIds = results.filter(r => Number(r.raceId) === Number(raceId)).map(r => r.driverId);
    return drivers.filter(d => driverIds.includes(d.driverId));
}

async function getResultsByRace(raceId) {
    const results = await loadCSVData(resultsFilePath);
    return results.filter(r => Number(r.raceId) === Number(raceId));
}

async function getPitStopsByRace(raceId) {
    const pitStops = await loadCSVData(pitStopsFilePath);
    return pitStops.filter(p => Number(p.raceId) === Number(raceId));
}

async function getLapTimesByDriverRace(raceId, driverId) {
    const lapTimes = await loadCSVData(lapTimesFilePath);
    return lapTimes.filter(l => Number(l.raceId) === Number(raceId) && Number(l.driverId) === Number(driverId));
}

async function getDriversPositionsByRace(raceId) {

    const lapTimes = await loadCSVData(lapTimesFilePath);
    const results = await loadCSVData(resultsFilePath);
    const drivers = await loadCSVData(driversFilePath);

    const raceDriverIds = results.filter(r => Number(r.raceId) === Number(raceId)).map(r => r.driverId);
    const raceLapTimes = lapTimes.filter(l => Number(l.raceId) === Number(raceId));

    const maxLap = Math.max(...raceLapTimes.map(l => Number(l.lap)));

    const positionsByDriver = raceDriverIds.map(driverId => {
        const positions = [];
        for (let lap = 1; lap <= maxLap; lap++) {
            const lapEntry = raceLapTimes.find(l => Number(l.driverId) === Number(driverId) && Number(l.lap) === lap);
            positions.push(lapEntry ? Number(lapEntry.position) : null);
        }
        // Busca info do piloto
        const driverInfo = drivers.find(d => d.driverId === driverId);
        return {
            driverId,
            driver: driverInfo,
            positions
        };
    });
    return positionsByDriver;
}

async function getFullRaceData() {
    const races = await loadCSVData(racesFilePath);
    const results = await loadCSVData(resultsFilePath);
    const drivers = await loadCSVData(driversFilePath);
    const constructors = await loadCSVData(constructorsFilePath);
    const pitStops = await loadCSVData(pitStopsFilePath);
    const lapTimes = await loadCSVData(lapTimesFilePath);

    const driversMap = Object.fromEntries(drivers.map(d => [d.driverId, d]));
    const constructorsMap = Object.fromEntries(constructors.map(c => [c.constructorId, c]));

    return races.map(race => {
        const raceId = race.raceId;

        const raceResults = results.filter(r => r.raceId === raceId).map(r => ({
            ...r,
            driver: driversMap[r.driverId] || null,
            constructor: constructorsMap[r.constructorId] || null
        }));

        const racePitStops = pitStops.filter(p => p.raceId === raceId);
        const raceLapTimes = lapTimes.filter(l => l.raceId === raceId);

        return {
            ...race,
            results: raceResults,
            pitStops: racePitStops,
            lapTimes: raceLapTimes
        };
    });
}

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

export {
    getAllValidSeasons, getDriversByRace, getDriversPositionsByRace, getFullRaceData, getLapTimesByDriverRace, getPitStopsByRace, getRacesByYear, getResultsByRace, loadCSVData
};

