const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5001';

async function testSSESynchronization() {
  console.log('📡 Starting Real-Time Multi-Client SSE Synchronization Test...');

  // Step 1: Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ojt.edu', password: 'admin123' })
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;

  // Step 2: Connect Student SSE Listener via standard HTTP request
  const receivedEvents = [];

  const req = http.request('http://localhost:5001/api/sync/events', {
    method: 'GET',
    headers: { 'Accept': 'text/event-stream' }
  }, (res) => {
    res.on('data', (chunk) => {
      const text = chunk.toString();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            receivedEvents.push(parsed);
          } catch (e) {}
        }
      }
    });
  });

  req.end();

  // Wait 500ms for connection to establish
  await new Promise(r => setTimeout(r, 500));

  // Step 3: Admin creates a new question
  console.log('1. Admin creates a new question "Fibonacci Sequence Generator"...');
  const createQRes = await fetch(`${BASE_URL}/api/admin/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Fibonacci Sequence Generator',
      difficulty: 'Easy',
      topic: 'Recursion & Dynamic Programming',
      description: 'Compute the Nth Fibonacci number where F(0)=0, F(1)=1.',
      input_format: 'Single integer N',
      output_format: 'Single integer F(N)',
      constraints: '0 <= N <= 30',
      sample_input: '6',
      sample_output: '8',
      hidden_input: '10',
      hidden_output: '55',
      is_published: 1
    })
  });
  assert.strictEqual(createQRes.status, 201);
  const createdQData = await createQRes.json();
  const newQuestionId = createdQData.question.id;

  // Wait 600ms for SSE event delivery
  await new Promise(r => setTimeout(r, 600));

  const createEvent = receivedEvents.find(e => e.type === 'question_updated' && e.data?.action === 'create' && e.data?.questionId === newQuestionId);
  assert.ok(createEvent, 'Student received question_updated (create) event via SSE');
  console.log('✅ Student received real-time SSE event for Question Creation:', createEvent.data.question.title);

  // Step 4: Admin toggles publish status (unpublish to draft)
  console.log('2. Admin toggles publication to draft...');
  const toggleRes = await fetch(`${BASE_URL}/api/admin/questions/${newQuestionId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(toggleRes.status, 200);

  await new Promise(r => setTimeout(r, 600));

  const toggleEvent = receivedEvents.find(e => e.type === 'question_updated' && e.data?.action === 'toggle' && e.data?.questionId === newQuestionId);
  assert.ok(toggleEvent, 'Student received question_updated (toggle) event via SSE');
  assert.strictEqual(toggleEvent.data.is_published, false);
  console.log('✅ Student received real-time SSE event for Question Publication Toggle (is_published: false)');

  // Step 5: Admin deletes the question
  console.log('3. Admin deletes the question...');
  const deleteQRes = await fetch(`${BASE_URL}/api/admin/questions/${newQuestionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(deleteQRes.status, 200);

  await new Promise(r => setTimeout(r, 600));

  const deleteEvent = receivedEvents.find(e => e.type === 'question_updated' && e.data?.action === 'delete' && e.data?.questionId === newQuestionId);
  assert.ok(deleteEvent, 'Student received question_updated (delete) event via SSE');
  console.log('✅ Student received real-time SSE event for Question Deletion');

  // Terminate SSE listener
  req.destroy();

  console.log('\n====================================================');
  console.log('🎉 REAL-TIME GLOBAL SSE SYNCHRONIZATION TEST PASSED!');
  console.log('====================================================');
}

testSSESynchronization().catch(err => {
  console.error('❌ SSE Sync Test failed:', err);
  process.exit(1);
});
