# Chat Extinction  

## Commands  

### Ping  
Description: Responds with "Pong!"  

### Purge  
Description: Deletes old messages. Starts by taking 1 starting message and finding a number of messages sent before the starting message and deletes them.  

Inputs:  
1. `discord-id` - The ID of the user who sent the messages to delete. Obtained by right-clicking a user and selecting `Copy ID`. Requires Discord's Developer Mode.  
2. `message-link` - The link to the starting message. Will not be deleted. Obtained by right-clicking a message and selecting `Copy Message Link`.  
3. `number-messages` - The number of messages to delete. Must be a number from 1 to 500.  
