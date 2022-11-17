const puppeteer = require('puppeteer');
const fs = require('fs');
const jsdom = require('jsdom');

inicio();

function extractItems() {
      const extractedElements = document.querySelectorAll('#container > div.blog-post');
      const items = [];
      for (let element of extractedElements) {
        items.push(element.innerText);
      }
      return items;
}

async function inicio()
{
    var link = "https://www.youtube.com/playlist?list=PLqqrmh-jevJ3nZVUadht433c6_QcC0jTK";
    // getPlaylist(link);
    (async () => {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto(link);
        await page.setViewport({
            width: 1200,
            height: 800
        });

        const delay = 3000;
        const wait = (ms) => new Promise(res => setTimeout(res, ms));
        const count = async () => document.querySelectorAll('#contents')[2].length;
        const scrollDown = async () => {

        document.querySelectorAll('#contents')[2].lastChild
            .scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
        }
    
        let preCount = 0;
        let postCount = 0;
        do {
            preCount = await count();
            await scrollDown();
            await wait(delay);
            postCount = await count();
        } while (postCount > preCount);
        await wait(delay);

        let canciones = [];

    
        await browser.close();
    })()
    /* (async () => {
        const browser = await puppeteer.launch({
          headless: false,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 926 });
      
        // Navigate to the example page.
        await page.goto('https://mmeurer00.github.io/infinite-scroll-example/');
      
        // Auto-scroll and extract desired items from the page. Currently set to extract ten items.
        // const items = await scrapeItems(page, extractItems, 4);
        items = await page.evaluate('Blog Post #1',
        'dolorem dolore est ipsam',
        'dignissimos aperiam dolorem qui eum facilis quibusdam animi sint suscipit qui sint possimus cum quaerat magni maiores excepturi ipsam ut commodi dolor voluptatum modi aut vitae',
        'Giray Tüzün');
        console.log(items);
      
        // Save extracted items to a new file.
        // fs.writeFileSync('./items.txt', items.join('\n') + '\n');
      
        // Close the browser.
        await browser.close();
      })(); */

    /* (async () => {
        const browser = await puppeteer.launch({
          headless: false,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 926 });
      
        await page.goto(link);
      
        const items = await scrapeItems(page, scrappingTest, 200);
        
        console.log(items);

        fs.writeFileSync('./items.txt', items.join('\n') + '\n');
      
        await browser.close();
      })(); */
}

async function autoScroll(page){
    const delay = 3000;
    const wait = (ms) => new Promise(res => setTimeout(res, ms));
    const count = async () => document.querySelectorAll('#video-title').length;
    const scrollDown = async () => {
    document.querySelector('#video-title:last-child')
        .scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }

    let preCount = 0;
    let postCount = 0;
    do {
        preCount = await count();
        await scrollDown();
        await wait(delay);
        postCount = await count();
    } while (postCount > preCount);
    await wait(delay);
}

async function scrappingTest(document) {
    const resultsSelector = '#video-title';

    const extractedElements = document.querySelectorAll(resultsSelector);
    const items = [];
    for (let element of extractedElements) {
      items.push(element.innerText);
    }
    return items;
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
        // console.log(canciones.join('\n'));
        console.log(canciones.length);

        
        await browser.close();
    }
    catch (error) {
        console.error(error);
    }
    console.log("Busqueda finalizada");
}

async function scrapeItems(
    page,
    extractItems,
    itemCount,
    scrollDelay = 800,
  ) {
    let items = [];
    try {
        while (items.length < itemCount) {
            items = await page.evaluate(extractItems);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitForTimeout(scrollDelay);
      }
    } catch(e) { }
    return items;
  }