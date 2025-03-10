const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');

const BOT_TOKEN = '7790991987:AAFHV_GCr6Hz_2LkcJPlwqgmER5gkj_gPS4';
const CHANNEL_ID = '@toolhubz';  // Replace with your channel username
const bot = new Telegraf(BOT_TOKEN);

// Function to check if user is a channel member
async function isUserMember(ctx) {
    try {
        const chatMember = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);
        return ['member', 'administrator', 'creator'].includes(chatMember.status);
    } catch (error) {
        return false;
    }
}

// Start Command
bot.start(async (ctx) => {
    const isMember = await isUserMember(ctx);

    if (!isMember) {
        ctx.reply(`🚀 **Welcome to Wikipedia PDF Bot!**  
        
❌ **You must join our channel first!**  
👉 [Join Toolhubz-](https://t.me/toolhubz)  
🔄 Then click **Check Again** button!`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Join Channel", url: "https://t.me/toolhubz" }],
                    [{ text: "🔄 Check Again", callback_data: "check_join" }]
                ]
            }
        });
    } else {
        ctx.reply(`🔥 **Welcome Back, ${ctx.from.first_name}!**  
        
Type any topic name, and I will send you a Wikipedia PDF! 📚`);
    }
});

// Callback for checking if user joined
bot.action('check_join', async (ctx) => {
    const isMember = await isUserMember(ctx);

    if (isMember) {
        ctx.reply(`🎉 **Thanks for joining!** Now send me any topic name, and I will send you a Wikipedia PDF! 📄`);
    } else {
        ctx.reply(`❌ **You haven't joined yet!**  
👉 [Join Tech Guru](https://t.me/techguru097)  
🔄 Then click **Check Again** button!`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Join Channel", url: "https://t.me/techguru097" }],
                    [{ text: "🔄 Check Again", callback_data: "check_join" }]
                ]
            }
        });
    }
});

// Fetch Wikipedia PDF
bot.on('text', async (ctx) => {
    const isMember = await isUserMember(ctx);
    if (!isMember) {
        return ctx.reply("❌ **You must join our channel first!** \n👉 [Join Here](https://t.me/techguru097)", {
            parse_mode: "Markdown"
        });
    }

    const topic = ctx.message.text;
    const pdfUrl = `https://en.wikipedia.org/api/rest_v1/page/pdf/${encodeURIComponent(topic)}`;

    ctx.reply(`📥 Generating PDF for *${topic}*... Please wait ⏳`, { parse_mode: "Markdown" });

    try {
        const response = await axios.get(pdfUrl, { responseType: 'stream' });
        const filePath = `./${topic}.pdf`;
        const writer = fs.createWriteStream(filePath);
        
        response.data.pipe(writer);

        writer.on('finish', async () => {
            await ctx.replyWithDocument({ source: filePath, filename: `${topic}.pdf` });
            fs.unlinkSync(filePath); // Delete after sending
        });
    } catch (error) {
        ctx.reply("❌ Sorry, I couldn't generate a PDF for this topic. Please try another one.");
    }
});

bot.launch();
