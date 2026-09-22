import assert from 'node:assert/strict';
import { createApp } from './app.js';

const { app, repository } = createApp();
const server = app.listen(0);
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Smoke test server did not start');
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');

  const invalid = await fetch(`${baseUrl}/api/ai/demand`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
  assert.equal(invalid.status, 400);

  const recommendation = await fetch(`${baseUrl}/api/ai/farmer-copilot`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ farmerId: 'f-101', farmerName: 'Ramesh Mondal', location: 'South 24 Parganas', soilType: 'Loamy soil', waterAvailability: 'Moderate water' }) });
  assert.equal(recommendation.status, 200);
  const recommendationBody = await recommendation.json() as { mode: string; recommended_crops: unknown[] };
  assert.equal(recommendationBody.mode, 'prototype');
  assert.ok(recommendationBody.recommended_crops.length > 0);

  const demand = await fetch(`${baseUrl}/api/ai/demand`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ crop: 'Tomato', supply: 1500, demand: 2400 }) });
  assert.equal(demand.status, 200);

  const forecast = await fetch(`${baseUrl}/api/ai/demand-forecast`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ crop: 'Tomato', location: 'South 24 Parganas', currentSupply: 1700, currentDemand: 2400, season: 'Current harvest season' }) });
  assert.equal(forecast.status, 200);
  const forecastBody = await forecast.json() as { crop: string; demandLevel: string; supplyDemandGap: number; mode: string };
  assert.equal(forecastBody.crop, 'Tomato');
  assert.equal(forecastBody.demandLevel, 'HIGH');
  assert.equal(forecastBody.supplyDemandGap, 700);
  assert.equal(forecastBody.mode, 'prototype');

  // Test Multilingual AI Chat
  const chatBn = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'আমি কী চাষ করব?', context: { location: 'South 24 Parganas' }, language: 'bn' }),
  });
  assert.equal(chatBn.status, 200);
  const chatBnBody = await chatBn.json() as { answer: string; mode: string; suggestedAction?: { type: string; route: string } };
  assert.equal(chatBnBody.mode, 'prototype');
  assert.ok(chatBnBody.answer.includes('টমেটো'));
  assert.equal(chatBnBody.suggestedAction?.type, 'crop_recommendation');

  const chatHi = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'मुझे क्या उगाना चाहिए?', context: { location: 'Hooghly' }, language: 'hi' }),
  });
  assert.equal(chatHi.status, 200);
  const chatHiBody = await chatHi.json() as { answer: string; mode: string; suggestedAction?: { type: string; route: string } };
  assert.equal(chatHiBody.mode, 'prototype');
  assert.ok(chatHiBody.answer.includes('टमाटर'));
  assert.equal(chatHiBody.suggestedAction?.type, 'crop_recommendation');

  const chatEn = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'How can I reduce transport cost?', context: {}, language: 'en' }),
  });
  assert.equal(chatEn.status, 200);
  const chatEnBody = await chatEn.json() as { answer: string; mode: string; suggestedAction?: { type: string; route: string } };
  assert.equal(chatEnBody.mode, 'prototype');
  assert.ok(chatEnBody.answer.includes('utilization'));
  assert.equal(chatEnBody.suggestedAction?.type, 'logistics');

  console.log('Backend smoke tests passed');
} finally {
  server.close();
  await repository.close();
}
