const puppeteer = require('puppeteer');
const jsdom = require('jsdom');

async function init(link)
{    
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(link);
    await page.setViewport({
        width: 1200,
        height: 800
    });

    var songList = await scrapeYoutubePlaylist(page);
    await browser.close();

    return songList;
}

async function scrapeYoutubePlaylist( 
    page,
    scrollDelay = 2000
  ) {
    
    itemCount = await page.evaluate(async ()  => {
        const count = await document.querySelectorAll(".byline-item.style-scope.ytd-playlist-byline-renderer")[0].childNodes[0].innerHTML;
        return count;
    });

    itemCount = itemCount.replace(",", "");
    itemCount = parseInt(itemCount);
    
    const resultsSelector = "ytd-playlist-video-renderer";

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

    let songTitles = [];
    console.log("Starts the search");
    console.log(`Songs to scrap: ${itemCount}`);

    try {
        var previousSongsCount = 0;
        var redundant_iterations = 0;

        actualHeight = await page.evaluate("document.body.scrollHeight");
        while (songTitles.length < itemCount && redundant_iterations <= 3) {
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
            // console.log(`Songs scraped: ${songTitles.length}`);
            // console.log(`songTitles length: ${songTitles.length}`);
            // console.log(`previousSongsCount: ${previousSongsCount}`);
            // console.log(`redundant_iterations: ${redundant_iterations}`);
            // console.log(`-------------o--------------`);            

            await new Promise((resolve) => setTimeout(resolve, scrollDelay));
      }
    } catch(e) { console.log(e);}

    // console.log(songTitles.join('\n'));
    console.log("Scraped songs: "+ songTitles.length);

    return songTitles
}

module.exports = {
    "init": init,
    "scrapePlaylist": scrapeYoutubePlaylist
}