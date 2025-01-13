const { REST, Routes } = require("discord.js");
const { token, clientId, guildId } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const rest = new REST({ version: "10" }).setToken(token);

async function deleteGuildCommands() {
  try {
    console.log("Started deleting guild (/) commands.");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [],
    });
    console.log("Successfully deleted all guild (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

async function deleteGlobalCommands() {
  try {
    console.log("Started deleting global (/) commands.");
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log("Successfully deleted all global (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

async function deployCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  try {
    console.log("Started refreshing application (/) commands for guild.");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands for guild.");
  } catch (error) {
    console.error(error);
  }
}

const args = process.argv.slice(2);
if (args.length > 0) {
  switch (args[0]) {
    case "delete-guild":
      deleteGuildCommands();
      break;
    case "delete-global":
      deleteGlobalCommands();
      break;
    default:
      console.log(
        "Unknown command. Available commands: delete-guild, delete-global"
      );
  }
} else {
  deployCommands();
}
