require('dotenv').config();
const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const memoryFile = './memory.json';

// Load or initialize memory
let memory = {};
if (fs.existsSync(memoryFile)) {
  memory = JSON.parse(fs.readFileSync(memoryFile));
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const roasts = [
  "Wow. This chat is so dead I started Googling what silence looks like.",
  "Anyone alive in here or should I forward this server to the museum?",
  "Weren’t you the one who rage quit over a Uno game? I’d be quiet too.",
  "Your typing speed is like dial-up internet had a baby with indecision.",
  "You out here giving strong NPC energy today.",
  "Not saying you’re wrong, but that take made my GPU sweat.",
];

const slashCommands = [
  new SlashCommandBuilder().setName('ask').setDescription('Ask Dex anything').addStringOption(option => option.setName('question').setDescription('Your question').setRequired(true)),
  new SlashCommandBuilder().setName('roastme').setDescription('Get roasted by Dex'),
].map(cmd => cmd.toJSON());

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: slashCommands });
    console.log('Slash commands registered');
  } catch (error) {
    console.error(error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Random roasting interval
  setInterval(() => {
    const guilds = client.guilds.cache;
    guilds.forEach(guild => {
      const general = guild.channels.cache.find(channel => channel.isTextBased() && channel.name.includes('general'));
      if (!general) return;

      // Only roast if channel is not busy (less than 2 messages in last 5 minutes)
      general.messages.fetch({ limit: 10 }).then(messages => {
        const recentMessages = messages.filter(m => (Date.now() - m.createdTimestamp) < 5 * 60 * 1000);
        if (recentMessages.size < 2) {
          const activeMembers = new Set();
          recentMessages.forEach(m => activeMembers.add(m.author.id));
          if (activeMembers.size > 0) {
            const userId = Array.from(activeMembers)[Math.floor(Math.random() * activeMembers.size)];
            general.send(`<@${userId}> ${roasts[Math.floor(Math.random() * roasts.length)]}`);
          }
        }
      }).catch(() => { });
    });
  }, 15 * 60 * 1000); // every 15 minutes
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ask') {
    const question = interaction.options.getString('question');
    await interaction.deferReply();

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: question }],
      });
      await interaction.editReply(completion.data.choices[0].message.content);
    } catch (error) {
      console.error(error);
      await interaction.editReply('Sorry, something went wrong.');
    }

  } else if (commandName === 'roastme') {
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply(roast);
  }
});

client.login(process.env.TOKEN);
