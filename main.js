const { GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search'); 
const { YtDlpPlugin } = require("@distube/yt-dlp")
const { ConnectionService } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { DisTube, default: dist, isURL, Queue } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require("@distube/soundcloud");
require("dotenv").config();




const client = new Discord.Client({intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates]});

const prefix = '-';

const fs = require('fs');
const { YouTubePlugin } = require('@distube/youtube');
const { isNumberObject } = require('util/types');

/*
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}
*/

client.once('ready', () => {
    console.log("He's here");
    
    
});


/*
    searchSongs: 5,
    searchCooldown: 0,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: false,
    nsfw: true,
    plugins: [new SpotifyPlugin({
        emitEventsAfterFetching: true,
        api: {
            clientId: "SpotifyAppClientID",
            clientSecret: "SpotifyAppClientSecret",
            topTracksCountry: "VN",
          },
      }),
      new SoundCloudPlugin(),],
*/


const distube = new DisTube(client, {
  plugins: [new SpotifyPlugin(), new YouTubePlugin(), new SoundCloudPlugin(),],
});



ffmpeg_options = {
    'options': '-vn',
    "before_options": "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5"
}

client.on('messageCreate', async message => {
	if (message.author.bot || !message.inGuild()) return;
	if (!message.content.startsWith(prefix)) return;
	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift();

    if(command === 'ping'){
        client.commands.get('ping').execute(message, args);
    }

    if ((command === 'play') || (command === 'p')){
        const voiceChannel = message.member?.voice?.channel;

        if (voiceChannel) {
            try 
            {
                songEntry = args.join(' ')

                if(!isURL(songEntry))
                {
                    const result = await ytPlugin.search(message.content, { type: "video", limit: 5})

                    songString = `**Choose an option from below**\n`
                    i = 0
                    for(song of result)
                    {
                           songString = songString.concat(`**${++i}**. ${song.name} - \`${ song.formattedDuration }\`\n`) 
                    }
                    songString = songString.concat(`\n*Enter anything else or wait 10 seconds to cancel*`) 
                    message.channel.send(songString)

                    const msg_filter = (m) => m.author.id === message.author.id && Number.parseInt(m.content, 10) > 0 && Number.parseInt(m.content, 10) < 6 
                    message.channel.awaitMessages({ filter: msg_filter, max: 1, time: 10_000, errors: ['time'] })
                    .then(collected => {
                        value = Number.parseInt(collected.at(0).content),10
                        if(Number.parseInt(value, 10))
                        {
                            distube.play(voiceChannel, result[value - 1].url, {
                                message,
                                textChannel: message.channel,
                                member: message.member,
                            });
                        }

                    })
                    .catch(collected => console.log(`time out`));      
                    
                }
                else
                {
                    distube.play(voiceChannel, songEntry, {
                        message,
                        textChannel: message.channel,
                        member: message.member,
                    });
                }

                    
                    songUser = message.member.nickname || message.author.username;
                    return songUser;
            }
            catch(err){
                console.log(err)
            }
		} else {
			message.channel.send(
				'You must join a voice channel first.',
			);
		}
        
    }
    if (command === 'shuffle'){
        distube.shuffle(message);
		message.channel.send('Shuffled');
    }
    if (command === 'leave'){
        distube.voices.get(message)?.leave();
		message.channel.send('See ya');
    }
    if (command === 'stop') {
		distube.stop(message);
		message.channel.send('Stopped the music!');
	}
    if (command === 'np') {
        try
        {
            queue = distube.getQueue(message);

            if(queue.songs[0])
            {
            song = queue.songs[0];

            seconds = song.duration - queue.currentTime;
            minutes = Math.floor(seconds / 60);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            extraSeconds = seconds % 60;
            extraSecond = Math.ceil(parseInt(extraSeconds));
            extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;

            message.channel.send(`Now Playing:\n${queue.songs.map((song, id) =>
            `${song.name} - \`${minutes}:${parseInt(extraSeconds)} left. [${songUser}'s song]\``,).slice(0, 1).join('\n')}`,);
            }
            else { message.channel.send(`Nothing is playing.`) }
        }
        catch(err) {
            message.channel.send(
                "There is no queue",
            );
        }
        
	}
    if (command === 'resume') distube.resume(message);
	if (command === 'pause') distube.pause(message);
    if ((command === 'skip') || (command === 's')){
        try {
            queue = distube.getQueue(message);
            if (queue.songs.length > 1)
            {
                distube.skip(message);
            }
            else{
                distube.stop(message);
            }
        }
        catch(err) {
            message.channel.send(
                "Couldn't skip for some reason I don't know",
            );
        }
    }
    if (['repeat', 'loop'].includes(command)) {
		const mode = distube.setRepeatMode(message);
		message.channel.send(
			`Set repeat mode to \`${
				mode
					? mode === 2
						? 'All Queue'
						: 'This Song'
					: 'Off'
			}\``,
		);
	}
    if ((command === 'queue') || (command === 'q')) {
		const queue = distube.getQueue(message);
		if (!queue) {
			message.channel.send('Nothing playing right now!');
		} else {
			message.channel.send(
				`Current queue:\n${queue.songs
					.map(
						(song, id) =>
							`**${id ? id : 'Playing'}**. ${
								song.name
							} - \`${song.formattedDuration}\``,
					)
					.slice(0, 10)
					.join('\n')}`,
			);
		}
	}

    if (
		[
			'3d',
			'bassboost',
			'echo',
			'karaoke',
			'nightcore',
			'vaporwave',
		].includes(command)
	) {
        const queue = distube.getQueue(message);
        queue.filters.add(command);
		//const filter = distube.setFilter(message, command);
		//message.channel.send(
		//	`Current queue filter: ${filter.join(', ') || 'Off'}`,
		//);
	}
    // idk why this is breaking the code
    //else if ('clear'){ const queue = distube.getQueue(message); queue.filters.clear();}

});


// searchResult has been depricated in Distube 5
/*
// DisTubeOptions.searchSongs > 1
distube	
.on('searchResult', (message, result) => {
    let i = 0;
    message.channel.send(
        `**Choose an option from below**\n${result
            .map(
                song =>
                    `**${++i}**. ${song.name} - \`${
                        song.formattedDuration
                    }\``,
            )
            .join(
                '\n',
            )}\n*Enter anything else or wait 30 seconds to cancel*`,
    );
})
.on('error', (channel, e) => {
    console.log("An error encountered")
});
*/

client.login(process.env.token);
