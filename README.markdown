# Simple chat

To get started [install node.js](https://github.com/joyent/node/wiki/Installation), [mongodb](http://www.mongodb.org/downloads) and [npm](http://npmjs.org/). Then use npm to install:

 * [socket.io](http://socket.io/)
 * [expressjs](http://expressjs.com/)
 * [mongodb](https://github.com/christkv/node-mongodb-native/) - use `npm install mongodb@0.9.2`
 * [yaml](https://github.com/visionmedia/js-yaml)
 * [underscore](http://documentcloud.github.com/underscore/)

 To get start from the command line:

    git clone https://github.com/gregstewart/chat.io.git
    cd chat.io
    sudo node main.js

You might be prompted by your firewall that something is listening on port 8080, that's the node server. Finally open up a browser and go to [http://localhost:3000/](http://localhost:3000/), then open up another browser and type in a message and submit it, the message should appear in the first browser.

By default the server will run in development mode. To say run it in production mode (this influences [expressjs](http://expressjs.com/)), simply do this:

`sudo NODE_ENV=production node main.js`

To change any of the settings such as the ports/host names, open up config/settings.yml and make your changes there. The file has the following format:

    # Settings file (YAML)
    ---
      development:
        database:
          adapter: mongodb
          host: ''
          port: 27017
        express:
          host: localhost
          port: 3000
        chat:
          host: localhost
          port: 8080
      # borrowing from the rails convention
      test:
        database:
          adapter: mongodb
          host: ''
          port: 27017
        express:
          host: localhost
          port: 3000
        chat:
          host: localhost
          port: 8080
      production:
        database:
          adapter: mongodb
          host: ''
          port: 27017
        express:
          host: localhost
          port: 3000
        chat:
          host: localhost
          port: 8080


For example to change the default port value for the chat server, look for chat >> port >> 8080 and change it to whatever you want.

To change the appearance of the "UI" simply edit the index.html file.

### Update

I have added [expressjs](http://expressjs.com/) and [mongoDB](http://www.mongodb.org/) to capture user names in a database (for display purposes and for kicks really).

I have added [yaml](https://github.com/visionmedia/js-yaml), so that a configuration file can be read on start up. Specifying an invalid **NODE_ENV**, will cause the application to log an exception and just halt. 

I have added [underscore](http://documentcloud.github.com/underscore/), for array functions.

by [Greg Stewart](http://gregs.tcias.co.uk/)