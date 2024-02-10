const { Events, Collection } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

    const commandName = interaction.commandName;
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      console.error(`No command matching ${commandName} was found.`);
      return;
    }

   // Gestion des cooldowns
const { cooldowns } = interaction.client;

if (!cooldowns.has(commandName)) {
  cooldowns.set(commandName, new Collection());
}

const now = Date.now();
const timestamps = cooldowns.get(commandName);
const defaultCooldownDuration = 3;
const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

// Vérifier si l'interaction est une autocomplétion
if (!interaction.isAutocompleted()) {
  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({
        content: `Veuillez patienter, vous êtes en période de récupération pour la commande \`${commandName}\`. Vous pourrez l'utiliser à nouveau dans <t:${expiredTimestamp}:R>.`,
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
}


    // Gestion de l'autocomplétion pour toutes les commandes
    if (interaction.isAutocomplete()) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
        return handleError(interaction);
      }
    } else {
      // Gestion de l'exécution de la commande
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        return handleError(interaction);
      }
    }
  },
};

async function handleError(interaction) {
  const errorMessage = 'Une erreur s\'est produite lors de l\'exécution de cette commande !';
  
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content: errorMessage, ephemeral: true });
  } else {
    await interaction.reply({ content: errorMessage, ephemeral: true });
  }
}
