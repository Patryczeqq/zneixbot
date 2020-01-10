exports.name = `{PREFIX}${__filename.split(/[\\/]/).pop().slice(0,-3)}`;
exports.description = 'Outputs emote as an image and link to it - under developement.';
exports.usage = `{PREFIX}${__filename.split(/[\\/]/).pop().slice(0,-3)} <discord emote>`;
exports.perms = [false, false];

exports.run = (client, message) => {
    message.cmd = this;
    message.command(1, async () => {
        if (/<:[a-z0-9-_]+:\d+>/i.test(message.args[0]) || /<a:[a-z0-9-_]+:\d+>/i.test(message.args[0])){
            let id = /:\d+>/g.exec(message.args[0]).toString().slice(1, -1);
            let url = `https://cdn.discordapp.com/emojis/${id}.${/<a:/.test(message.args[0])?"gif":"png"}`;
            message.channel.send(`<${url}>`, {file:url});
        }
        //TODO: Finish this later ;)
        // else if (/^\d+$/.test(message.args[0])){
        //     let url = `https://cdn.discordapp.com/emojis/${message.args[0]}`;
        //     try {message.channel.send(`<${url}>`, {file:url});}
        //     catch (issue){return {code: '27', msg: `coś poszło nie tak ;c : ${issue}`};}
        // }
        else return {code: '15', msg: "That's not an emote nor it's ID "+client.emoteHandler.find("NaM")};
    });
}