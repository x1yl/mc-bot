# Minecraft Server Discord Bot

A Discord bot for managing a Minecraft server through Discord with SSH integration. Control your Minecraft server, manage whitelist, and view console output directly from Discord.

## Features

- **Server Management**
  - `/start` - Start the Minecraft server
  - `/stop` - Safely stop the server (Staff only)
  - `/console` - View console or send commands (Staff only)

- **Whitelist Management**
  - `/verify <username>` - Verify and whitelist Minecraft accounts
  - `/listuser` - List all verified users (Staff only)

## Setup

1. **Prerequisites**
   - Node.js 16.9.0 or higher
   - Yarn package manager
   - A Discord bot token
   - SSH access to your Minecraft server
   - tmux installed on the Minecraft server

2. **Installation**
   ```bash
   git clone <repository-url>
   cd mc-bot
   yarn install
   ```

3. **Configuration**
   Create a `config.json` file:
   ```json
   {
     "token": "YOUR_DISCORD_BOT_TOKEN",
     "clientId": "YOUR_BOT_CLIENT_ID",
     "guildId": "YOUR_DISCORD_SERVER_ID",
     "ssh": {
       "host": "YOUR_MC_SERVER_IP",
       "username": "YOUR_SSH_USERNAME",
       "privateKey": "YOUR_SSH_PRIVATE_KEY"
     },
     "staffRole": "STAFF_ROLE_ID"
   }
   ```

4. **Deploy Commands**
   ```bash
   node deploy-commands.js
   ```

5. **Start the Bot**
   ```bash
   yarn start
   ```

## Usage

### Staff Commands
- `/start` - Start the Minecraft server if it's not running
- `/stop` - Safely stop the server
- `/console` - View console output
- `/console <command>` - Send commands to the server
- `/listuser` - View all verified users

### User Commands
- `/verify <username>` - Link Minecraft account to Discord and whitelist

## Development

Run the bot in development mode with auto-restart:
