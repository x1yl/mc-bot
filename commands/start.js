const { SlashCommandBuilder } = require("discord.js");
const { NodeSSH } = require("node-ssh");
const { ssh } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start the Minecraft server"),
  async execute(interaction) {
    await interaction.deferReply();

    const sshClient = new NodeSSH();

    try {
      await sshClient.connect(ssh);

      const { stdout: sessions } = await sshClient.execCommand(
        'tmux list-sessions -F "#{session_name}"'
      );

      if (sessions.includes("minecraft")) {
        await sshClient.dispose();
        return await interaction.editReply(
          "Minecraft server is already running!"
        );
      }

      await sshClient.execCommand(
        `tmux new-session -d -s minecraft 'java -XX:SoftMaxHeapSize=10G -Xmx15G -jar fabric-server-mc.1.21.3-loader.0.16.9-launcher.1.0.1.jar nogui'`
      );

      await sshClient.dispose();
      await interaction.editReply("Minecraft server starting...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await interaction.editReply("Minecraft server started!");
    } catch (error) {
      console.error("SSH error:", error);
      await interaction.editReply("Failed to start the server!");
    }
  },
};
