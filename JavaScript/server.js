'use strict';

const http = require('http');
const Client = require('./client.js');
const Session = require('./session.js');

const routing = {
  '/': async client => '<h1>welcome to homepage</h1><hr>',
  '/start': async client => {
    Session.start(client);
    return `Session token is: ${client.token}`;
  },
  '/api/method1': async client => {
    if (client.session) {
      return { data: 'example result' };
    } else {
      return { data: 'access is denied' };
    }
  },
  '/api/method2': async client => ({
    url: client.req.url,
    headers: client.req.headers,
  }),
};

const types = {
  object: JSON.stringify,
  string: s => s,
  number: n => n.toString(),
  undefined: () => 'not found',
};

http.createServer((req, res) => {
  const client = new Client(req, res);
  console.dir({
    url: req.url,
    status: res.statusCode,
    cookie: client.cookie,
  });
  const handler = routing[req.url];
  if (handler) {
    handler(client)
      .then(data => {
        const type = typeof data;
        const serializer = types[type];
        const result = serializer(data);
        client.sendCookie();
        res.end(result);
      }, err => {
        console.error(err.stack);
        res.statusCode = 500;
        res.end('Internal Server Error 500');
      });
    return;
  }
  res.statusCode = 404;
  res.end('Not found 404');
}).listen(8000);
