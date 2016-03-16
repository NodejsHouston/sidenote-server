sidenote-server
==========

## The Stack:
**Node.js** - Because it's fast, easy to get started, and Javascript is awesome.
[http://nodejs.org/](http://nodejs.org/)

**Hapi** - A very well designed server framework that is easy to understand, easy to create your own plugins, scales very well, cache options built in, and more.
[http://hapijs.com/](http://hapijs.com/)

### Requirements:
Install Node.js by using the big install button on the [http://nodejs.org/](http://nodejs.org/) homepage.

After Node.js is installed, clone this repo, change `cd` to this directory, and run `npm install`

Start the server by running the command:
```
$ node server
```

To see any changes you can manually just shutdown and restart the node server. This can be a pain so I use Supervisor to watch for file changes and restart the server [https://github.com/isaacs/node-supervisor](https://github.com/isaacs/node-supervisor).

To install run:
```
$ npm install -g supervisor
```

To use it run:
```
$ supervisor -e js  server
```

Now all of your server js files are being watched and on change the node server gets restarted automatically.
