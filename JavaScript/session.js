'use strict';

const storage = require('./storage.js');

const TOKEN_LENGTH = 32;
const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA = ALPHA_UPPER + ALPHA_LOWER;
const DIGIT = '0123456789';
const ALPHA_DIGIT = ALPHA + DIGIT;

const generateToken = () => {
  const base = ALPHA_DIGIT.length;
  let key = '';
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    const index = Math.floor(Math.random() * base);
    key += ALPHA_DIGIT[index];
  }
  return key;
};

class Session extends Map {
  constructor(token) {
    super();
    this.token = token;
  }

  static start(client) {
    if (client.session) return client.session;
    const token = generateToken();
    client.token = token;
    const session = new Session(token);
    client.session = session;
    client.setCookie('token', token);
    storage.set(token, session);
    return session;
  }

  static restore(client) {
    const { cookie } = client;
    const sessionToken = cookie.token;
    if (sessionToken) {
      storage.get(sessionToken, (err, session) => {
        if (session) {
          Object.setPrototypeOf(session, Session.prototype);
          client.token = sessionToken;
          client.session = session;
        }
      });
    }
  }

  static drop(client) {
    const { token } = client;
    if (token) {
      storage.delete(token);
      client.deleteCookie('token');
      client.token = undefined;
      client.session = null;
    }
  }

  save() {
    storage.save(this.token);
  }
}

module.exports = Session;
