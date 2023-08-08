const {
  Client,
  MessageEmbed,
  Intents,
  CommandInteractionOptionResolver,
  MessageReaction,
} = require("discord.js");
require("dotenv").config();
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "CHANNEL", "GUILD_MESSAGE_REACTIONS", "REACTION"],
});
const token = process.env.BOT_TOKEN;
const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

// [{ques , favour , oppose}]

var polls = [];

const generator = (...args) => {
  const s = {
    ques: args[0],
    favour: 0,
    oppose: 0,
    messageID: args[1],
  };
  polls.push(s);
};

const ReactionAdd = (emoji, id) => {
  console.log(emoji);

  for (var i = 0; i < polls.length; i++) {
    if (polls[i].messageID == id) {
      if (emoji == "👍") polls[i].favour = polls[i].favour + 1;
      else if (emoji == "👎") polls[i].oppose = polls[i].oppose + 1;
      break;
    }
  }
};

const ReactionRemove = (emoji, id) => {
  console.log(emoji);

  for (var i = 0; i < polls.length; i++) {
    if (polls[i].messageID == id) {
      if (emoji == "👍") polls[i].favour = polls[i].favour - 1;
      else if (emoji == "👎") polls[i].oppose = polls[i].oppose - 1;

      break;
    }
  }
};

client.on("message", async (message) => {
  if (message.partial) {
    message
      .fetch()
      .then((fullMessage) => {
        console.log(fullMessage.content);
        message = fullMessage;
      })
      .catch((error) => {
        console.log("Something went wrong when fetching the message: ", error);
      });
  }

  var s = message.content;
  console.log(message.id);
  console.log(s);

  if (s[0] !== "$" || message.author.bot) {
    return;
  }
  const [command, ...args] = s.trim().substr(1).split(/\s+/);

  console.log(args);

  const embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(`Poll by @${message.author.username}`)
    .setAuthor(`${message.author.username}`)
    .setDescription(`${args.join(" ")}`)
    .setThumbnail(
      "https://media-exp1.licdn.com/dms/image/C510BAQEjs-oP2sqmiQ/company-logo_200_200/0/1556714972118?e=2159024400&v=beta&t=VDcc_FH3p9k1DasP5hKWZxYKAsKYvWcHTp2qdzEVfBM"
    );

  if (command == "poll") {
    if (args.length === 0) {
      message.channel.send("Please provide the question for the poll");
      return;
    }

    message.channel
      .send({ embeds: [embed] })
      .then((m) => {
        m.react("👍");
        m.react("👎");
        generator(args.join(" "), m.id);

        console.log("here" + m.id);
      })
      .catch((err) => {
        message.channel.send("Something went wrong, please try again");
      });

    message.delete(1000);
  } else if (command === "poll-list") {
    if (polls.length === 0) {
      message.channel.send("There are no polls to show");
      return;
    }

    for (var i = 0; i < polls.length; i++) {
      message.channel.send(i + 1 + ". " + polls[i].ques);
    }
  } else if (command == "poll-result") {
    if (args[0] == undefined) {
      message.channel.send(
        "Please give the index of the poll whose result is to be known"
      );
      return;
    }

    if (args[0] > polls.length || args[0] <= 0) {
      message.channel.send(
        "Invalid poll index selected, please select valid poll index"
      );
      return;
    }
    message.channel.send(`Question : ${polls[args[0] - 1].ques} `);
    message.channel.send("Results of poll is :");
    message.channel.send(
      `${polls[args[0] - 1].favour - 2} people are in the favour and ${
        polls[args[0] - 1].oppose - 2
      } oppose the event`
    );
  } else if (command == "poll-delete") {
    if (args[0] == undefined) {
      message.channel.send("Please give the index of the poll to delete");
      return;
    }
    if (args[0] > polls.length || args[0] <= 0) {
      message.channel.send(
        "Invalid poll index selected, please select valid poll index"
      );
      return;
    }

    polls = polls.filter((item, index) => {
      if (index + 1 != args[0]) return 1;
      else return 0;
    });

    message.channel.send("The polls has been deleted ");
  } else if (command === "poll-commands") {
    message.channel.send(
      "$poll <question> --> Creates a poll for the given question "
    );
    message.channel.send(
      "$poll-list       --> Shows the ongoing poll list if there is any "
    );
    message.channel.send(
      "$poll-delete <index(1-indexing)> --> deletes the poll at a particular index if there is any "
    );
    message.channel.send(
      "$poll-result <index(1-indexing)> --> Shows the current result for the poll"
    );
    message.channel.send(
      "$poll-commands   --> Shows all the available poll commands "
    );
  } else {
    message.channel.send("No matching command found");
  }
});

client.on("messageReactionAdd", (messageReaction, user) => {
  const s = messageReaction.message.id;
  console.log(s);
  ReactionAdd(messageReaction.emoji.name, s);
});

client.on("messageReactionRemove", (messageReaction, user) => {
  const s = messageReaction.message.id;
  console.log(s);
  ReactionRemove(messageReaction.emoji.name, s);
});

client.on("ready", (client) => {
  console.log("Logged in as " + client.user.tag);
});
client.login(token);

app.listen(process.env.PORT || port);
