const { SlashCommandBuilder } = require('discord.js');
const playlist = require("../playlist")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('displaylist')
		.setDescription('Display a youtube playlist')
		.addStringOption(option =>
			option.setName('link')
				.setDescription('The youtube playlist link')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('prefix')
				.setDescription('Prefix to play the list on a bot')),
	async execute(interaction) {
		
		const prefix = interaction.options.getString('prefix') ?? ' ';
		const link = interaction.options.getString('link');
				
        /* wellDoneLink = await playlist.checkLink(link);
		if (!wellDoneLink) {
			return interaction.reply("Error, wrong link");
		} */
		await interaction.reply("Wait until charge (can delay a minute or more)");

        listSong = await playlist.init(link);
        return listSong;
	},
};