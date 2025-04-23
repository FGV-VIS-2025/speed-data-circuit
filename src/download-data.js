const https = require('https');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const zipUrl = 'https://ergast.com/downloads/f1db_csv.zip';
const zipFilePath = path.join(__dirname, 'f1db_csv.zip');
const outputDir = path.join(__dirname, '../f1db');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

console.log('Baixando o arquivo ZIP...');

const file = fs.createWriteStream(zipFilePath);
https.get(zipUrl, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close(() => {
            console.log('Download concluído. Iniciando extração dos CSVs...');
            extractCsvs();
        });
    });
}).on('error', (err) => {
    fs.unlink(zipFilePath, () => { });
    console.error(`Erro ao baixar o arquivo: ${err.message}`);
});

function extractCsvs() {
    try {
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries();

        zipEntries.forEach((entry) => {
            if (entry.entryName.endsWith('.csv')) {
                const outputFilePath = path.join(outputDir, path.basename(entry.entryName));
                fs.writeFileSync(outputFilePath, entry.getData());
                console.log(`Extraído: ${entry.entryName}`);
            }
        });

        console.log('Extração concluída.');

        fs.unlink(zipFilePath, (err) => {
            if (err) {
                console.error(`Erro ao remover o arquivo ZIP: ${err}`);
            } else {
                console.log('Arquivo ZIP removido.');
            }
        });
    } catch (error) {
        console.error(`Erro ao extrair arquivos: ${error}`);
    }
}
