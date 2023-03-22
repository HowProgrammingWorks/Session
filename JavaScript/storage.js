'use strict';

const fs = require('node:fs').promises;
const path = require('node:path');
const v8 = require('node:v8');

const PATH = `${__dirname}/sessions`;

const safePath = (promise) => (token, ...args) => {
  if (typeof token !== 'string') throw new Error('Invalid session token');
  const fileName = path.join(PATH, token);
  if (!fileName.startsWith(PATH)) throw new Error('Invalid session token');
  return promise(fileName, ...args)
};

const readSession = safePath(fs.readFile);
const writeSession = safePath(fs.writeFile);
const deleteSession = safePath(fs.unlink);

class Storage extends Map {
  async get(key) {
    const value = super.get(key);
    if (value) return value;
    let data;
    try {
      data = await readSession(key);
    } catch (err) {
      return undefined;
    }
    console.log('Session loaded: ${key}');
    const session = v8.deserialize(data);
    super.set(key, session);
    return session;
  }

  async save(key) {
    const value = super.get(key);
    if (value) {
      const data = v8.serialize(value);
      await writeSession(key, data);
      console.log(`Session saved: ${key}`);
    }
  }

  async delete(key) {
    console.log('Delete: ', key);
    await deleteSession(key);
    console.log(`Session deleted: ${key}`);
  }
}

module.exports = new Storage();
