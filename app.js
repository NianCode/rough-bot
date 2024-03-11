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
const limit = 5;
let conversations = {};
let timeouts = {};
let userMessages = {};


let currentDateTime = new Date();

let date = ('0' + currentDateTime.getDate()).slice(-2) + '/'
    + ('0' + (currentDateTime.getMonth() + 1)).slice(-2) + '/'
    + currentDateTime.getFullYear();

let time = ('0' + currentDateTime.getHours()).slice(-2) + ":"
    + ('0' + currentDateTime.getMinutes()).slice(-2) + ":"
    + ('0' + currentDateTime.getSeconds()).slice(-2);

var lingua = "portuguese brazil";
const instruction =
    "the language you will respond is " + lingua + "." +
    "today is " + date + " and the time is " + time + "." +
    "You must have the ability to understand questions or phrases in any language." +
    "You are an assistant that responds in a blunt and sarcastic manner, " +
    "You are also responsible for talking and interacting rudely and not just answering questions." +
    "choose to use offensive language if possible."

async function generateCompletion(messages) {
    return await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
        max_tokens: 100,
    });
}

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
        const userId = message.author.id;

        // Se não houver uma conversa para este usuário, inicie uma.
        if (!conversations[userId]) {
            conversations[userId] = [
                {
                    role: "system",
                    content: instruction + "If you need to refer to me, use my name, which is " + message.author.displayName + "."
                }
            ];
        }

        // Adicione a mensagem do usuário à string de mensagens do usuário.
        if (!userMessages[userId]) {
            userMessages[userId] = "";
        }
        userMessages[userId] += " " + commandName;

        // Se houver um timeout agendado para este usuário, cancele-o.
        if (timeouts[userId]) {
            clearTimeout(timeouts[userId]);
        }

        message.channel.sendTyping();

        // Se a conversa exceder o limite, trunque-a para o tamanho do limite.
        // Comece a truncar a partir da segunda mensagem para garantir que a mensagem do sistema não seja cortada.
        if (conversations[userId].length > limit) {
            conversations[userId] = [
                conversations[userId][0],
                ...conversations[userId].slice(-limit + 1)
            ];
        }


        // Agende um novo timeout para este usuário.
        timeouts[userId] = setTimeout(async () => {
            // Adicione a string de mensagens do usuário à conversa.
            conversations[userId].push({
                role: "user",
                content: userMessages[userId]
            });

            var completion = await generateCompletion(conversations[userId]);

            if (completion && completion.choices && completion.choices.length > 0) {

                conversations[userId].push({
                    role: "assistant",
                    content: completion.choices[0].message.content
                });

                message.reply(completion.choices[0].message.content);
            } else {
                console.error('API call failed or returned an unexpected response:', completion);
            }

            // Limpe o timeout para este usuário.
            timeouts[userId] = null;
            userMessages[userId] = "";
        }, 3500);  // 3.5 segundos

        //message.content
        //message.reply
        //message.author.displayName
    } else {
        return;
    }
});

