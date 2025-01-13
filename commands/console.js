const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { NodeSSH } = require("node-ssh");
const { ssh, staffRole } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("console")
    .setDescription(
      "View console log or send a command to the Minecraft console (Staff only)"
    )
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to send (leave empty to view full log)")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(staffRole)) {
      return interaction.reply({
        content: "You do not have permission to use this command!",
        ephemeral: true,
      });
    }

    const command = interaction.options.getString("command");
    await interaction.deferReply();

    const sshClient = new NodeSSH();

    try {
      await sshClient.connect(ssh);

      if (command) {
        const tempFile = `/tmp/minecraft-cmd-${Date.now()}.log`;
        await sshClient.execCommand(
          `tmux pipe-pane -t minecraft "cat > ${tempFile}"`
        );

        await sshClient.execCommand(
          `tmux send-keys -t minecraft "${command}" Enter`
        );

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await sshClient.execCommand("tmux pipe-pane -t minecraft");

        const { stdout } = await sshClient.execCommand(`cat ${tempFile}`);
        await sshClient.execCommand(`rm ${tempFile}`);

        await sshClient.dispose();

        const attachment = new AttachmentBuilder(
          Buffer.from(stdout || "No output"),
          { name: "command-output.log" }
        );
        return await interaction.editReply({
          content: `Command executed: ${command}`,
          files: [attachment],
        });
      } else {
        const { stdout } = await sshClient.execCommand(
          "tmux capture-pane -pt minecraft -S -"
        );
        await sshClient.dispose();

        const logContent = stdout || "No log available";
        const attachment = new AttachmentBuilder(Buffer.from(logContent), {
          name: "console.log",
        });

        return await interaction.editReply({
          content: "Here is the full console log:",
          files: [attachment],
        });
      }
    } catch (error) {
      console.error("SSH error:", error);
      await interaction.editReply("Failed to connect to the server!");
    }
  },
};
