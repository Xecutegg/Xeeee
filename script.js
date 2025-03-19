const API_URL = "https://vercel-api-xeeee.vercel.app/";
const API_KEY = "marjaamadarchod";

function onSubmit(e) {
  const data = e.namedValues;
    
    const option = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(data),
   };
    const res = UrlFetchApp.fetch(API_URL+"save-registration", option);
    const mongo = JSON.parse(res);
    




  const teamname = data["Team Name"][0];
  const email = data["Email Address"][0];
  const iglname = data["Team Leader Name"][0];
  const iglno = data["Team Leader Contact (WhatsApp)"][0];
  function getDirectDriveLink(link) {
    const match = link.match(/(?:drive\.google\.com\/.*id=|\/d\/|file\/d\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : null;
}
const logo = getDirectDriveLink(data["Team Logo"][0]);

const players = [];

function formatURL(value) { if (!value.startsWith("http")) { return "https://" + value.replace(/\s+/g, "-");}
return value;}
  

for (let i = 1; i <= 5; i++) {
  const nameKey = `Player ${i} In Game Name`;
  const idKey = `Player ${i} UID`;
  const noKey = `Player ${i} Contact (WhatsApp)`
  const ytKey = `Player ${i} YouTube Channel Screenshot`
  const igKey =  `Player ${i} Instagram Profile Screenshot`


  const playerName = data[nameKey][0];
  const playerID = data[idKey][0];
  const playerNo = i === 1 ? iglno : data[noKey][0];
  const ytss = getDirectDriveLink(formatURL(data[ytKey][0]));
  const igss = getDirectDriveLink(formatURL(data[igKey][0]));

  if (playerName && playerID) {
    players.push(`**\`PLAYER ${i}:\`** [\`${playerName}\`](https://vercel-api-xeeee.vercel.app/getUsername?id=${playerID}) - [\`${playerNo}\`](https://wa.me/+91${playerNo}) - [\`YtSS\`](${ytss}),[\`IgSS\`](${igss})`);
  }
}

  console.log(players)
  const payload = {
    content: `[${email}](https://wa.me/+91${iglno})`, 
    embeds: [
      {
        title: `TEAM NAME: ${teamname.toUpperCase()}`,
        description: `IGL: ${iglname}\n\n`+players.join("\n"),
        timestamp: new Date().toISOString(),
        thumbnail: { url: logo,}
      },
    ],
    buttons: [
      {
        label: "Approve",
        style: 3,
        custom_id: `approve_${mongo.data._id}`,
      },
      {
        label: "Reject",
        style: 4,
        custom_id: `reject_${mongo.data._id}`,
      },
      {
        label: "Send Custom Email",
        style: 2,
        custom_id: `email_${mongo.data._id}`,
      },
      {
        label: "Send Custom Whatsapp",
        style: 2,
        custom_id: `whatsapp_${mongo.data._id}`,
      }
      ],
  };


  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json", // Ensuring correct Content-Type header
    },
    payload: JSON.stringify(payload), // Use `payload` instead of `body`
  };

  try {
    UrlFetchApp.fetch(API_URL+"sendMessage", options);
  } catch (error) {
    Logger.log("Error: " + error.toString());
  }
}





// function Submit(e) {


//     const response = e.response.getItemResponses();

//     Logger.log(JSON.stringify(e, null, 2))
// const form = FormApp.getActiveForm();
//   const allResponses = form.getResponses();
//   const formResponseRaw = JSON.stringify(form, null, 2);



  // const payload = {
  //   content: "```json\n" + formResponseRaw + "\n```", 
  //   embeds: [
  //     {
  //       title: "Test Message",
  //       description: "This is a test message sent via the Express API.",
  //       timestamp: new Date().toISOString(),
  //     },
  //   ],
  //   buttons: [
  //     {
  //       label: "Click Me",
  //       style: 1,
  //       custom_id: "click_me",
  //     },
  //     {
  //       label: "Visit Website",
  //       style: 5,
  //       url: "https://example.com",
  //     },
  //   ],
  // };

  // const options = {
  //   method: "post",
  //   contentType: "application/json",
  //   headers: {
  //     "x-api-key": API_KEY,
  //     "Content-Type": "application/json", // Ensuring correct Content-Type header
  //   },
  //   payload: JSON.stringify(payload), // Use `payload` instead of `body`
  // };

  // try {
  //   const response = UrlFetchApp.fetch(API_URL, options);
  //   Logger.log(FormApp); // Log response for debugging
  // } catch (error) {
  //   Logger.log("Error: " + error.toString());
  // }
// }
