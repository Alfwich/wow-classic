const _ = require('lodash');
const countdown = require('countdown');
const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const emotes = require('./emotes.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

const msInHour = 3600000;
const msgTimeout = msInHour * 12;
const endDate = new Date(Date.UTC(2019, 7, 26, 22, 0, 0));
const channelName = 'wow-classic';
const randomBackupUsers = _.map(['Glitterstorm', 'Cleaveland', 'Ragebar', 'Brostorm ', 'Cleaveage', 'Ragestarved', 'Sunderwear', 'Executie'], username => {
    return {
        username
    }
});
const fallbackUsername = 'Grommash Hellscream';

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

const pollAction = () => {
    const channelId = _.chain(bot)
        .get('channels')
        .find({
            name: channelName
        })
        .get('id')
        .value();
    const msg = getMessage();

    if (channelId && !_.isEmpty(msg)) {
        bot.sendMessage({
            to: channelId,
            message: getMessage()
        });
    }

    return !_.isEmpty(msg);
}

const startPoll = () => {
    const timeoutMs = msgTimeout + _.random(msInHour);
    setTimeout(() => {
        if (pollAction()) {
            setTimeout(startPoll, timeoutMs);
        }
    }, timeoutMs);
}
const getMessage = () => {
    const now = new Date();
    if (isToday(endDate)) {
        return ':tada: :fire: :tada: :fire: :tada: :fire: TODAY IS LAUNCH! :fire: :tada: :fire: :tada: :fire: :tada:';
    } else if (now > endDate) {
        return '';
    }

    const timerText =
        " arrives in " + countdown(now, endDate,
            countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
        ).toString() + "!";
    const randomEmote = _.sample(emotes);
    const randomUserName = _.chain(bot)
        .get('users', randomBackupUsers)
        .sample()
        .get('username', fallbackUsername)
        .value();
    const randomEmoteText = `Emote of the day:\n\`\`\`${randomEmote.command}      "${randomEmote.self}"     ${randomEmote.target.replace('{{target}}', randomUserName)}\`\`\``

    return `${timerText}\n${randomEmoteText}`;
}

const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

bot.on('ready', (e) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    pollAction();
    startPoll();
});
