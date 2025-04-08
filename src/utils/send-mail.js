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
    const { igl, email, teamname, teamlogo, players } = data;
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
                    <span>⠀${email}</span>
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





const rejectHtml = (data, reason) => {
    const { igl, email, teamname, teamlogo, players } = data;
    return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BGMI Tournament Registration Rejected</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fff0f0;
            margin: 0;
            padding: 40px 0;
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 640px;
            background: #ffd9d9;
            border-radius: 32px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(211, 47, 47, 0.1);
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
            background: rgba(211, 47, 47, 0.08);
            border-radius: 50%;
        }

        .container::after {
            content: "";
            position: absolute;
            bottom: -80px;
            left: -80px;
            width: 200px;
            height: 200px;
            background: rgba(211, 47, 47, 0.1);
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
            border: 3px solid #d32f2f;
            padding: 4px;
            margin-bottom: 24px;
        }

        h1 {
            color: #d32f2f;
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
            background: #ffeded;
            border-radius: 24px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #ffe8e8;
        }

        .team-logo {
            height: 64px;
            width: 64px;
            border-radius: 50%;
            border: 2px solid #d32f2f;
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
            box-shadow: 0 2px 8px rgba(211, 47, 47, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .badge {
            display: inline-block;
            background: #d32f2f;
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            margin: 8px 14px 8px 0;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease-in-out;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
        }

        .badge::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300%;
            height: 300%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.5s ease-in-out;
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
        }

        .badge:hover::before {
            transform: translate(-50%, -50%) scale(1);
        }

        .badge:hover {
            background: #bd1708;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(211, 47, 47, 0.4);
        }

        .important-note {
            background: #faebeb;
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
            <img src="https://lh3.googleusercontent.com/fife/ALs6j_H3hzxkjG8DcgVvpDnyIJUp3zbYkqQtVlCk4ufrLjeex1GUfHDskO0qBF2CiECg8iN-eXO_ykbDM-DHlB4E6kxuJxCHBbp534uJ8pmVPEbNk2nGScL7mlfobpBJGV7_rccYuvvCRjM6cpfe5rjihugBi0TRMI6DF0KmkC7MQgWh5zDMXXhBDflmYBp2veRX7MTgmS7jm24y1tcWfNKRGrS6euQpyJeJkGTmCnXuzVfp3gyl2WP0vEeXHXoyHh6c5ZQOWsNq9s1r4-KYhdsOOAAiKBROGGN-6ChCFtnXtj7mFZimFg57jZ07c_FMoLb6ZoH5lsus3PoAZfSS0FgVayLjL0Uy7GRYvyHnHbUE1UuuJ2_Ps4TykDfibFgbl0qE7Gjggq8rHJyuyPPcV9ELWD-5M6sFQDIdA2_V1acguztubIM3z2wcOfp7emYuhnh1hlgcCCEI7Nm0xG6T1atTWzkUCdBbvvZYMFKpk9W5SUs1XbU453fzjVVBsXm9Rr3l8BHhQUZQXKeob-tubQjhy7F11eSJq0sJ7RB_dTy9kSLnZVKxLpDtrzrVgrnzvfS6zgs-MB6xxVXLQv6Ua3yrEjvP0967A98CFdBlFyIAJAbUcT0fPbrTmpqfewwD_kQ99lW2RqbCBwbSJgp7nc_aaLOStXUMLDAS8aFW27fqyHmu-55gqsxI5yJUmT5WHfU7l6qPB-rgOD2JeD0ERS9853em9hpmCDlDXEuIGmyGXROz5i4XqlC1s4IXPz3nZGKJrBfL5ci9XqGv8pNCWe0z_WMgfDR7ivrAYjFm-k_t4sI3QfGWDH9m8vgmPCOpPEOTOl9M_uwfRQEcdThaICXu_TwTmYg6i4dd4g5i3n0Z5-URrfOMsePsW02ZJgFuW_WeTWkBMMwqtmHLilG54fs4WchBIvHmLVD7EIhFufLXIp-iqoj_KLtyC_W-zqglErBf9-lxCva6JXekL7lhO1y2Nl__rkeVweUvmpCFfKGdGyr0mSF1LTHhJEOtqjWl-sSIFDTb8TcSnDZnAG_6Ek_MKmMOLSY_RAnCCbpkXLeT9JwijcKXW5p3b9u8an5HR8ezsI_6lO_cMYMopwuLtXYL63pT9LuE3BfIfwgR5S_-2AmD5Hyl8gl5ieVZtjjDeJ82DpKgyW_uPpVVKN3qTlMQ7uwS-h78HGkpbbmcJQydY2h4YHl_fUyuxm_mylj4JFCGlhVijG7EbjpSpyCy_vwseY1liDeu8MBvmV-Y-doopfC8SujT3Ces1b7XJlFXndFRq2E0hjYEkm-Ff4BDhLb8McRvqCz2KeYlVxQ5pK8evMEgnh1bHe_BYFhrVqgM29hAQ52onYTbDnTQAhBoItx1ic30oUWAutQbPykMTbVTGxN8QqCa3IBjBO7WN217bgdvHN4l-bsiDpfBYnlZZ_S1aRN6dSWWSvL0kft7K3f-f_PHV4BIweqit0Gpzqpg-ffuXz0hzClZcZKFyxfYqzKl-UztJUUFdaW471FolG278GH7bdfBKZeiaUi-CjFso0FpHYrYqu47PKGOXxGcTjFWzl2D3lbhNtHPZhw6WB0j0bmNWygVz3JME95_0oY6T4cY8akJoRKsXwTCL-6TiIktH1TjdWTXUXSC0eCE9Rzg9W4rn7PxQSN4OpVT=w1920-h886"
                class="logo" alt="Organization Logo">
            <h1>We Regret To Inform Tou That Your Registration Rejected</h1>
        </div>

        <div class="content">
            <p>Dear <strong style="color: #d32f2f;">${igl}</strong>,</p>
            <p>Your team registration for the, <strong>Summer Series Season 2</strong> could not be approved at this
                time,Check Rejected Reason.</p>

            <div class="team-details">
                <img src="${teamlogo}"
                    class="team-logo" alt="Team Logo">
                <h3 style="text-align: center; color: #d32f2f; margin: 16px 0;">Team: <strong>${teamname}</strong></h3>

                <ul class="player-list">
                ${players.map((player, i) => `
                    <li>
                        <span>Player ${++i}:⠀</span>
                        <span>⠀${player.name}</span>
                    </li>
                `).join('')}

                <li>
                    <span>Current Team Email:⠀</span>
                    <span>⠀${email}</span>
                </li>
                </ul>
            </div>

            <div class="important-note">
                <strong id ="#reason" style="color: #d32f2f;">❗Rejection Reasons:</strong>
                <p style="margin: 12px 0;">${reason}<br></p>
                <span class="badge">Resubmit Form </span>
                <span class="badge">Contect Us</span>
            </div>

            <p style="text-align: center; margin-top: 32px;">
                For clarification or appeal, contact:<br>
                <strong style="color: #d32f2f;">support@onedreamesports.games</strong>
            </p>
        </div>

        <div class="footer">
            <p>Organized by One Dream Esports<br>
                <small>Official Tournament Partner Of Krafton</small>
            </p>
        </div>
    </div>
</body>

</html>`
}



const approveHtmlApp = (name, role)=> {
   return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations! You've Been Selected</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #e8f5e9;
            margin: 0;
            padding: 40px 0;
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 640px;
            background: #caf1ba;
            border-radius: 32px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(76, 175, 80, 0.1);
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: "";
            position: absolute;
            top: -100px;
            right: -100px;
            width: 250px;
            height: 250px;
            background: rgba(76, 175, 80, 0.1);
            border-radius: 50%;
        }

        .container::after {
            content: "";
            position: absolute;
            bottom: -80px;
            left: -80px;
            width: 180px;
            height: 180px;
            background: rgba(76, 175, 80, 0.15);
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
            border: 3px solid #4caf50;
            padding: 4px;
            margin-bottom: 24px;
        }

        h1 {
            color: #2e7d32;
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

        .highlight {
            background: #c8e6c9;
            border-radius: 24px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #e0e8e0;
        }

        .badge {
            display: inline-block;
            background: #4caf50;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease-in-out;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
            margin-top: 12px;
            text-decoration: none;
        }

        .badge:hover {
            background: #388e3c;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
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
            <img src="https://drive.usercontent.google.com/download?id=1ETznVai4IVa28jTIkHyUkxyHaCmET5qn&export=view&authuser=0" class="logo" alt="Organization Logo">
            <h1>Congratulations! You've Been Selected</h1>
        </div>

        <div class="content">
            <p>Dear <strong style="color: #2e7d32;">${name}</strong>,</p>
            <p>We are excited to inform you that you have been approved for the One Dream Esports management team as <strong>${role}</strong>!</p>

            <div class="highlight">
                <strong style="color: #2e7d32;">✔ Next Steps:</strong>
                <p>To proceed, please join our Discord server and enter the <strong>Staff Apply Voice</strong>.</p>
                <p>You can also tag <strong>@! 𝐎𝐃〢SHIVAM</strong> to get your work role assigned.</p>
                <a href="https://discord.gg/WVThZG7Q5X" class="badge">Join Discord</a>
                <a href="https://discord.com/channels/796233555990020116/1079759312760610866" class="badge">Join Staff Voice</a>
            </div>

            <p style="text-align: center; margin-top: 32px;">
                If you have any questions, contact:<br>
                <strong style="color: #2e7d32;">support@onedreamesports.games</strong>
            </p>
        </div>

        <div class="footer">
            <p>Regards,<br>
                <small>Team One Dream Management</small>
            </p>
        </div>
    </div>
</body>
</html>`
}

const rejectHtmlApp = (name, reason) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Update - One Dream Esports</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #ffebee;
            margin: 0;
            padding: 40px 0;
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 640px;
            background: #ffcdd2;
            border-radius: 32px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(244, 67, 54, 0.1);
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: "";
            position: absolute;
            top: -100px;
            right: -100px;
            width: 250px;
            height: 250px;
            background: rgba(244, 67, 54, 0.1);
            border-radius: 50%;
        }

        .container::after {
            content: "";
            position: absolute;
            bottom: -80px;
            left: -80px;
            width: 180px;
            height: 180px;
            background: rgba(244, 67, 54, 0.15);
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
            border: 3px solid #d32f2f;
            padding: 4px;
            margin-bottom: 24px;
        }

        h1 {
            color: #d32f2f;
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

        .highlight {
            background: #ef9a9a;
            border-radius: 24px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #e57373;
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
            <img src="https://lh3.googleusercontent.com/fife/ALs6j_H3hzxkjG8DcgVvpDnyIJUp3zbYkqQtVlCk4ufrLjeex1GUfHDskO0qBF2CiECg8iN-eXO_ykbDM-DHlB4E6kxuJxCHBbp534uJ8pmVPEbNk2nGScL7mlfobpBJGV7_rccYuvvCRjM6cpfe5rjihugBi0TRMI6DF0KmkC7MQgWh5zDMXXhBDflmYBp2veRX7MTgmS7jm24y1tcWfNKRGrS6euQpyJeJkGTmCnXuzVfp3gyl2WP0vEeXHXoyHh6c5ZQOWsNq9s1r4-KYhdsOOAAiKBROGGN-6ChCFtnXtj7mFZimFg57jZ07c_FMoLb6ZoH5lsus3PoAZfSS0FgVayLjL0Uy7GRYvyHnHbUE1UuuJ2_Ps4TykDfibFgbl0qE7Gjggq8rHJyuyPPcV9ELWD-5M6sFQDIdA2_V1acguztubIM3z2wcOfp7emYuhnh1hlgcCCEI7Nm0xG6T1atTWzkUCdBbvvZYMFKpk9W5SUs1XbU453fzjVVBsXm9Rr3l8BHhQUZQXKeob-tubQjhy7F11eSJq0sJ7RB_dTy9kSLnZVKxLpDtrzrVgrnzvfS6zgs-MB6xxVXLQv6Ua3yrEjvP0967A98CFdBlFyIAJAbUcT0fPbrTmpqfewwD_kQ99lW2RqbCBwbSJgp7nc_aaLOStXUMLDAS8aFW27fqyHmu-55gqsxI5yJUmT5WHfU7l6qPB-rgOD2JeD0ERS9853em9hpmCDlDXEuIGmyGXROz5i4XqlC1s4IXPz3nZGKJrBfL5ci9XqGv8pNCWe0z_WMgfDR7ivrAYjFm-k_t4sI3QfGWDH9m8vgmPCOpPEOTOl9M_uwfRQEcdThaICXu_TwTmYg6i4dd4g5i3n0Z5-URrfOMsePsW02ZJgFuW_WeTWkBMMwqtmHLilG54fs4WchBIvHmLVD7EIhFufLXIp-iqoj_KLtyC_W-zqglErBf9-lxCva6JXekL7lhO1y2Nl__rkeVweUvmpCFfKGdGyr0mSF1LTHhJEOtqjWl-sSIFDTb8TcSnDZnAG_6Ek_MKmMOLSY_RAnCCbpkXLeT9JwijcKXW5p3b9u8an5HR8ezsI_6lO_cMYMopwuLtXYL63pT9LuE3BfIfwgR5S_-2AmD5Hyl8gl5ieVZtjjDeJ82DpKgyW_uPpVVKN3qTlMQ7uwS-h78HGkpbbmcJQydY2h4YHl_fUyuxm_mylj4JFCGlhVijG7EbjpSpyCy_vwseY1liDeu8MBvmV-Y-doopfC8SujT3Ces1b7XJlFXndFRq2E0hjYEkm-Ff4BDhLb8McRvqCz2KeYlVxQ5pK8evMEgnh1bHe_BYFhrVqgM29hAQ52onYTbDnTQAhBoItx1ic30oUWAutQbPykMTbVTGxN8QqCa3IBjBO7WN217bgdvHN4l-bsiDpfBYnlZZ_S1aRN6dSWWSvL0kft7K3f-f_PHV4BIweqit0Gpzqpg-ffuXz0hzClZcZKFyxfYqzKl-UztJUUFdaW471FolG278GH7bdfBKZeiaUi-CjFso0FpHYrYqu47PKGOXxGcTjFWzl2D3lbhNtHPZhw6WB0j0bmNWygVz3JME95_0oY6T4cY8akJoRKsXwTCL-6TiIktH1TjdWTXUXSC0eCE9Rzg9W4rn7PxQSN4OpVT=w1920-h886" class="logo" alt="Organization Logo">
            <h1>Your Staff Application Rejected</h1>
        </div>

        <div class="content">
            <p>Dear <strong style="color: #d32f2f;">${name}</strong>,</p>
            <p>We appreciate your interest in joining the One Dream Esports management team. However, after reviewing your application, we regret to inform you that we will not be proceeding with your selection at this time.</p>

            <div class="highlight">
                <strong style="color: #d32f2f;">⚠ Reason for Rejection:</strong>
                <p>${reason}</p>
                <p>You are always welcome to reapply in the future when applications reopen.</p>
            </div>

            <p style="text-align: center; margin-top: 32px;">
                If you have any questions, contact:<br>
                <strong style="color: #d32f2f;">support@onedreamesports.games</strong>
            </p>
        </div>

        <div class="footer">
            <p>Regards,<br>
                <small>Team One Dream Management</small>
            </p>
        </div>
    </div>
</body>
</html>`
}

export const sendMail = async (to, subject, data, type, content, reason) => {
    let html;
    if (type === "approve") {
        html = approveHtml(data)
    }

    if (type === "reject") {
        html = rejectHtml(data, reason)
    }

    if (type === "approveApp") {
        html = approveHtmlApp(data.name, data.role)
    }

    if (type === "rejectApp") {
        html = rejectHtmlApp(data.name, reason)
    }


    try {
        const res = await transporter.sendMail({
            from: "no-reply@onedreamesports.games",
            to,
            subject,
            ...(html && { html }),
            ...(content && { text: content }),
        });

        return res;
    } catch (error) {
        console.log(error);
        return error;
    }
}   