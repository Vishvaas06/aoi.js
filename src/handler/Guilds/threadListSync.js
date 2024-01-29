const Interpreter = require("../../core/interpreter.js");
module.exports = async (threadCollection, client) => {
    const cmds = client.cmd.threadListSync.V();
    const data = {
        guild: threadCollection.first().guild,
        channel: threadCollection.first(),
        client: client,
    };
    let chan;
    for (const cmd of cmds) {
        if (cmd?.channel?.includes("$")) {
            const id = await Interpreter(
                client,
                data,
                [],
                { name: "ChannelParser", code: cmd?.channel },
                client.db,
                true,
            );
            chan = client.channels.cache.get(id?.code);
        } else {
            chan = client.channels.cache.get(cmd.channel);
        }
        await Interpreter(
            client,
            data,
            [],
            cmd,
            client.db,
            false,
            chan?.id,
            { threadListSync: threadCollection },
            chan,
        );
    }
};
