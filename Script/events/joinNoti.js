const axios = require("axios");
const {
    createCanvas,
    loadImage,
    registerFont
} = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const FACEBOOK_ACCESS_TOKEN =
    "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "2.7.0",
    credits: "SHAHADAT SAHU",
    description: "Bot join notification with Canvas banner",
    dependencies: {
        axios: "",
        canvas: "",
        "fs-extra": "",
        path: ""
    }
};

const CACHE_DIR = path.join(
    __dirname,
    "cache"
);

const FONT_PATH = path.join(
    CACHE_DIR,
    "NotoSansBengali-Bold.ttf"
);

// 😊 দুঃখিত, এখানে কোনো Edit করতে হবে না।
// 🔄 নতুন Update-এর পর Bot Name Automatically Load হবে।
// ✅ তাই কোনো Setup-এর প্রয়োজন নেই।

async function loadFont() {
    try {
        await fs.ensureDir(
            CACHE_DIR
        );

        if (!fs.existsSync(FONT_PATH)) {
            const fontURL =
                "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Bold.ttf";

            const response =
                await axios.get(
                    fontURL,
                    {
                        responseType:
                            "arraybuffer",
                        timeout:
                            20000
                    }
                );
// 🥲 দুঃখিত, নতুন Update-এর পর
// 59, 60, 61, 64 পরিবর্তন করে নিচের
// 1219, 1220, 1222, 1225-এ গিয়ে খুঁজুন।
// ✅ সেখানেই সব Information পেয়ে যাবেন।

            await fs.writeFile(
                FONT_PATH,
                Buffer.from(
                    response.data
                )
            );
        }

        try {
            registerFont(
                FONT_PATH,
                {
                    family:
                        "SahuBengali"
                }
            );
        } catch (e) {}

    } catch (error) {
        console.error(
            "[JOINNOTI FONT ERROR]:",
            error.message
        );
    }
}

function font(
    size,
    weight = "normal"
) {
    return `${weight} ${size}px SahuBengali, Arial, sans-serif`;
}

function fitText(
    ctx,
    text,
    maxWidth,
    startSize,
    weight = "bold"
) {
    let size =
        startSize;

    while (size > 16) {
        ctx.font =
            font(
                size,
                weight
            );

        if (
            ctx.measureText(
                text
            ).width <=
            maxWidth
        ) {
            break;
        }

        size -= 2;
    }

    ctx.font =
        font(
            size,
            weight
        );

    return size;
}

function getUserInfo(
    api,
    userID
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            api.getUserInfo(
                userID,
                (
                    err,
                    data
                ) => {
                    if (err) {
                        reject(
                            err
                        );
                        return;
                    }

                    resolve(
                        data
                    );
                }
            );
        }
    );
}

async function getAddedUser(
    api,
    userID
) {
    let name =
        "Unknown User";

    try {
        const info =
            await getUserInfo(
                api,
                userID
            );

        const user =
            info &&
            info[userID];

        if (
            user &&
            user.name
        ) {
            name =
                String(
                    user.name
                );
        }
    } catch (
        error
    ) {}

    return {
        name
    };
}

async function loadProfileImage(
    userID
) {
    if (!userID) {
        return null;
    }

    try {
        const photoURL =
            `https://graph.facebook.com/${userID}/picture?width=512&height=512&type=large&access_token=${encodeURIComponent(
                FACEBOOK_ACCESS_TOKEN
            )}`;

        const response =
            await axios.get(
                photoURL,
                {
                    responseType:
                        "arraybuffer",
                    timeout:
                        20000,
                    maxRedirects:
                        5,
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0"
                    }
                }
            );

        if (
            !response.data ||
            response.data.length <
                1000
        ) {
            return null;
        }

        return await loadImage(
            Buffer.from(
                response.data
            )
        );

    } catch (
        error
    ) {
        console.error(
            "[PROFILE IMAGE ERROR]:",
            error.message
        );

        return null;
    }
}

function drawChatIcon(
    ctx,
    x,
    y,
    radius
) {
    ctx.save();

    ctx.fillStyle =
        "#111111";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.roundRect(
        x -
            radius *
                0.48,
        y -
            radius *
                0.32,
        radius *
            0.96,
        radius *
            0.62,
        10
    );

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
        x -
            radius *
                0.18,
        y +
            radius *
                0.28
    );

    ctx.lineTo(
        x -
            radius *
                0.02,
        y +
            radius *
                0.58
    );

    ctx.lineTo(
        x +
            radius *
                0.10,
        y +
            radius *
                0.28
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle =
        "#111111";

    for (
        let i = -1;
        i <= 1;
        i++
    ) {
        ctx.beginPath();

        ctx.arc(
            x +
                i *
                    radius *
                    0.23,
            y -
                radius *
                    0.01,
            radius *
                0.06,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}

function drawInfoIcon(
    ctx,
    x,
    y,
    radius
) {
    ctx.save();

    ctx.fillStyle =
        "#111111";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        `bold ${
            radius * 1.15
        }px Arial`;

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "i",
        x,
        y + 2
    );

    ctx.restore();
}

function drawUserIcon(
    ctx,
    x,
    y,
    radius
) {
    ctx.save();

    ctx.fillStyle =
        "#111111";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        x,
        y -
            radius *
                0.22,
        radius *
            0.22,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        x,
        y +
            radius *
                0.30,
        radius *
            0.37,
        0,
        Math.PI
    );

    ctx.fill();

    ctx.restore();
}

async function createBotJoinBanner(
    botName,
    addedByID,
    addedByName
) {
    await loadFont();

    const WIDTH =
        1536;

    const HEIGHT =
        1024;

    const canvas =
        createCanvas(
            WIDTH,
            HEIGHT
        );

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    const centerX =
        WIDTH / 2;

    const leftBox = {
        x: 110,
        y: 410,
        w: 670,
        h: 420
    };

    const rightBox = {
        x: 850,
        y: 410,
        w: 575,
        h: 420
    };

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    let displayBotName =
        String(
            botName ||
                "SHAHADAT CHAT BOT"
        ).trim();

    if (
        displayBotName.length >
        60
    ) {
        displayBotName =
            displayBotName.substring(
                0,
                57
            ) +
            "...";
    }

    fitText(
        ctx,
        displayBotName,
        WIDTH - 180,
        74,
        "bold"
    );

    ctx.fillStyle =
        "#111111";

    ctx.fillText(
        displayBotName,
        centerX,
        85
    );

    ctx.strokeStyle =
        "#2456c4";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        430,
        150
    );

    ctx.lineTo(
        690,
        150
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        846,
        150
    );

    ctx.lineTo(
        1106,
        150
    );

    ctx.stroke();

    ctx.fillStyle =
        "#2456c4";

    ctx.font =
        "34px Arial";

    ctx.fillText(
        "✦",
        centerX,
        150
    );

    ctx.fillStyle =
        "#111111";

    ctx.font =
        font(
            46,
            "bold"
        );

    ctx.fillText(
        "THANK YOU SO MUCH",
        centerX,
        215
    );

    const groupText =
        "♥ FOR ADDING ME TO YOUR GROUP ♥";

    ctx.fillStyle =
        "#2456c4";

    fitText(
        ctx,
        groupText,
        WIDTH - 170,
        56,
        "bold"
    );

    ctx.fillText(
        groupText,
        centerX,
        285
    );

    ctx.strokeStyle =
