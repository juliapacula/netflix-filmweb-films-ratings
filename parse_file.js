const fs = require('fs');
const parser = require('csv-parser');
const writer = require('csv-writer');

const currentWriter = writer.createObjectCsvWriter({
    path: 'NetflixParsedViewingHistory.csv',
    header: [
        {id: 'name', title: 'Nazwa'},
        {id: 'isSerial', title: 'Typ'},
        {id: 'date', title: 'Rozpoczęto oglądanie'},
        {id: 'rating', title: 'Ocena'},
    ]
});

const films = [];

fs.createReadStream('NetflixViewingHistory.csv')
    .pipe(
        parser()
    )
    .on('data', (row) => {
        const isSerial = row.Title.includes(":");
        const entryName = isSerial ? row.Title.split(":")[0] : row.Title;
        const alreadySeenFilm = films.find((f) => f.name === entryName);
        const date = row.Date.split(".");
        const parsedDate = `${date[2]}-${date[1]}-${date[0]}`

        if (!!alreadySeenFilm) {
            alreadySeenFilm.date = parsedDate;

            return;
        }

        films.push({ name: entryName, isSerial: isSerial ? 'Serial' : 'Film', date: parsedDate, rating: 0 });
    })
    .on('end', () => {
        currentWriter.writeRecords(films)
            .then(() => console.log("Netflix has parsed all data!"));
    });
