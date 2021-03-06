const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
//const ffmpeg = require('ffmpeg');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('WE READY BOIS!');
});


client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	//so dummy bot doesnt answer itself
	/* if (message.author === client.user) return
	if (message.content.includes(client.user.toString())) {
		console.log(client.user.toString());
		message.reply(`What do you want ${message.author.toString()}? Leave me be!`)
	} */

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (!message.member.voiceChannel === 'General') {
		return console.error('no such channel br0h');
	}

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			channel.join().then(
				con => {
					console.log('it worked');
				}).catch (e => console.error(e));
			const timeLeft = (expirationTime - now) / 1000;
			

			return message.reply(`please wait your impatient ass, ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, { files: ['./media/tooManyQuestionsAudio.mp3','./media/tooManyQuestionsImg.png']});
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);
