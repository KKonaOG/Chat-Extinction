const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.setDefaultMemberPermissions(294205270016),
	async execute(client, interaction) {
		await interaction.reply('Pong!');
	},
};
