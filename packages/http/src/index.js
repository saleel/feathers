const http = require('http');
const { routing } = require('@feathersjs/transport-commons');
const Middie = require('middie');
const rest = require('./rest');


function createServer(feathersApp) {
  const middie = Middie((err, req, res) => {
    if (err) {
      console.log(err);
      res.end(err);
      return;
    }

    // console.log('MQ');
   
    // => routing function
  });


  const server = http.createServer(function handler (req, res) {
    middie.run(req, res);
  });

  if (!feathersApp) {
    return server;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/http requires a valid Feathers application instance');
  }

  Object.assign(server, {
    use (location, service) {
      if (typeof location === 'string') {
        return feathersApp.use(location, service);
      }

      return middie.use(location);
    }
  });

  Object.getOwnPropertyNames(feathersApp).forEach(prop => {
    const feathersProp = Object.getOwnPropertyDescriptor(feathersApp, prop);
    const serverProp = Object.getOwnPropertyDescriptor(server, prop);

    if (serverProp === undefined && feathersProp !== undefined) {
      Object.defineProperty(server, prop, feathersProp);
    }
  });

  server.configure(routing());
  server.configure(rest);

  return server;
}

module.exports = createServer;