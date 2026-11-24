const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../database');
const { generateMentorResponse } = require('../services/aiService');

async function chat(req, res) {
  try {
    const { conversationId, message, code = '', language = 'python', error = '', stdout = '' } = req.body;
    const userId = req.user ? req.user.id : 'guest';

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    let activeConvId = conversationId;

    // Check if conversation exists or create new
    if (activeConvId) {
      const conv = await dbGet('SELECT id FROM ai_conversations WHERE id = ?', [activeConvId]);
      if (!conv) {
        activeConvId = null;
      }
    }

    if (!activeConvId) {
      activeConvId = uuidv4();
      const title = message.slice(0, 45) + (message.length > 45 ? '...' : '');
      await dbRun(
        `INSERT INTO ai_conversations (id, user_id, title, language, code_context, error_context)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [activeConvId, userId, title, language, code.slice(0, 4000), (error || '').slice(0, 2000)]
      );
    } else {
      // Update updated_at
      await dbRun(
        `UPDATE ai_conversations 
         SET updated_at = CURRENT_TIMESTAMP, code_context = ?, error_context = ?, language = ?
         WHERE id = ?`,
        [code.slice(0, 4000), (error || '').slice(0, 2000), language, activeConvId]
      );
    }

    // Save user message
    const userMsgId = uuidv4();
    await dbRun(
      `INSERT INTO ai_messages (id, conversation_id, sender, message) VALUES (?, ?, ?, ?)`,
      [userMsgId, activeConvId, 'user', message.trim()]
    );

    // Fetch previous thread messages for context
    const previousMessages = await dbAll(
      `SELECT sender, message FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10`,
      [activeConvId]
    );

    // Generate AI response
    const aiResult = await generateMentorResponse({
      prompt: message,
      code,
      language,
      error,
      stdout,
      history: previousMessages
    });

    // Save assistant message
    const assistantMsgId = uuidv4();
    await dbRun(
      `INSERT INTO ai_messages (id, conversation_id, sender, message, suggested_code)
       VALUES (?, ?, ?, ?, ?)`,
      [assistantMsgId, activeConvId, 'assistant', aiResult.message, aiResult.suggestedCode || null]
    );

    res.json({
      conversationId: activeConvId,
      messageId: assistantMsgId,
      reply: aiResult.message,
      suggestedCode: aiResult.suggestedCode,
      engine: aiResult.engine,
      model: aiResult.model,
      sender: 'assistant'
    });
  } catch (err) {
    console.error('AI chat controller error:', err);
    res.status(500).json({ error: 'AI Assistant error: ' + err.message });
  }
}

async function getConversations(req, res) {
  try {
    const userId = req.user ? req.user.id : 'guest';
    const conversations = await dbAll(
      `SELECT id, title, language, updated_at, created_at 
       FROM ai_conversations 
       WHERE user_id = ? 
       ORDER BY updated_at DESC 
       LIMIT 30`,
      [userId]
    );
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
}

async function getConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = await dbGet('SELECT * FROM ai_conversations WHERE id = ?', [id]);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const messages = await dbAll(
      `SELECT id, sender, message, suggested_code, created_at 
       FROM ai_messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({ conversation, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}

async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM ai_messages WHERE conversation_id = ?', [id]);
    await dbRun('DELETE FROM ai_conversations WHERE id = ?', [id]);
    res.json({ message: 'Conversation deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
}

module.exports = {
  chat,
  getConversations,
  getConversation,
  deleteConversation
};
