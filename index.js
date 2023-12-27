require('dotenv').config()
const express = require('express')
const axios = require('axios');
const readline = require('readline');
const ngrok = require('ngrok');
const sqlite3 = require('sqlite3').verbose();

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const db = new sqlite3.Database('MyDatabase.db');

app.get('/', (req, res)=>{
  console.log('test');
  res.send('Hello!');
  res.status(200);
})

// App webhook handler
app.post('/handlechatfromfreshchat', (req, res)=>{
  console.log('Message from Agent :', req.body.data.message.message_parts[0].text.content)
  res.sendStatus(200);
})

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prompt(){
    rl.question("\nMessage from User to freshchat [space] user_ID : ", function(userMessage) {

      db.get("SELECT channel_id, agent_id, actor_id, user_id FROM conversations WHERE user_id = ?", [userMessage.slice(-36)], function(err, row) {
        if (err) {
            console.error(err.message);
            return;
        }

        let user_id;

        if (row) {
            // Record exists, use the retrieved channel_id and agent_id
            user_id=row.user_id;
        } else {
            // Record doesn't exist, create a new entry
            user_id = userMessage.slice(-36)

            db.run("INSERT INTO conversations (user_id, channel_id, agent_id) VALUES (?, ?, ?)", 
                   [user_id], function(insertErr) {
                if (insertErr) {
                    console.error(insertErr.message);
                    return;
                }
            });
        }})


      var config = {
        method: 'post',
        url: 'https://self-656778577534933225-91d58a31ee227ba17029357.freshchat.com/v2/conversations/',
        headers: {
          'Authorization': `Bearer key`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        data : `{
            "status": "new",
            "messages": [
                {
                    "message_parts": [
                        {
                            "text": {
                                "content": "${userMessage.slice(0,userMessage.length-36)}"
                            }
                        }
                    ],
                    "channel_id": "8f669f93-e036-40f9-9860-9c0b34c62c13",
                    "message_type": "normal",
                    "actor_type": "user",
                    "actor_id" : "${userMessage.slice(-36)}"
                    }
            ],
            "channel_id": "8f669f93-e036-40f9-9860-9c0b34c62c13",
            "assigned_org_agent_id": "656778578312177596",
            "assigned_agent_id": "37c8e338-d908-4672-be03-8eea2b605c27",
            "users": [
                {
                    "id": "${userMessage.slice(-36)}"
                }
            ]
        }`
      };

      console.log(config)
    
      axios(config)
      .then(function (response) {
        console.log(config);
        // console.log(JSON.stringify(response.data));
        })
      .catch(function (error) {
        console.log(error);
      });

      if(userMessage == 'exit'){
          rl.close();
          db.close();
          return
      }
      else{
          prompt()
      }
    });
  }

  prompt()
