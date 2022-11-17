const puppeteer = require('puppeteer');
const fs = require('fs');
const jsdom = require('jsdom');

inicio();

async function inicio()
{
    var link = "https://www.youtube.com/playlist?list=PLqqrmh-jevJ3nZVUadht433c6_QcC0jTK";
    getPlaylist(link);
}

async function getPlaylist(link)
{
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const response = await page.goto(link);
        const body = await response.text();
        const { window: { document } } = new jsdom.JSDOM(body);
        
        const resultsSelector = "ytd-playlist-video-renderer";
        
        console.log("inicio a buscar canciones");
        
        let canciones = await page.evaluate(resultsSelector => {
            return [...document.querySelectorAll(resultsSelector)].map(anchor => {
                var title = anchor.textContent.split("\n");
                
                title = Array.from([...new Set(title)]);
                
                return title[8].trim();
            });
        }, resultsSelector);

        canciones = Array.from([...new Set(canciones)]);

        // Print all the files.
        console.log(canciones.join('\n'));
        console.log(canciones.length);
        
        await browser.close();
    }
    catch (error) {
        console.error(error);
    }
    console.log("Busqueda finalizada");
}