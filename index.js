require('dotenv').config();
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { google } = require('googleapis');

// 👇 CONFIGURATION
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'Sheet1!A:C'; // Adjust sheet name if needed

// 👇 LOAD SERVICE ACCOUNT AUTH
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendToSheet(sender, name, message) {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        // Get current timestamp
        const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

        await googleSheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [timestamp, sender, name, message]
                ],
            },
        });
        console.log('   -> ✅ Saved to Sheets (via API)');
    } catch (err) {
        console.error('   -> ❌ API Error:', err.message);
    }
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        // browser: ["Desktop", "Chrome", "1.0"] 
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            const remoteJid = msg.key.remoteJid;
            if (remoteJid === 'status@broadcast' || !msg.message) continue;

            const isMe = msg.key.fromMe;
            const chatID = remoteJid.replace('@s.whatsapp.net', '');

            let name = isMe ? "ME (Outgoing)" : (msg.pushName || "Unknown");
            const text = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption || "";

            if (text) {
                const arrow = isMe ? '➞' : '⬅️';
                console.log(`${arrow} ${chatID} | ${name}: ${text}`);

                // 👇 USE THE NEW FUNCTION
                await appendToSheet(chatID, name, text);
            }
        }
    });
}

connectToWhatsApp();