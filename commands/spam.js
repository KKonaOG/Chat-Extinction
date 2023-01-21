const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spam')
		.setDescription('Spams chat with user-input number of messages.')
        .addIntegerOption(option =>
			option.setName('number')
				.setDescription("The number of messages to spam (1 to 450)")
				.setRequired(true))
		.setDefaultMemberPermissions(294205270016),
	async execute(client, interaction) {
        await interaction.reply("Command Received!");

        var numberMessages = await interaction.options.getInteger("number");

		if (numberMessages > 450 || numberMessages <= 0) {
			await interaction.editReply("Supplied number of messages is invalid!");
			return;
        }

        for (i = 0; i < numberMessages; i++)
        {
            var spamMessage = "spam message #" + i;
            await interaction.followUp(spamMessage);
        }
	},
};
