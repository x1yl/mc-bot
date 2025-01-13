const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const { staffRole } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listuser")
    .setDescription("List all verified users (Staff only)"),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(staffRole)) {
      return interaction.reply({
        content: "You do not have permission to use this command!",
        ephemeral: true,
      });
    }

    try {
      const usersData = JSON.parse(fs.readFileSync("./users.json", "utf8"));

      if (usersData.users.length === 0) {
        return interaction.reply({
          content: "No verified users found!",
          ephemeral: true,
        });
      }

      const userList = usersData.users.map(
        (user) =>
          `Discord: <@${user.discordId}> - Minecraft: ${user.mcUsername}`
      );

      await interaction.reply({
        content: "Verified Users:\n" + userList.join("\n"),
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error:", error);
      await interaction.reply({
        content: "Error reading users data!",
        ephemeral: true,
      });
    }
  },
};
