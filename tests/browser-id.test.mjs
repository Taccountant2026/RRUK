import test from 'node:test';
import assert from 'node:assert/strict';
import {browserId} from '../lib/browser-id.mjs';

test('request IDs work in an HTTP preview where randomUUID is unavailable', () => {
  const source = {getRandomValues(bytes) { return crypto.getRandomValues(bytes); }};
  const first = browserId(source), second = browserId(source);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(first, second);
  assert.throws(() => browserId({}), /cannot create/);
});
