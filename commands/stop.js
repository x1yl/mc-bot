const { SlashCommandBuilder } = require("discord.js");
const { NodeSSH } = require("node-ssh");
const { ssh, staffRole } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Safely stop the Minecraft server (Staff only)"),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(staffRole)) {
      return interaction.reply({
        content: "You do not have permission to use this command!",
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const sshClient = new NodeSSH();

    try {
      await sshClient.connect(ssh);

      await sshClient.execCommand('tmux send-keys -t minecraft "stop" Enter');

      await new Promise((resolve) => setTimeout(resolve, 5000));

      await sshClient.execCommand("tmux kill-session -t minecraft");

      await sshClient.dispose();
      await interaction.editReply("Minecraft server has been stopped.");
    } catch (error) {
      console.error("SSH error:", error);
      await interaction.editReply("Failed to stop the server!");
    }
  },
};
