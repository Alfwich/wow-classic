const _ = require('lodash');
const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const countdown = require('countdown');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

const msInHour = 3600000;
const msgTimeout = msInHour * 12;
const endDate = new Date(Date.UTC(2019, 7, 26, 22, 0, 0));

const pollAction = () => {
    const channel = _.find(bot.channels, {
        name: 'wow-classic'
    });

    if (channel) {
        bot.sendMessage({
            to: _.get(channel, 'id'),
            message: " in " + countdown(
                new Date(),
                endDate,
                countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
            ).toString()
        });
    }
}

const startPoll = () => {
    setTimeout(() => {
        pollAction();
        setTimeout(startPoll, msgTimeout);
    }, msgTimeout);
}

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', (e) => {

    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    pollAction();
    startPoll();

});
