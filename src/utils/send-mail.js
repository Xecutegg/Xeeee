import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    auth: {
        user: "no-reply@onedreamesports.games",
        pass: "0DUJCuxgq4SH",
    },
});

const approveHtml = (data) => {
    const {igl, email, teamname, teamlogo, players} = data;
return `
    <!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BGMI Tournament Registration Approved</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f5ff;
            margin: 0;
            padding: 40px 0;
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 640px;
            background: #d9f2ff;
            border-radius: 32px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(25, 103, 210, 0.1);
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: "";
            position: absolute;
            top: -120px;
            right: -120px;
            width: 300px;
            height: 300px;
            background: rgba(25, 103, 210, 0.08);
            border-radius: 50%;
        }

        .container::after {
            content: "";
            position: absolute;
            bottom: -80px;
            left: -80px;
            width: 200px;
            height: 200px;
            background: rgba(25, 103, 210, 0.1);
            border-radius: 50%;
        }

        .header {
            text-align: center;
            padding-bottom: 24px;
            margin-bottom: 32px;
            position: relative;
            z-index: 1;
        }

        .logo {
            height: 80px;
            width: 80px;
            border-radius: 50%;
            border: 3px solid #1967d2;
            padding: 4px;
            margin-bottom: 24px;
        }

        h1 {
            color: #1967d2;
            font-size: 26px;
            margin: 16px 0;
            letter-spacing: -0.5px;
        }

        .content {
            line-height: 1.6;
            color: #4a5568;
            position: relative;
            z-index: 1;
        }

        .team-details {
            background: #edf9ff;
            border-radius: 24px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #e8f1ff;
        }

        .team-logo {
            height: 64px;
            width: 64px;
            border-radius: 50%;
            border: 2px solid #1967d2;
            margin: 12px auto;
            display: block;
        }

        .player-list {
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }

        .player-list li {
            padding: 14px 24px;
            margin: 8px 0;
            background: #ffffff;
            border-radius: 50px;
            box-shadow: 0 2px 8px rgba(25, 103, 210, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        a {
            text-decoration: none;
            color: #1967d2;
        }

        .badge {
            background: #1e77ff;
            color: rgb(255, 249, 249);
            padding: 12px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: bold;
            transition: all 0.3s ease-in-out;
        }

        .badge:hover {
            background: #07037a;
            /* Brighter blue */
            box-shadow: 0 4px 10px rgba(25, 103, 210, 0.4);
            /* Soft glow */
            transform: scale(1.05);
            /* Slightly bigger */
            cursor: pointer;
        }


        .important-note {
            background: #ebf4fa;
            padding: 20px;
            border-radius: 24px;
            margin: 28px 0;
            position: relative;
        }

        .footer {
            text-align: center;
            margin-top: 32px;
            color: #718096;
            font-size: 14px;
            padding-top: 24px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://drive.usercontent.google.com/download?id=1QEufzb9GR-ccz9h-wUO5MB8EDLtAP393&export=view&authuser=0"
                class="logo" alt="Organization Logo">
            <h1>Registration approved! Congratulations</h1>
        </div>

        <div class="content">
            <p>Dear <strong style="color: #1967d2;">${igl}</strong>,</p>
            <p>Congratulations! Your Summer Series Tournament registration has been approved by the One Dream Esports
                management team. Best of luck! For Your Upcoming Matches </strong>.</p>

            <div class="team-details">
                <img src="${teamlogo}" class="team-logo" alt="Team Logo">
                <h3 style="text-align: center; color: #1967d2; margin: 16px 0;">Team: <strong>${teamname}</strong></h3>

                <ul class="player-list">
                ${players.map((player, i) => `
                    <li>
                        <span>Player ${++i}:⠀</span>
                        <span>⠀${player.name}</span>
                    </li>
                `).join('')}

                <li>
                    <span>Current Team Email:⠀</span>
                    <span>⠀</span>
                </li>
                </ul>
            </div>

            <div class="important-note">
                <strong style="color: #1967d2;">📢 Important Notice:</strong>
                <p style="margin: 12px 0;">Your Tournament ID, Password, Slot List, and Group Division will be sent to
                    your registered email. Please ensure your email ID is correct and active. <br>
                    <br>

                    If you need to change your email ID or mobile number, you must contact One Dream Esports management
                    within 24 hours of receiving this approval message.
                </p>
                <a
                    href="https://docs.google.com/document/d/1iwOmzsWZZgQXvBU4K4AMzI4rj7WY48bspWzWKgyB0wU/edit?usp=sharing"><span
                        class="badge">Check Rulebook</span></a>
                <a href="mailto:support@onedreamesports.games"><span class="badge">Support Email</span></a>
                <a href="https://discord.gg/WVThZG7Q5X"><span class="badge">Discord</span></a>
                <a href="https://www.instagram.com/xecute.gg_/"><span class="badge">Instagram</span></a>
                <a href="https://youtube.com/@onedreamesports.?si=Cao6RwTtGB-6jedT"><span
                        class="badge">Youtube</span></a>
            </div>

            <p style="text-align: center; margin-top: 32px;">
                Need assistance? Contact our support team at<br>
                <strong style="color: #1967d2;">support@onedreamesports.games</strong>
            </p>
        </div>

        <div class="footer">
            <p>Organized by One Dream Esports<br>
                <small>Official Tournament Partner Of Krafton</small>
            </p>
        </div>
    </div>
</body>

</html>
    `
}

export const sendMail = async (to, subject, data) => {
    try {
        await transporter.sendMail({
            from: "no-reply@onedreamesports.games",
            to,
            subject,
            html: approveHtml(data),
        });
        console.log('Mail sent successfully');
    } catch (error) {
        console.log(error);
        return error;
    } 
}   