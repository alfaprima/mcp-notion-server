# HTTP Server Test Harness Documentation

This document describes the comprehensive test harness for the HTTP implementation of the Notion MCP Server.

## Overview

The HTTP server implementation adds REST API capabilities to the existing MCP server, enabling direct HTTP access to Notion tools via JSON-RPC over HTTP.

## Test Categories

### 1. Server Initialization Tests

#### Test: HTTP Server Startup

- **Purpose**: Verify HTTP server starts correctly on specified port
- **Expected Behavior**: 

  - Server listens on specified port (default: 3000)
  - Returns HTTP server instance
  - Logs startup message

- **Test Command**: 

  ```bash
  # Manual test - start server and verify it's listening
  NOTION_API_TOKEN=test node build/index.js --http --port 3000
  ```

**Test: Custom Port Configuration**

- **Purpose**: Verify server accepts custom port configuration
- **Expected Behavior**: Server starts on custom port (e.g., 8080)
- **Test Command**:

  ```bash
  NOTION_API_TOKEN=test node build/index.js --http --port 8080
  ```

### 2. Transport Layer Tests

**Test: StreamableHTTPServerTransport Initialization**

- **Purpose**: Verify MCP HTTP transport is properly configured
- **Expected Behavior**:

  - Transport created with session management
  - Session ID generator function provided
  - Session initialization callback configured

**Test: Session Management**

- **Purpose**: Verify unique session ID generation and logging
- **Expected Behavior**:

  - Each session gets unique UUID
  - Session initialization is logged
  - Sessions are properly tracked

### 3. HTTP Request Handling Tests

**Test: CORS Headers**

- **Purpose**: Verify proper CORS configuration for cross-origin requests
- **Expected Behavior**:

  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

**Test: OPTIONS Request Handling**

- **Purpose**: Verify preflight requests are handled correctly
- **Expected Behavior**:

  - OPTIONS requests return 200 status
  - Proper CORS headers included
  - No body processing

**Test: POST Request Body Parsing**

- **Purpose**: Verify JSON request bodies are parsed correctly
- **Expected Behavior**:

  - Valid JSON is parsed and passed to transport
  - Invalid JSON is passed as raw string
  - Empty bodies are handled gracefully

**Test: Error Handling**

- **Purpose**: Verify proper error responses
- **Expected Behavior**:

  - Transport errors return 500 status
  - Error responses include JSON error message
  - Headers not sent twice if already sent

### 4. Integration Tests

**Test: JSON-RPC Tool Calls**

- **Purpose**: Verify end-to-end tool execution via HTTP
- **Test Data**:

  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "notion_retrieve_page",
      "arguments": {
        "page_id": "test-page-id",
        "format": "markdown"
      }
    }
  }
  ```

- **Expected Behavior**:
  - Request processed by MCP server
  - Notion API called with correct parameters
  - Response returned in requested format

**Test: Tool Filtering**

- **Purpose**: Verify enabled tools filtering works with HTTP transport
- **Expected Behavior**:

  - Only enabled tools are available
  - Disabled tools return appropriate errors

### 5. Manual Testing Procedures

#### Basic HTTP Server Test

```bash
# 1. Start the server
NOTION_API_TOKEN=your_token node build/index.js --http --port 3000

# 2. Test server is running
curl -X OPTIONS http://localhost:3000

# 3. Test JSON-RPC call
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

#### Session Management Test

```bash
# 1. Make a request and note session ID in response headers
curl -v -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'

# 2. Check server logs for session initialization message
```

#### Error Handling Test

```bash
# 1. Test invalid JSON
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# 2. Test malformed JSON-RPC
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"invalid": "request"}'
```

### 6. Performance Tests

**Test: Concurrent Requests**

- **Purpose**: Verify server handles multiple simultaneous requests
- **Method**: Use tools like `ab` or `wrk` to send concurrent requests
- **Expected Behavior**: Server responds to all requests without errors

**Test: Large Payloads**

- **Purpose**: Verify server handles large request/response bodies
- **Method**: Send requests with large JSON payloads
- **Expected Behavior**: Requests processed without memory issues

### 7. Security Tests

**Test: Input Validation**

- **Purpose**: Verify malicious inputs are handled safely
- **Method**: Send various malformed/malicious payloads
- **Expected Behavior**: Server doesn't crash or expose sensitive data

#### Test: Rate Limiting

- **Purpose**: Verify server can handle request flooding
- **Method**: Send rapid successive requests
- **Expected Behavior**: Server remains responsive

## Test Implementation Status

✅ **Completed**: Basic server startup test
✅ **Completed**: HTTP server configuration test
❌ **Pending**: Full integration tests with mocked Notion API
❌ **Pending**: Error handling tests
❌ **Pending**: Performance tests
❌ **Pending**: Security tests

## Running Tests

### Unit Tests

```bash
npm test
```

### Manual Integration Tests

```bash
# Start server
NOTION_API_TOKEN=test_token node build/index.js --http

# Run test scripts (to be created)
./test/integration/http-tests.sh
```

### Load Testing

```bash
# Install Apache Bench
# Test concurrent requests
ab -n 100 -c 10 -H "Content-Type: application/json" \
   -p test-payload.json http://localhost:3000/
```

## Test Data Files

Create these files in `test/data/`:

- `valid-tool-call.json` - Valid JSON-RPC tool call
- `invalid-json.txt` - Invalid JSON for error testing
- `large-payload.json` - Large JSON payload for performance testing

## Continuous Integration

Add to CI pipeline:
1. Unit tests (existing)
2. HTTP server startup test
3. Basic integration test with mock Notion API
4. Performance regression test

## Notes

- HTTP tests require careful mocking of Node.js HTTP modules
- Integration tests should use test Notion workspace
- Performance tests should establish baseline metrics
- Security tests should be run in isolated environment
