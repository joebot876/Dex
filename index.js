const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
],
});

const configuration = new Configuration({
apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const roastLines = [
"You're like a cloud. When you disappear, it’s a beautiful day.",
"You bring everyone so much joy… when you leave the room.",
"You have something on your chin... no, the third one down.",
"You're proof that evolution can go in reverse.",
"You're as useless as the 'g' in lasagna.",
];

const commands = [
new SlashCommandBuilder()
.setName('ask')
.setDescription('Ask the bot anything')
.addStringOption(option =>
option.setName('question')
.setDescription('Your question')
.setRequired(true)
),
new SlashCommandBuilder()
.setName('roastme')
.setDescription('Get roasted by the bot'),
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once(Events.ClientReady, async () => {
console.log(`🤖 Logged in as ${client.user.tag}`);
try {
await rest.put(
Routes.applicationCommands(process.env.CLIENT_ID),
{ body: commands }
);
console.log('✅ Slash commands registered.');
} catch (error) {
console.error('❌ Failed to register slash commands:', error);
}
});

client.on(Events.InteractionCreate, async interaction => {
if (!interaction.isChatInputCommand()) return;

const { commandName } = interaction;

if (commandName === 'ask') {
const question = interaction.options.getString('question');
await interaction.deferReply();

try {
const res = await openai.createChatCompletion({
model: 'gpt-4',
messages: [{ role: 'user', content: question }],
});

const answer = res.data.choices[0].message.content;
await interaction.editReply(answer);
} catch (err) {
console.error(err);
await interaction.editReply("❌ There was a problem getting a response.");
}
}

if (commandName === 'roastme') {
const roast = roastLines[Math.floor(Math.random() * roastLines.length)];
await interaction.reply(roast);
}
});

// Random roasts in chat
client.on(Events.MessageCreate, message => {
if (message.author.bot) return;

if (Math.random() < 0.03) {
const roast = roastLines[Math.floor(Math.random() * roastLines.length)];
message.reply(roast);
}
});

client.login(process.env.TOKEN);