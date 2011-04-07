# Simple chat

To get started [install node.js](https://github.com/joyent/node/wiki/Installation) and [npm](http://npmjs.org/). Then use npm to install:

 * [socket.io](http://socket.io/)

To get start from the command line:

    git clone https://github.com/gregstewart/chat.io.git
    cd chat.io
    sudo node ChatSocket.js


You might be prompted by your firewall that something is listening on port 8080, that's the node server. Finally open up a browser and go to [http://localhost:8080/](http://localhost:8080/), then open up another browser and type in a message and submit it, the message should appear in the first browser.

To change the port of the server open up chatSocket.js and look for:

`server.listen(8080);`

Simply change the value 8080, to whatever you want.

To change the appearance of the "UI" simply edit the index.html file.

by [Greg Stewart](http://gregs.tcias.co.uk/)