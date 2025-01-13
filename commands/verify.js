const { SlashCommandBuilder } = require("discord.js");
const { NodeSSH } = require("node-ssh");
const fetch = require("node-fetch");
const { ssh } = require("../config.json");
const fs = require("fs");

function formatUUID(uuid) {
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(
    12,
    16
  )}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify and whitelist a Minecraft username")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Your Minecraft username")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const mcUsername = interaction.options.getString("username");

    try {
      const response = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${mcUsername}`
      );
      if (!response.ok) {
        return await interaction.editReply("Invalid Minecraft username!");
      }
      const playerData = await response.json();
      const formattedUUID = formatUUID(playerData.id);

      let usersData = { users: [] };
      if (fs.existsSync("./users.json")) {
        usersData = JSON.parse(fs.readFileSync("./users.json", "utf8"));
      }

      if (
        usersData.users.some(
          (user) =>
            user.discordId === interaction.user.id ||
            user.uuid === formattedUUID
        )
      ) {
        return await interaction.editReply(
          "You or this Minecraft account is already verified!"
        );
      }

      const userData = {
        discordId: interaction.user.id,
        mcUsername: playerData.name,
        uuid: formattedUUID,
        verifiedAt: new Date().toISOString(),
      };
      usersData.users.push(userData);

      fs.writeFileSync("./users.json", JSON.stringify(usersData, null, 2));

      const sshClient = new NodeSSH();
      await sshClient.connect(ssh);

      await sshClient.execCommand(
        `tmux send-keys -t minecraft "whitelist add ${playerData.name}" Enter`
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await sshClient.dispose();
      await interaction.editReply(
        `Successfully verified and whitelisted ${playerData.name}!`
      );
    } catch (error) {
      console.error("Error:", error);
      await interaction.editReply(
        "An error occurred while processing your request."
      );
    }
  },
};
