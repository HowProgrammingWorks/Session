'use strict';

const sessions = new Map();

const TOKEN_LENGTH = 100;
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
    const { cookie } = client;
    const sessionToken = cookie.token;
    if (sessionToken) {
      const session = sessions.get(sessionToken);
      if (session) {
        client.session = session;
        return session;
      }
    }
    const token = generateToken();
    client.token = token;
    const session = new Session(token);
    client.session = session;
    client.setCookie('token', token);
    sessions.set(token, session);
    return session;
  }

  static drop(client) {
    const { token } = client;
    if (token) {
      sessions.delete(token);
      client.deleteCookie('token');
      client.token = undefined;
      client.session = null;
    }
  }
}

module.exports = Session;
