# Simple chat

To get started [install node.js](https://github.com/joyent/node/wiki/Installation), [mongodb](http://www.mongodb.org/downloads) and [npm](http://npmjs.org/). Then use npm to install:

 * [socket.io](http://socket.io/)
 * [expressjs](http://expressjs.com/)
 * [mongodb](https://github.com/christkv/node-mongodb-native/) - use `npm install mongodb@0.9.2`

To get start from the command line:

    git clone https://github.com/gregstewart/chat.io.git
    cd chat.io
    sudo node main.js


You might be prompted by your firewall that something is listening on port 8080, that's the node server. Finally open up a browser and go to [http://localhost:3000/](http://localhost:3000/), then open up another browser and type in a message and submit it, the message should appear in the first browser.

To change the port of the server open up ChatSocket.js and look for:

`server.listen(8080);`

Simply change the value 8080, to whatever you want.

To change the appearance of the "UI" simply edit the index.html file.

### Update

I have added [expressjs](http://expressjs.com/) and mongoDB to capture user names in a database (for display purposes and for kicks really)

by [Greg Stewart](http://gregs.tcias.co.uk/)