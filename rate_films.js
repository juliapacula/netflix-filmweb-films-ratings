const puppeteer = require('puppeteer');
const fs = require('fs');
const parser = require('csv-parser');
const writer = require('csv-writer');

const currentWriter = writer.createObjectCsvWriter({
    path: 'NetflixParsedViewingHistoryWithRatings.csv',
    header: [
        {id: 'name', title: 'Nazwa'},
        {id: 'isSerial', title: 'Typ'},
        {id: 'date', title: 'Rozpoczęto oglądanie'},
        {id: 'rating', title: 'Ocena'},
        {id: 'href', title: 'Strona FilmWeb'},
    ]
});

const films = [];

fs.createReadStream('NetflixParsedViewingHistory.csv')
    .pipe(
        parser()
    )
    .on('data', (row) => {
        films.push({name: row.Nazwa, isSerial: row.Typ, date: row['Rozpoczęto oglądanie'], rating: row.Ocena});
    })
    .on('end', async () => {
        await scrape(films);
        await currentWriter.writeRecords(films);
    });

async function scrape(films) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--window-size=1600,900"]
    });

    const page = await browser.newPage();
    await page._client.send('Emulation.clearDeviceMetricsOverride');

    const materialInput = async (selector, value) => {
        const inputElement = await page.waitForSelector(selector);
        await inputElement.focus();
        await page.type(selector, value);
    };

    let cookies;

    if (fs.existsSync('cookies.json')) {
        await page.goto("https://www.filmweb.pl");
        cookies = JSON.parse(fs.readFileSync('cookies.json').toString());
        await page.setCookie(...cookies);
    } else {
        await page.goto("https://www.filmweb.pl/login");
        await page.click('#didomi-notice-agree-button');
        await page.click('.authButton--filmweb');
        const login = JSON.parse(fs.readFileSync('login.json').toString());
        await materialInput('input[name=j_username]', login.username);
        await materialInput('input[name=j_password]', login.password);
        await page.click('.authButton--submit');
        cookies = await page.cookies();
        fs.writeFileSync("cookies.json", JSON.stringify(cookies));
    }

    for (const film of films) {
        const searchFilmLink = `https://www.filmweb.pl/search?q=${encodeURI(film.name.replace("?", ""))}`;
        await page.goto(searchFilmLink);
        const resultLink = await page.waitForSelector(".resultsList > li a");
        const href = await page.evaluate(e => e.href, resultLink);
        film.href = href;
        await page.goto(href);
        await page.waitForSelector(".iconicRate");
        const ratings = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.iconicRate a.iconicRate__icon--rated'),
                element => element.attributes['data-index'].value);
        });
        const rating = ratings.length > 0 ? ratings[ratings.length - 1] : null;
        film.rating = rating ? rating : 0;
    }

    await browser.close();
}
