const { Events } = require('discord.js');
const bot = require('../bot');

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			if (interaction.commandName == "displaylist") {
				const channel = await bot.client.channels.fetch(interaction.channelId);
				listSongs = await command.execute(interaction);
				const prefix = interaction.options.getString('prefix') ?? '';

				channel.send("Epic spam in 3...");
				await sleep(1000);
				channel.send("2..");
				await sleep(1000);
				channel.send("1.");
				channel.send("------------");


				for (let i = 0; i < listSongs.length; i++) {
					await sleep(1000);
					channel.send(`${prefix} ${listSongs[i]}`);
				}
			}
			else{
				await command.execute(interaction);
			}
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};

