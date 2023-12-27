const sqlite3 = require('sqlite3').verbose();
const dbName = 'MyDatabase.db';
const db = new sqlite3.Database(dbName);

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS conversations (user_number TEXT, conversation_id TEXT, user_id TEXT, actor_id TEXT PRIMARY KEY, channel_id TEXT, agent_id TEXT)");

  // Optionally insert a sample record
  db.run("INSERT OR IGNORE INTO conversations (user_number, conversation_id, user_id, actor_id, channel_id, agent_id) VALUES (?, ?, ?, ?, ?, ?)", 
         ['1234567890', 'conv123', 'user123', 'actor123', 'sampleChannelId', 'sampleAgentId']);
});

db.close();
