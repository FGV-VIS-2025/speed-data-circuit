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

const dfPath = path.join(__dirname, '../f1db');

const circuitsFilePath = path.join(dfPath, 'circuits.csv');
const constructorResultsFilePath = path.join(dfPath, 'constructor_results.csv');
const constructorStandingsFilePath = path.join(dfPath, 'constructor_standings.csv');
const constructorsFilePath = path.join(dfPath, 'constructors.csv');
const driverStandingsFilePath = path.join(dfPath, 'driver_standings.csv');
const driversFilePath = path.join(dfPath, 'drivers.csv');
const lapTimesFilePath = path.join(dfPath, 'lap_times.csv');
const pitStopsFilePath = path.join(dfPath, 'pit_stops.csv');
const qualifyingFilePath = path.join(dfPath, 'qualifying.csv');
const racesFilePath = path.join(dfPath, 'races.csv');
const resultsFilePath = path.join(dfPath, 'results.csv');
const seasonsFilePath = path.join(dfPath, 'seasons.csv');
const sprintResultsFilePath = path.join(dfPath, 'sprint_results.csv');
const statusFilePath = path.join(dfPath, 'status.csv');

Promise.all([
    loadCSVData(circuitsFilePath),
    loadCSVData(constructorsFilePath),
    loadCSVData(driversFilePath),
    loadCSVData(constructorResultsFilePath),
    loadCSVData(constructorStandingsFilePath),
    loadCSVData(driverStandingsFilePath),
    loadCSVData(lapTimesFilePath),
    loadCSVData(pitStopsFilePath),
    loadCSVData(qualifyingFilePath),
    loadCSVData(racesFilePath),
    loadCSVData(resultsFilePath),
    loadCSVData(sprintResultsFilePath),
    loadCSVData(seasonsFilePath),
    loadCSVData(statusFilePath)
]).then(([
    circuitsData,
    constructorsData,
    driversData,
    constructorResultsData,
    constructorStandingsData,
    driverStandingsData,
    lapTimesData,
    pitStopsData,
    qualifyingData,
    racesData,
    resultsData,
    sprintResultsData,
    seasonsData,
    statusData
]) => {
    console.log('circuits:', circuitsData);
    console.log('constructors:', constructorsData);
    console.log('drivers:', driversData);
    console.log('constructorResults:', constructorResultsData);
    console.log('constructorStandings:', constructorStandingsData);
    console.log('driverStandings:', driverStandingsData);
    console.log('lapTimes:', lapTimesData);
    console.log('pitStops:', pitStopsData);
    console.log('qualifying:', qualifyingData);
    console.log('races:', racesData);
    console.log('results:', resultsData);
    console.log('sprint_results:', sprintResultsData);
    console.log('seasons:', seasonsData);
    console.log('status:', statusData);
}).catch(error => {
    console.error('Error loading CSV data:', error);
});

export { loadCSVData };
