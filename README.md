# FilmWeb and Netflix integration

This project provides script for parsing Netflix watching history into single entries with data.
Additionally, there is a script for obtaining user's rating of films from history and FilmWeb portal.

## How to download watching history
1. Open a web browser.
2. Go to netflix.com.
3. Login into you account.
4. Go to account.
5. In section profiles and parental control pick a profile.
6. Select watching history.
7. Scroll down to the bottom and select download all.

You will end up with file named `NetflixViewingHistory.csv`. In order to work correctly, place it in the root of this repository.

## Parsing the viewing history
In order to just merge all series into a title, launch `parse_file.js` using node command:

```shell
node parse_file.js
```

Parsing will produce `NetflixParsedViewingHistory.csv`. It will add a column with type of entry (series/film) and rating, as 0.

## Obtaining ratings from FilmWeb
In order to obtain existing ratings on your FilmWeb account, firstly you have to create `login.json` file, that will have structure:

```json
{
  "username": "",
  "password": ""
}
```

It will provide credentials for FilmWeb login.

After that, just launch `rate_films.js` with node command:

```shell
node rate_films.js
```

The result will be a file `NetflixParsedViewingHistoryWithRatings.csv`. It will set existing film ratings and additionally provide URL to film/series on FilmWeb.
