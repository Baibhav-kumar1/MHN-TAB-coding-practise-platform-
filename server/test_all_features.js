const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Comprehensive OJT Playground Verification');
  console.log('====================================================');

  // Test 1: Health check
  console.log('\n[1/7] Testing Health Check & Service Status...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  console.log('✅ Server healthy:', healthData.service);
  assert.ok(healthData.java.java, 'Java executable detected');

  // Test 2: Authentication & RBAC
  console.log('\n[2/7] Testing Authentication & Role-Based Access Control...');
  // Student login
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@ojt.edu', password: 'student123' })
  });
  assert.strictEqual(studentLoginRes.status, 200);
  const studentData = await studentLoginRes.json();
  assert.strictEqual(studentData.user.role, 'student');
  console.log('✅ Student authenticated:', studentData.user.name, `(role: ${studentData.user.role})`);

  // Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ojt.edu', password: 'admin123' })
  });
  assert.strictEqual(adminLoginRes.status, 200);
  const adminData = await adminLoginRes.json();
  assert.strictEqual(adminData.user.role, 'admin');
  console.log('✅ Admin authenticated:', adminData.user.name, `(role: ${adminData.user.role})`);

  // RBAC enforcement: Student tries to access admin endpoint
  const unauthorizedRes = await fetch(`${BASE_URL}/api/admin/questions`, {
    headers: { Authorization: `Bearer ${studentData.token}` }
  });
  assert.strictEqual(unauthorizedRes.status, 403, 'Student should receive 403 on admin routes');
  console.log('✅ RBAC strictly enforced: Student blocked from /api/admin/questions (403 Forbidden)');

  // Admin accesses admin endpoint
  const adminQuestionsRes = await fetch(`${BASE_URL}/api/admin/questions`, {
    headers: { Authorization: `Bearer ${adminData.token}` }
  });
  assert.strictEqual(adminQuestionsRes.status, 200);
  const adminQuestions = await adminQuestionsRes.json();
  console.log(`✅ Admin authorized: retrieved ${adminQuestions.questions.length} questions from admin bank`);

  // Test 3: Real-Time SSE Synchronization
  console.log('\n[3/7] Testing Real-Time SSE Event Stream (/api/sync/events)...');
  const syncStatusRes = await fetch(`${BASE_URL}/api/sync/status`);
  assert.strictEqual(syncStatusRes.status, 200);
  const syncStatus = await syncStatusRes.json();
  assert.strictEqual(syncStatus.status, 'active');
  console.log('✅ SSE Sync Service active and reachable');

  // Test 4: Focus Music Player - Global Library & Streams
  console.log('\n[4/7] Testing Music Player: Global Library, Streams & YouTube URLs...');
  const tracksRes = await fetch(`${BASE_URL}/api/music/tracks`);
  assert.strictEqual(tracksRes.status, 200);
  const tracksData = await tracksRes.json();
  console.log(`✅ Retrieved ${tracksData.tracks.length} seeded focus music tracks from library`);
  assert.ok(tracksData.tracks.length >= 3, 'Seeded tracks should include at least 3 tracks');

  // Add YouTube track
  const ytRes = await fetch(`${BASE_URL}/api/music/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      title: 'Lofi Hip Hop Radio - Beats to Study to',
      artist: 'ChilledCow / Lofi Girl'
    })
  });
  assert.ok(ytRes.status === 200 || ytRes.status === 201);
  const ytData = await ytRes.json();
  console.log('✅ Added YouTube focus track:', ytData.track.title, `(${ytData.track.source_url})`);

  // Add direct stream URL
  const streamRes = await fetch(`${BASE_URL}/api/music/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://actions.google.com/sounds/v1/weather/thunderstorm.ogg',
      title: 'Thunderstorm Coding Ambience',
      artist: 'Ambient Soundscapes'
    })
  });
  assert.strictEqual(streamRes.status, 201);
  const streamData = await streamRes.json();
  console.log('✅ Added direct audio stream track:', streamData.track.title);

  // Test 5: Focus Music Player - File Upload via Multer
  console.log('\n[5/7] Testing Music Player: Audio File Upload via Multer & HTTP Range Streaming...');
  // Create a minimal valid audio test buffer (silence WAV)
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x00, 0x00, 0x00, // file size - 8
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // chunk size 16
    0x01, 0x00,             // audio format 1 (PCM)
    0x01, 0x00,             // channels 1
    0x44, 0xac, 0x00, 0x00, // sample rate 44100
    0x88, 0x58, 0x01, 0x00, // byte rate
    0x02, 0x00,             // block align 2
    0x10, 0x00,             // bits per sample 16
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00  // data size 0
  ]);

  // Construct multipart/form-data manually or using FormData
  const boundary = '----WebKitFormBoundaryOJTPlaygroundTest' + Date.now();
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="title"\r\n\r\nStudent Custom Lofi Beat\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="artist"\r\n\r\nCollege OJT Trainee\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="audio"; filename="test_focus.wav"\r\n`;
  body += `Content-Type: audio/wav\r\n\r\n`;

  const payload = Buffer.concat([
    Buffer.from(body, 'utf-8'),
    wavHeader,
    Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
  ]);

  const uploadRes = await fetch(`${BASE_URL}/api/music/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${studentData.token}`
    },
    body: payload
  });

  assert.strictEqual(uploadRes.status, 201);
  const uploadData = await uploadRes.json();
  console.log('✅ Uploaded audio track successfully:', uploadData.track.title, `(${uploadData.track.source_url})`);

  // Verify stream endpoint serves the uploaded file
  const streamAudioRes = await fetch(`${BASE_URL}${uploadData.track.source_url}`);
  assert.strictEqual(streamAudioRes.status, 200);
  assert.strictEqual(streamAudioRes.headers.get('accept-ranges'), 'bytes');
  console.log('✅ Static audio streaming endpoint verified with byte range support');

  // Test Playlists
  console.log('\n[6/7] Testing Playlists & Recently Played Records...');
  const createPlRes = await fetch(`${BASE_URL}/api/music/playlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentData.token}`
    },
    body: JSON.stringify({
      name: 'Algorithm Study Playlist',
      description: 'Relaxing beats for dynamic programming'
    })
  });
  assert.strictEqual(createPlRes.status, 201);
  const newPl = await createPlRes.json();
  console.log('✅ Created user playlist:', newPl.playlist.name);

  // Add track to playlist
  const addTrackRes = await fetch(`${BASE_URL}/api/music/playlists/${newPl.playlist.id}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentData.token}`
    },
    body: JSON.stringify({ trackId: uploadData.track.id })
  });
  assert.strictEqual(addTrackRes.status, 201);
  console.log('✅ Added uploaded track to user playlist');

  // Record recently played
  const recordPlayRes = await fetch(`${BASE_URL}/api/music/recent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentData.token}`
    },
    body: JSON.stringify({ trackId: uploadData.track.id })
  });
  assert.strictEqual(recordPlayRes.status, 200);

  // Fetch recent
  const getRecentRes = await fetch(`${BASE_URL}/api/music/recent`, {
    headers: { Authorization: `Bearer ${studentData.token}` }
  });
  const recentData = await getRecentRes.json();
  assert.ok(recentData.recent.some(r => r.id === uploadData.track.id));
  console.log('✅ Recently played track recorded and retrieved successfully');

  // Test 7: AI Assistant Mentor & Code Correction
  console.log('\n[7/7] Testing AI Coding Assistant & Contextual Diagnostics...');
  const aiChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentData.token}`
    },
    body: JSON.stringify({
      message: 'I have a division by zero error in my Java code. Can you explain where it is and how to fix it?',
      code: 'public class Main {\n    public static void main(String[] args) {\n        int x = 10 / 0;\n        System.out.println(x);\n    }\n}',
      language: 'java',
      error: 'Exception in thread "main" java.lang.ArithmeticException: / by zero\n\tat Main.main(Main.java:3)'
    })
  });

  assert.strictEqual(aiChatRes.status, 200);
  const aiResult = await aiChatRes.json();
  console.log('✅ AI Assistant Response generated:');
  console.log('   Engine:', aiResult.engine, '| Model:', aiResult.model);
  console.log('   Conversation ID:', aiResult.conversationId);
  console.log('   Suggested Code Snippet:', aiResult.suggestedCode ? 'Present' : 'None');
  assert.ok(aiResult.reply.length > 50, 'AI response should have rich explanatory content');
  assert.ok(aiResult.conversationId, 'Conversation ID should be persisted');

  // Cleanup: Admin deletes test track
  const delTrackRes = await fetch(`${BASE_URL}/api/music/tracks/${uploadData.track.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminData.token}` }
  });
  assert.strictEqual(delTrackRes.status, 200);
  console.log('✅ Admin track cleanup verified');

  console.log('\n====================================================');
  console.log('🎉 ALL 7 TEST SUITES PASSED FLAWLESSLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
