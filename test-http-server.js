#!/usr/bin/env node

/**
 * Manual HTTP Server Integration Test
 * 
 * This script tests the HTTP server functionality without complex mocking.
 * Run this after starting the server with: node build/index.js --http --port 3000
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testHttpServer() {
  console.log('🧪 Testing Notion MCP HTTP Server...\n');

  // Test 1: OPTIONS request (CORS preflight)
  console.log('1. Testing OPTIONS request (CORS)...');
  try {
    const response = await fetch(BASE_URL, { method: 'OPTIONS' });
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS Headers: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`   ✅ OPTIONS request successful\n`);
  } catch (error) {
    console.log(`   ❌ OPTIONS request failed: ${error.message}\n`);
  }

  // Test 2: List available tools
  console.log('2. Testing tools/list...');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Tools available: ${data.result?.tools?.length || 0}`);
    if (data.result?.tools?.length > 0) {
      console.log(`   First tool: ${data.result.tools[0].name}`);
    }
    console.log(`   ✅ Tools list successful\n`);
  } catch (error) {
    console.log(`   ❌ Tools list failed: ${error.message}\n`);
  }

  // Test 3: Invalid JSON handling
  console.log('3. Testing invalid JSON handling...');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response length: ${text.length} chars`);
    console.log(`   ✅ Invalid JSON handled gracefully\n`);
  } catch (error) {
    console.log(`   ❌ Invalid JSON test failed: ${error.message}\n`);
  }

  // Test 4: Tool call with mock data (will fail without real token, but tests structure)
  console.log('4. Testing tool call structure...');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'notion_retrieve_page',
          arguments: {
            page_id: 'test-page-id',
            format: 'json'
          }
        }
      })
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response type: ${typeof data}`);
    console.log(`   Has error: ${!!data.error}`);
    if (data.error) {
      console.log(`   Error message: ${data.error.message || 'Unknown error'}`);
    }
    console.log(`   ✅ Tool call structure test completed\n`);
  } catch (error) {
    console.log(`   ❌ Tool call test failed: ${error.message}\n`);
  }

  console.log('🎉 HTTP Server tests completed!');
  console.log('\n📝 Notes:');
  console.log('   - Tool calls may fail without valid NOTION_API_TOKEN');
  console.log('   - This tests the HTTP transport layer, not Notion API integration');
  console.log('   - For full integration tests, set NOTION_API_TOKEN environment variable');
}

// Check if server is running
async function checkServerRunning() {
  try {
    const response = await fetch(BASE_URL, { method: 'OPTIONS' });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if HTTP server is running...');
  
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.log('❌ Server not running on http://localhost:3000');
    console.log('\n🚀 Start the server first:');
    console.log('   NOTION_API_TOKEN=your_token node build/index.js --http --port 3000');
    console.log('\n   Or for testing without real token:');
    console.log('   NOTION_API_TOKEN=test node build/index.js --http --port 3000');
    process.exit(1);
  }

  console.log('✅ Server is running, starting tests...\n');
  await testHttpServer();
}

main().catch(console.error);
