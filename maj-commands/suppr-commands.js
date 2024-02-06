const { REST, Routes } = require('discord.js');
const { bot, serv_antre } = require('../config.json');

const rest = new REST().setToken(bot.token);

// ...

// for guild-based commands
rest.put(Routes.applicationGuildCommands(bot.clientId, serv_antre.guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(bot.clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);