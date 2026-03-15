const Challenge = require('../models/Challenge');
const { env } = require('../config/env');

const memoryStore = new Map();

const cacheKey = (doc) => `${doc.type}:${doc.userId || doc.sessionId}`;

const setCache = (doc) => {
  const key = cacheKey(doc);
  memoryStore.set(key, doc);
  const ttl = doc.expiresAt.getTime() - Date.now();
  if (ttl > 0) {
    setTimeout(() => memoryStore.delete(key), ttl).unref?.();
  }
};

const store = async (type, userId, challenge, metadata = {}, ttlSeconds = env.CHALLENGE_TTL_SECONDS) => {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const doc = await Challenge.create({ type, userId, challenge, metadata, expiresAt });
  setCache(doc);
  return doc;
};

const storeSession = async (type, sessionId, challenge, metadata = {}, ttlSeconds = env.CHALLENGE_TTL_SECONDS) => {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const doc = await Challenge.create({ type, sessionId, challenge, metadata, expiresAt });
  setCache(doc);
  return doc;
};

const retrieve = async (userId, type) => {
  const key = `${type}:${userId}`;
  if (memoryStore.has(key)) {
    const cached = memoryStore.get(key);
    if (cached.expiresAt > new Date()) return cached;
    memoryStore.delete(key);
  }
  const doc = await Challenge.findOne({ userId, type });
  if (doc && doc.expiresAt <= new Date()) {
    await Challenge.deleteOne({ _id: doc._id });
    return null;
  }
  if (doc) setCache(doc);
  return doc;
};

const retrieveSession = async (sessionId, type) => {
  const key = `${type}:${sessionId}`;
  if (memoryStore.has(key)) {
    const cached = memoryStore.get(key);
    if (cached.expiresAt > new Date()) return cached;
    memoryStore.delete(key);
  }
  const doc = await Challenge.findOne({ sessionId, type });
  if (doc && doc.expiresAt <= new Date()) {
    await Challenge.deleteOne({ _id: doc._id });
    return null;
  }
  if (doc) setCache(doc);
  return doc;
};

const consume = async (challengeId) => {
  const doc = await Challenge.findOneAndDelete({ _id: challengeId });
  if (doc) {
    memoryStore.delete(cacheKey(doc));
  }
  return doc;
};

module.exports = { store, storeSession, retrieve, retrieveSession, consume };
