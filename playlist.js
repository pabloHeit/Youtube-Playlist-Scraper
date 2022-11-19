const puppeteer = require('puppeteer');
const fs = require('fs');
const jsdom = require('jsdom');

inicio();

async function inicio()
{
    var link = "https://www.youtube.com/playlist?list=PLqqrmh-jevJ3nZVUadht433c6_QcC0jTK";
    // getPlaylist(link);
    // scrollearAbajo(link);
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

    await scrapeItems(page);
    await browser.close();
}

async function scrollearAbajo(link)
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
    const response = await page.goto(link);
    const body = await response.text();
    const { window: { document } } = new jsdom.JSDOM(body);
    
    const delay = 5000;
    const wait = (ms) => new Promise(res => setTimeout(res, ms));

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

    console.log(canciones.join('\n'));
    console.log(canciones.length);
    
    // const count = async () => document.querySelectorAll('#contents')[2].childElementCount - 1;;
    // const scrollDown = async () => {
    //     document.querySelectorAll('#contents')[2].lastChild
    //         .scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    //     }

    // let preCount = 0;
    // let postCount = 0;
    // do {
    //     preCount = await count();
    //     await scrollDown();
    //     console.log("im still waiting!!");
    //     await wait(delay);
    //     postCount = await count();
    // } while (postCount > preCount);
    // await wait(delay);
    console.log("Llegue al fondo");
    await browser.close();
    console.log('^C');
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
        console.log("Busqueda finalizada");
    }
    catch (error) {
        console.error(error);
    }
}

async function scrapeItems(page/* 
    page,
    extractItems,
    itemCount,
    scrollDelay = 800, */
  ) {   
    const delay = 1000;
    const wait = (ms) => new Promise(res => setTimeout(res, ms));
    
    const resultsSelector = "ytd-playlist-video-renderer";
    const scrapSongs = async () => {
        canciones = await page.evaluate(resultsSelector => {
            return [...document.querySelectorAll(resultsSelector)].map(anchor => {
                var title = anchor.textContent.split("\n");
                
                title = Array.from([...new Set(title)]);
                
                return title[8].trim();
            });
        }, resultsSelector);
        canciones = Array.from([...new Set(canciones)]);

        return canciones
    };

    let canciones = [];
    console.log("Inicia busqueda");
    try {
        var cantCancionesAnterior = 0;
        var cantIteracionesIguales = 0;

        previousHeight = await page.evaluate("document.body.scrollHeight");
        while (canciones.length < 1400 && cantIteracionesIguales <= 5) {
            previousHeight += 10000
            canciones = await scrapSongs();
            await page.evaluate(`window.scrollTo(0, ${previousHeight})`);

            if (cantCancionesAnterior == canciones.length) {
                cantIteracionesIguales++;
            }
            else {
                cantCancionesAnterior = canciones.length;
                cantIteracionesIguales = 0;
            }
            // console.log(`canciones length: ${canciones.length}`);
            // console.log(`cantCancionesAnterior: ${cantCancionesAnterior}`);
            // console.log(`cantIteracionesIguales: ${cantIteracionesIguales}`);
            // console.log(`-------------o--------------`);            

            await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch(e) { console.log(e);}

    console.log(canciones.join('\n'));
    console.log(canciones.length);
    console.log('^C');
  }