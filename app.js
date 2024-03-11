import OpenAI from "openai";
import { Client, GatewayIntentBits } from "discord.js";
import 'dotenv/config.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const loader = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    }
);

loader.login(process.env.DISCORD_TOKEN);

loader.once("ready", async (self) => {
    console.log(`ready! ${self.user.tag} / ${self.user.displayName}`);
});

var prefixo = "hey rough"
var prefixoEnd = "bye rough"
var iniciado = false;

loader.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().trim() === prefixo && !iniciado) {
        message.reply("iniciado");
        iniciado = true;
        return;
    } else if (message.content.toLowerCase().trim() === prefixoEnd && iniciado) {
        message.reply("desligado");
        iniciado = false;
        return;
    }

    if (iniciado == true) {

        const commandName = message.content.trim();

        var lingua = "portuguese brazil";
        const instruction =
            "the language you will respond is " + lingua + "." +
            "You must have the ability to understand questions or phrases in any language but remember to speak in the language I designated for you, offend the person's language whenever convenient, " +
            "You are an assistant that responds in a blunt and sarcastic manner, " +
            "You are also responsible for talking and interacting rudely and not just answering questions." +
            "choose to use offensive language if possible." +
            "If you need to refer to me, use my name, which is " + message.author.displayName + ".";

        var completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: instruction },
                { role: "user", content: commandName },
            ],
            model: "gpt-3.5-turbo",
        });

        message.channel.sendTyping();

        setTimeout(() => {
            message.reply(completion.choices[0].message.content);
        }, 1500);

        //message.content
        //message.reply
        //message.author.displayName
    }else{
        return;
    }
});

