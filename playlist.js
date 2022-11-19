const puppeteer = require('puppeteer');
const fs = require('fs');
const jsdom = require('jsdom');

inicio();

async function inicio()
{
    var link = "https://www.youtube.com/playlist?list=PLqqrmh-jevJ3nZVUadht433c6_QcC0jTK";
    
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(link);
    await page.setViewport({
        width: 1200,
        height: 800
    });
    const response = await page.goto(link);
    const body = await response.text();
    const { window: { document } } = new jsdom.JSDOM(body);

    await scrapePlaylist(page, 1400);
    await browser.close();
}

const scrapSongs = async () => {
    songTitles = await page.evaluate(resultsSelector => {
        return [...document.querySelectorAll(resultsSelector)].map(anchor => {
            var title = anchor.textContent.split("\n");
            
            title = Array.from([...new Set(title)]);
            
            return title[8].trim();
        });
    }, resultsSelector);
    songTitles = Array.from([...new Set(songTitles)]);

    return songTitles
};

async function scrapePlaylist( 
    page,
    itemCount,
    scrollDelay = 2000,
  ) {
    const resultsSelector = "ytd-playlist-video-renderer";

    let songTitles = [];
    console.log("Inicia busqueda");

    try {
        var previousSongsCount = 0;
        var redundant_iterations = 0;

        actualHeight = await page.evaluate("document.body.scrollHeight");
        while (songTitles.length < itemCount && redundant_iterations <= 5) {
            actualHeight += 10000;
            songTitles = await scrapSongs();
            await page.evaluate(`window.scrollTo(0, ${actualHeight})`);

            if (previousSongsCount == songTitles.length) {
                redundant_iterations++;
            }
            else {
                previousSongsCount = songTitles.length;
                redundant_iterations = 0;
            }
            console.log(`Songs scraped: ${songTitles.length}`);
            // console.log(`songTitles length: ${songTitles.length}`);
            // console.log(`previousSongsCount: ${previousSongsCount}`);
            // console.log(`redundant_iterations: ${redundant_iterations}`);
            // console.log(`-------------o--------------`);            

            await new Promise((resolve) => setTimeout(resolve, scrollDelay));
      }
    } catch(e) { console.log(e);}

    console.log(songTitles.join('\n'));
    console.log(songTitles.length);

    return songTitles
  }