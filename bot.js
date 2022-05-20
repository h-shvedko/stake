const {Telegraf} = require("telegraf");
const {spawn} = require("child_process");
const fs = require('fs');

const exec = (commands) => {
    spawn(commands, {stdio: "inherit", shell: true});
};


const bot = new Telegraf('5363170931:AAFwKQLhUj5cic2PCoerCuYRx-SYicAzOzo');
bot.telegram.getUpdates(0, 100, -1).then((updates) => {
    if(updates.length > 0){
        bot.polling.offset = updates[updates.length - 1].update_id + 1;
    }
});

let sportArtToBet, winner, match, team1, team2, player1, player2;
const sportArtSoccer = 'SOCCER';
const sportArtTennis = 'TENNIS';


const betStartButton = {
    reply_markup: {
        inline_keyboard: [
            [
                {text: "BET", callback_data: "bet-start"},
            ],
        ]
    }
};

const selectArtOfSportsButtons = {
    reply_markup: {
        inline_keyboard: [
            [
                {text: "Tennis", callback_data: "tennis-btn"},
                {text: "Soccer", callback_data: "soccer-btn"},
                {text: "Stop", callback_data: "stop-btn"}
            ],
        ]
    }
};

bot.start((ctx) => ctx.reply('Welcome to the bet365 bot! To start betting please press the button below', betStartButton));

bot.command(['help', 'HELP'], (ctx) => {
    ctx.reply("To start your bet press the button below", betStartButton);
});

bot.command(['BET', 'bet'], (ctx) => {
    ctx.reply("Where would you like to place your bet?", selectArtOfSportsButtons);
});

bot.action('bet-start', (ctx) => {
    ctx.reply("Where would you like to place your bet?", selectArtOfSportsButtons);
});

bot.action('tennis-btn', (ctx) => {
    ctx.reply('Type your tennis match like:\n /TENNIS player1 vs player2');
});

bot.action('soccer-btn', (ctx) => {
    ctx.reply('Type your soccer match like:\n /SOCCER team1 vs team2');
});

bot.action('stop-btn', (ctx) => {
    fs.writeFile('betInfo.json', '', err => {
        if (err) {
            console.error(err)
        }
        ctx.reply('Bet process is stopped. To make a new bet press button below', betStartButton);
    });
});

bot.command(['TENNIS', 'tennis'], (ctx) => {
    const commandMatch = ctx.update.message.text.replace('/TENNIS ', '').replace('/tennis ', '');
    const commands = ctx.update.message.text.replace('/TENNIS ', '').replace('/tennis ', '').split('vs');
    if (typeof commands === 'undefined' || commands.length === 0) {
        ctx.reply('Currently your tennis macht is empty. \nPlease type your tennis match like:\n /TENNIS player1 vs player2');
    }
    player1 = commands[0].trim();
    player2 = commands[1].trim();
    sportArtToBet = sportArtTennis;
    match = commandMatch;
    ctx.reply('Select your tennis match winner', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: player1, callback_data: "player1-tennis-btn"},
                    {text: player2, callback_data: "player1-tennis-btn"}
                ],
            ]
        }
    });
});

bot.action('player1-tennis-btn', (ctx) => {
    winner = player1;
    ctx.reply('You are going to place the following bet:\n ' + sportArtToBet + ' | match: '
        + match + ' | winner: ' + winner + '. \nIs it correct?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "YES", callback_data: "startBet"},
                    {text: "NO", callback_data: "stopBet"}
                ],
            ]
        }
    });
});

bot.action('player2-tennis-btn', (ctx) => {
    winner = player2;
    ctx.reply('You are going to place the following bet:\n ' + sportArtToBet + ' | match: '
        + match + ' | winner: ' + winner + '. \nIs it correct?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "YES", callback_data: "startBet"},
                    {text: "NO", callback_data: "stopBet"}
                ],
            ]
        }
    });
});

bot.command(['SOCCER', 'soccer'], (ctx) => {
    const commandMatch = ctx.update.message.text.replace('/SOCCER ', '').replace('/soccer ', '');
    const commands = ctx.update.message.text.replace('/SOCCER ', '').replace('/soccer ', '').split('vs');
    if (typeof commands === 'undefined' || commands.length === 0) {
        ctx.reply('Currently your soccer macht is empty. \nPlease type your tennis match like:\n /SOCCER player1 vs player2');
    }
    team1 = commands[0].trim();
    team2 = commands[1].trim();
    sportArtToBet = sportArtSoccer;
    match = commandMatch;
    ctx.reply('Select your soccer match winner', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: team1, callback_data: "team1-soccer-btn"},
                    {text: team2, callback_data: "team2-soccer-btn"}
                ],
            ]
        }
    });
});

bot.action('team1-soccer-btn', (ctx) => {
    winner = team1;
    ctx.reply('You are going to place the following bet:\n ' + sportArtToBet + ' | match: '
        + match + ' | winner: ' + winner + '. \nIs it correct?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "YES", callback_data: "startBet"},
                    {text: "NO", callback_data: "stopBet"}
                ],
            ]
        }
    });
});

bot.action('team2-soccer-btn', (ctx) => {
    winner = team2;
    ctx.reply('You are going to place the following bet:\n ' + sportArtToBet + ' | match: '
        + match + ' | winner: ' + winner + '. \nIs it correct?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "YES", callback_data: "startBet"},
                    {text: "NO", callback_data: "stopBet"}
                ],
            ]
        }
    });
});

bot.command('WIN', (ctx) => {
    const command = ctx.update.message.text.split(' ')[1];
    console.log(command);
    winner = command;
    ctx.reply('You are going to place the following bet:\n ' + sportArtToBet + ' | match: '
        + match + ' | winner: ' + winner + '. \nIs it correct?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "YES", callback_data: "startBet"},
                    {text: "NO", callback_data: "stopBet"}
                ],
            ]
        }
    });
});

bot.action('startBet', (ctx) => {
    const infoForJson = {
        sportArt: sportArtToBet,
        match: match,
        winner: winner
    };
    try {
        const data = JSON.stringify(infoForJson);
        fs.writeFile('betInfo.json', data, err => {
            if (err) {
                console.error(err)
                return;
            }
            console.log("protractor starting");
            exec("protractor confBet365.js");
        });
    } catch (err) {
        console.log(err);
        ctx.reply("Upps! Something went wrong! Please try again.", betStartButton);
        return false;
    }
    ctx.reply("Your bet is processing. Wait a minute.");

});
bot.action('stopBet', (ctx) => {
    ctx.reply("Where would you like to place your bet?", selectArtOfSportsButtons);
});

bot.on('text', ctx => ctx.reply('Sorry could not find any command similar to what you have typed!\n To start betting please press the button below', betStartButton));

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
