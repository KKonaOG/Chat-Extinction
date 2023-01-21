const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription("Clears a user's chat messages using Discord ID, message link, and number")
		.addStringOption(option =>
			option.setName('discord-id')
				.setDescription("The user's Discord ID")
				.setRequired(true))
		.addStringOption(option =>
			option.setName('message-link')
				.setDescription("The message to start at (provide by link)")
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('number-messages')
				.setDescription("The number of messages to delete (1 to 500)")
				.setRequired(true))
		// sets permissions required to use command
		// includes perms: 
		// 		Send Messages, Send Messages in Threads, Manage Messages, Manage Threads, Use Slash Commands
		.setDefaultMemberPermissions(294205270016),
	async execute(client, interaction) {
		await interaction.deferReply({ content: 'Command received...', ephemeral: false });

		// Parse Parameters (they are required so they will always exist, no undefined checks needed)
		const userId = await interaction.options.getString("discord-id");
		const messageLink = await interaction.options.getString("message-link");
		var numberMessages = await interaction.options.getInteger("number-messages");

		if (numberMessages > 500 || numberMessages <= 0) {
			await interaction.editReply("Supplied number of messages is invalid!");
			return;
		}

		// Validate provided Discord ID (Discord Returns API Error on Unknown User)
		try {
			var user = await client.users.fetch(userId);
		} catch (e) {
			// Would typically be "instanceof" but it wasn't liking that
			if (e.name == "DiscordAPIError[10013]") {
				var user = undefined;
			} else {
				// Worse case it throws the error out into stdout for logging (does not crash bot)
				throw (e);
			}
		}

		// Fail Out (Cleanly) if User can't be found
		if (user == undefined) {
			await interaction.editReply("Supplied Discord ID is not associated with a Discord Account!");
			return;
		}

		// Validate provided Discord Message ID
		// Example Format: https://discord.com/channels/1039346197774729308/1039471113387913216/1052440268382674987
		// Regex: https:\/\/discord.com\/channels\/(\d+)\/(\d+)\/(\d+)
		// Expect (Exactly): https://discord.com/channels/
		// Expect Unspecfied Number of Integers followed by / (Group 1 - Guild ID) --> linkData[1]
		// Expect Unspecfied Number of Integers followed by / (Group 2 - Channel ID) --> linkData[2]
		// Expect Unspecfied Number of Integers followed by / (Group 3 - Message ID) --> linkData[3]

		// We want them to provide this link so we can derive channel ID and message ID simutaneously :)
		const regExpression = /https:\/\/discord.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
		const linkData = messageLink.match(regExpression);

		// Fail Out (Cleanly) if provided link cannot be parsed.
		if (linkData == null) {
			await interaction.editReply("Supplied Message Link is invalid/ill-formatted!")
			return;
		}

		// Just for "Documentation" purpose, I have pulled out the various data points
		const guildId = linkData[1]
		const channelId = linkData[2]
		const messageId = linkData[3]

		// Verify Bot has access to the specified Guild (Server) that the message is in.
		const botGuilds = await client.guilds.fetch();
		if (!botGuilds.has(guildId)) {
			await interaction.editReply("Supplied Message Link is for an inaccessible guild!")
			return;
		}

		// Validate provided Channel ID (Discord Returns API Error on Unknown Channel)
		try {
			var channel = await client.channels.fetch(channelId);
		} catch (e) {
			// Would typically be "instanceof" but it wasn't liking that
			if (e.name == "DiscordAPIError[10003]") {
				var channel = undefined;
			} else {
				// Worse case it throws the error out into stdout for logging (does not crash bot)
				throw (e);
			}
		}

		// Fail Out (Cleanly) if Channel can't be found
		if (channel == undefined) {
			await interaction.editReply("Supplied Channel ID is not associated with an actual channel!");
			return;
		}

		// Verify Message Exists
        var messageArray = await channel.messages.fetch({ before: messageId, limit: 100})
		var emptyLoopCount = 0;
        while (messageArray.Length != 500) {
            var tempArrayLength = messageArray.Length; // saves length of messageArray before appending to it
            var lastMessageID = messageArray[messageArray.Length - 1].id; // saves ID of the last message
            messageArray.append(await channel.messages.fetch({ before: lastMessageID, limit: 100}));

          	// With some check to make sure that we haven't reached the end of messages in order to avoid infinite loop
          	if (messageArray.Length == tempArrayLength) {
				emptyLoopCount++; // increments if messageArray's length doesn't increase
                if (emptyLoopCount > 5) { // breaks if 5 loops haven't increased messageArray length
					break;
				}
            }
			else {
				emptyLoopCount = 0; // resets to 0 if messageArray's length increased
			}
        }

		var filteredMessages = messageArray.filter(message => (message.author.id == userId));

		// var attemptMessage = "Attempting to delete " + numberMessages + " message(s)...";

		// await interaction.editReply(attemptMessage);

		var attemptMessageLength = "Now deleting " + messageArray.Length + "message(s)...";

		await interaction.editReply(attemptMessageLength);

		var messagesDeleted = 0;

		for (i = 0; i < Math.min(numberMessages, filteredMessages.size); i++) {
			// Delete somewhere in here
			filteredMessages.at(i).delete();
			messagesDeleted++;
		}

		if (messagesDeleted <= 0) {
			var successMessage = "Error: No messages deleted.";
		} else {
			var successMessage = "Successfully deleted " + messagesDeleted + " message(s).";
		}
		
		await interaction.followUp(successMessage);

		/* TODO:
			- Security (Permissions) - DONE
			- Follow-Up Response (I think thats what its called, pretty much tell Discord we will reply later) - DONE
			- Message says how many deleted (maybe even says where the next message is?) - DONE
		*/
		// await interaction.reply('Pong!');
	},
};
