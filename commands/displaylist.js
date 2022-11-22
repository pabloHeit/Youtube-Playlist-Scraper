const { SlashCommandBuilder } = require('discord.js');
const playlist = require("../playlist")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('displaylist')
		.setDescription('Display a youtube playlist'),
	async execute(interaction) {
		await interaction.reply("Wait until charge...");
        listSong = await playlist.init("https://www.youtube.com/playlist?list=PLqqrmh-jevJ3nZVUadht433c6_QcC0jTK");
        return listSong;
	},
};