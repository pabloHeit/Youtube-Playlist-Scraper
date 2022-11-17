require('dotenv').config();
var fetch = require('node-fetch');
const Discord = require('discord.js');
var logger = require('winston');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');
var champions_positionTable ='';
const fs = require("fs"),
    champions_positionTable_src = "champPosition.CSV";

fs.readFile(champions_positionTable_src, 'utf8', (error, datos) => {
    if (error) throw error;
    const split = datos.split('\n');
    champions_positionTable = split.map(function(x) {
        return x.split(',');
    });
});

var client = new Discord.Client();
let version = checkVersionOfLol();

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


const api_header ='https://la2.api.riotgames.com'; 
const api_key = "RGAPI-f2e13b5b-ede3-49e7-a457-d7f787a9f41a";


client.on('ready', () => {
    logger.info('Logged in as ' + client.user.tag);
    enviarMensajeDePrueba();
});

async function enviarMensajeDePrueba()
{
    const channel = await client.channels.fetch('468488047923691523');
    channel.send("$c help");
}

client.on('message', async (message) => {
    
    if (message.content.substring(0, 2) === "$c") { // C de (C)lash rivals
        const channel = await client.channels.fetch(message.channel.id);

        let finComando = message.content.indexOf(" ", 3);
        let comandoIngresado = "";
        let argumento = "";

        if (finComando == -1) {
            comandoIngresado = message.content.substring(2).replace(" ","");
        }
        else {
            comandoIngresado = message.content.substring(2, finComando).replace(" ","");
            argumento = message.content.substring(finComando + 1);
        }

        console.log("caracter vacio: " + finComando);
        console.log("Comando: " + comandoIngresado);
        console.log("Argumento: " + argumento);

        
        switch (comandoIngresado.toLowerCase()) {
            case "help":
                commandsSummary(message);
                break;

            case "userimage":
                userSumaryWithCanvas(argumento, channel);
                break;
            case "ui":
                userSumaryWithCanvas(argumento, channel);
                break;

            case "usertext":
                printUserSumary(argumento, channel);
                break;
            case "ut":
                printUserSumary(argumento, channel);
                break;

            case "clashtext":
                printClashTeam(argumento, channel);
                break;
            case "ct":
                printClashTeam(argumento, channel);
                break;

            case "clashimage":
                printClashTeam(argumento, channel);
                break;
            case "ci":
                printClashTeam(argumento, channel);
                break;
                default:
                channel.send("Comando desconocido, escriba $c help para ver");
                break;
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

const commandsSummary = async(message) => {
    mensaje = 
    "\n"+
    "clashText: Muestra los campeones del equipo enemigo y sus roles en un clash.\n"+
    "userText: Muestra toda la información del invocador ingresado.\n"+
    // "\n"+
    // "\n"+
    // "\n"+
    // "\n"+
    // "\n"+
    // "\n"+
    // "\n"+
    // "\n"+
    ""    
    ;
    message.reply(mensaje);
}

const callApi = async(query) => {
    let url = api_header + query + '?api_key=' + api_key;
    logger.info(url);

    let response = await fetch(url);
    response = await response.json();

    try {
        if (response.status.status_code == '403') {
            console.log('La key de riot expiro');
            return;
        }

    } catch (error) {}
    
    return response;
}

async function checkVersionOfLol() {
    let response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    let info = await response.json()   
    let version = await info[0];
    return version;
}

const printClashTeam = async(username, message) => {
    const channel = await client.channels.fetch(message.channel.id);
    let users = await clashTeam(username);

    if (users == 'error_3')
        return channel.send('Error: El usuario "' + username + '" no está participando en ningún equipo de Clash');
    if (users == 'error_2')
        return channel.send('Error');

    let top = '';
    let jg  = '';
    let mid = '';
    let adc = '';
    let sup = '';
    
    for (let i = 0; i < users.length; i++) {
        switch (users[i].position) {
            case 'TOP':
                users[i].champs.forEach(element => {
                    top += element.pos.includes('Top') ? element.name + ', ' : '';                   
                });
            break;
            case 'JUNGLE':
                users[i].champs.forEach(element => {
                    jg  += element.pos.includes('Jungler') ? element.name + ', ' : '';
                });
            break;
            case 'MIDDLE':
                users[i].champs.forEach(element => {
                    mid += element.pos.includes('Mid') ? element.name + ', ' : '';
                });
            break;
            case 'ADC':
                users[i].champs.forEach(element => {
                    adc += element.pos.includes('ADCarry') ? element.name + ', ' : '';
                });
            break;
            case 'UTILITY':
                users[i].champs.forEach(element => {
                    sup += element.pos.includes('Support') ? element.name + ', ' : '';
                });
            break; 
        }
    }

    channel.send(
        '\ntop: \n'   + top +
        '\n\njg: \n'  + jg  +
        '\n\nmid: \n' + mid +
        '\n\nadc: \n' + adc +
        '\n\nsup: \n' + sup
    );
}

const clashTeam = async(username) => {
    const players = [];
    let account = await callApi('/lol/summoner/v4/summoners/by-name/' + username);
    account = await callApi('/lol/clash/v1/players/by-summoner/' + await account.id);
    
    if (account.length === 0)
        return 'error_3';
    if (account.status.status_code != 403)
        team = await callApi('/lol/clash/v1/teams/' + await account[0].teamId);
    else
        return 'error_2';


    for (let i = 0; i < await team.players.length; i++) {
        sumInfo = await callApi('/lol/summoner/v4/summoners/' + await team.players[i].summonerId);
        summoner = await userSumary(sumInfo.name);
        summoner.position = await team.players[i].position;
        players.push(summoner);
    }

    return players;
}

const userSumary = async(username) => {
    const account = await callApi('/lol/summoner/v4/summoners/by-name/' + username);
    if (await account.id == null) {
        // message.reply('El usuario'+username+' no existe\nPor favor, ingrese nuevamente');
        return "error 1";
    }

    let user = {
        username: username,
        id : await account.id,
        rank : await rankTier(account.id),
        champs : await playerMasteries(account.id)
    }
    
    return user;
}

const printUserSumary = async(username, message) => {
    
    const channel = await client.channels.fetch(message.channel.id);
    let user = await userSumary(username);
    
    let champsTop = "";
    let champsJungler = "";
    let champsMid = "";
    let champsADCarry = "";
    let champsSupport = "";

    user.champs.forEach(element => {
        champsTop += element.pos.includes('Top') ? element.name + ', ' : '';
        champsJungler += element.pos.includes('Jungler') ? element.name + ', ' : '';
        champsMid += element.pos.includes('Mid') ? element.name + ', ' : '';
        champsADCarry += element.pos.includes('ADCarry') ? element.name + ', ' : '';
        champsSupport += element.pos.includes('Support') ? element.name + ', ' : '';
    });

    channel.send(
        user.username +
        "\nSolo Queue: " + user.rank.sq.text +
        "\nFlexible: " + user.rank.fx.text +
        "\nChamps \n Top: " + champsTop +
        "\nJg: " + champsJungler +
        "\nMid: " + champsMid +
        "\nADC: " + champsADCarry +
        "\nSup: " + champsSupport
        );
}

const userSumaryWithCanvas = async(username, message) => {
    // const channel = client.channels.fetch(message.channel.id);
    
    userCanvas(message, await userSumary(username));
}

const rankTier = async(id) => {
    const ranks = await callApi('/lol/league/v4/entries/by-summoner/' + id);

    let rank = {sq:{text:'',img:''},fx:{text:'',img:''}};

    for (let i = 0; i < ranks.length; i++) {
        if (ranks[i].queueType == "RANKED_SOLO_5x5") {
            rank.sq.text = ranks[i].tier +' '+ ranks[i].rank ;
            rank.sq.img = 'img/emblems/'+ ranks[i].tier + '.png';
        }
        else if(ranks[i].queueType == "RANKED_FLEX_SR") {
            rank.fx.text = ranks[i].tier +' '+ ranks[i].rank;
            rank.fx.img = 'img/emblems/'+ ranks[i].tier + '.png';
        }
    }
    return rank;
}

const playerMasteries = async(id) => {
    let champs = [];
    let player = await callApi('/lol/champion-mastery/v4/champion-masteries/by-summoner/'+ id);
    if (player == '') {
        return null;        
    }

    for (let i = 0; i < 10; i++) {
        
        let champ = await getChampInfo(player[i].championId);

        champs.push ( {
            name: await champ[0],
            masteryPoints: numberWithCommas( await player[i].championPoints),
            lastPlayTime: formatDate(player[i].lastPlayTime),
            img: await champ[1],
            pos: champ[2]
        } );
    }
    return champs;
}

const userCanvas = async(message, user) => {
    const canvas = Canvas.createCanvas(1200, 1200);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage('./img/background.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    let xPosition = 0;
    
    const positionIndex = 1.25

    const nombrePosition = 0.10 / positionIndex;

    const rankedPosition = 0.25 / positionIndex;
    const maestriasPosition = 0.65 / positionIndex;
    
    let yPosition = canvas.height * nombrePosition;
    context.font = '60 px sans-serif';
    context.fillStyle = '#ffffff'; 
    context.fillText(user.username, xPosition, yPosition);

    let soloq_Xposition = canvas.width / 6;
    let flex_Xposition = canvas.width / 2 + soloq_Xposition;

    yPosition = canvas.height * rankedPosition;    
    context.fillText('Solo queue', soloq_Xposition, yPosition);
    let imgSize = context.measureText('Solo queue').width * 0.75;
    context.fillText('Flex', flex_Xposition, yPosition);

    yPosition = canvas.height * rankedPosition;
    avatar = await Canvas.loadImage(user.rank.sq.img);
    context.drawImage(avatar, soloq_Xposition+context.measureText('Solo queue').width/4, yPosition, imgSize, imgSize);
    
    avatar = await Canvas.loadImage(user.rank.fx.img);
    context.drawImage(avatar, flex_Xposition, yPosition, imgSize, imgSize);

    yPosition = canvas.height * rankedPosition + imgSize + 25;
    context.fillText(user.rank.sq.text, soloq_Xposition, yPosition);

    context.fillText(user.rank.fx.text, flex_Xposition, yPosition);
    
    imgSize = canvas.width / user.champs.length;
    xPosition = 0;
    
    for (let i = 0; i < user.champs.length; i++) {
        context.font = applyText(canvas, user.champs[i].masteryPoints, imgSize);
        context.fillText(user.champs[i].masteryPoints, xPosition + imgSize , yPosition + imgSize/2);
        let { body } = await request(user.champs[i].img);
        avatar = await Canvas.loadImage(await body.arrayBuffer());
        context.drawImage(avatar, xPosition, yPosition, imgSize, imgSize);
        // xPosition += canvas.width / user.champs.length;
        yPosition += imgSize;
    }

    const image = new Discord.MessageAttachment(await canvas.encode('png'), { name: 'background-image.png' });
    message.reply({ files: [image.attachment] });
}

const getChampInfo = async(id) => {
    
    let response = await fetch('http://ddragon.leagueoflegends.com/cdn/' + await version + '/data/de_DE/champion.json');
    let list = await response.json();
    let championList = list.data;
    
    let champInfo = [];
    
    for (var i in championList) {
        if (championList[i].key == id) {
            champInfo[0] = championList[i].id;
            champInfo[1] = 'https://ddragon.leagueoflegends.com/cdn/'+ await version + '/img/champion/' + championList[i].image.full;
            champInfo[2] = [];

            pos = champions_positionTable.find(element => element[0] ==  id);

            if (pos[2] == 'true')
                champInfo[2].push('Top');
            if (pos[3] == 'true')
                champInfo[2].push('Jungler');
            if (pos[4] == 'true')
                champInfo[2].push('Mid');
            if (pos[5] == 'true') 
                champInfo[2].push('ADCarry');
            if (pos[6] == 'true') 
                champInfo[2].push('Support');
            return champInfo;
        }
    }
}

const applyText = async(canvas, text, containerSize) => {
    const context = canvas.getContext('2d');
    let fontSize = 0;
    do {
        context.font = `${fontSize += 1}px sans-serif`;
    } while (context.measureText(text).width < containerSize );

    return context.font;
}

const formatDate = (timestamp) => {
    var date_not_formatted = new Date(timestamp);
    
    var formatted_string = date_not_formatted.getFullYear() + "-";

    if (date_not_formatted.getMonth() < 9) {
        formatted_string += "0";
    }
    formatted_string += (date_not_formatted.getMonth() + 1);
    formatted_string += "-";

    if(date_not_formatted.getDate() < 10) {
        formatted_string += "0";
    }
    formatted_string += date_not_formatted.getDate();

    return formatted_string;
}

const numberWithCommas = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}