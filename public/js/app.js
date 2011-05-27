var socket = new io.Socket('localhost', {port: 8080});
var isConnected = socket.connect();
var you = '';
var loggedInUsers = [];
var belongsToChannel = [];

function getFormattedDate() {
    var date = new Date();
    return ' [ ' + date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' ]';
}

function displayOverlay() {
    // http://stackoverflow.com/questions/965662/using-jquery-to-create-overlay-but-content-inherits-css-opacity-can-you-help
    $(document.body).prepend('<div class="modal-overLay"></div>');
    $('.modal-overLay').css({ 'background-color': '#000',
        opacity: 0.5,
        position:'fixed',
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        'text-align':'center',
        'vertical-align':'middle'
    });

    $('.modal-overLay').fadeIn('slow');
    $('#login-container').css({
        position: 'absolute',
        left: '30%',
        top: '5%'
    });
    $('#login-container').fadeIn(500);
}

function logMessageToConsole(message) {
    if (!$.browser.msie) {
        console.log(message);
    }
}

function captureHandle() {
    var handle = $('input#handle').val();

    if (handle !== '') {
        you = handle;
        $.ajax({
            type: 'post',
            url: '/user/new',
            data: 'handle=' + handle + '&sessionid=' + isConnected.transport.sessionid,
            dataType: 'json',
            success: function(response) {

                if (response.error !== null) {
                    alert('There\'s been an error, sorry unable to store handle');
                } else {
                    mockResponse = {};
                    mockResponse.user = you;
                    mockResponse.message = 'has connected';
                    mockResponse.type = 'connected';
                    $('#login-container').hide();
                    $('.modal-overLay').fadeOut(500);
                    insertMessage(mockResponse);
                    socket.send({message: ' has connected', user: you});
                    getLoggedInUsers();
                    getChannels();
                    $('input#shout-box').focus();
                }
            }
        });

    } else {
        alert('Please enter a handle.');
    }
}

function getLoggedInUsers() {
    $.ajax({
        type: 'get',
        url: '/user/',
        dataType: 'json',
        success: function(response) {

            if (response.error !== null) {
                alert('There\'s been an error, sorry unable to get logged in users');
            } else if (response.users.length > 0) {
                loggedInUsers = response.users;
                $('ul#loggedin-users').children().remove();
                _.each(loggedInUsers,function(i) {
                    $('ul#loggedin-users').append('<li id="'+ i.sessionid +'">' + i.handle + '</li>');
                });
            }
        }
    });
}

function getChannels() {
    $.ajax({
        type: 'get',
        url: '/channel/',
        dataType: 'json',
        success: function(response) {

            if (response.error !== null) {
                alert('There\'s been an error, sorry unable to get channels');
            } else if (response.channels.length > 0) {
                $('ul#available-channels').children().remove();
                var channels = response.channels;
                _.each(channels,function(i) {
                    $('ul#available-channels').append('<li id="'+ i._id +'">' + i.channel + '</li>');
                });
            }
        }
    });
}

function createChannel() {
    var channel = $('input#custom-channel-box').val();

    if (channel !== '') {
        $.ajax({
            type: 'post',
            url: '/channel/new',
            data: 'channel=' + channel + '&sessionid=' + isConnected.transport.sessionid,
            dataType: 'json',
            success: function(response) {
                if (response.error !== null) {
                    alert('There\'s been an error, sorry unable to store channel: ' + response.error);
                } else {
                    var message = {};
                    message.type = 'channel created';
                    message.message = 'new channel created';
                    socket.send(message);
                    mockResponse = {};
                    mockResponse.user = you;
                    mockResponse.message = 'Joined channel ' + channel;
                    mockResponse.type = 'joined';
                    belongsToChannel.push({'id': response.channel[0]._id, 'name': response.channel[0].channel});
                    insertMessage(mockResponse);
                    getChannels();
                }
            }
        });

    } else {
        alert('Please enter a channel name.');
    }
}

function joinChannel(e) {
    $.ajax({
        type: 'post',
        url: '/channel/join',
        data: 'channel=' + e.target.id + '&sessionid=' + isConnected.transport.sessionid,
        dataType: 'json',
        success: function(response) {
            if (response.error !== null) {
                alert('Unable to join channel: ' + response.error);
            } else {
                mockResponse = {};
                mockResponse.user = you;
                mockResponse.message = 'Joined channel ' + response.channel.channel;
                mockResponse.type = 'joined';
                belongsToChannel.push({'id': response.channel._id, 'name': response.channel.channel});
                insertMessage(mockResponse);
                notifyChannel(response.channel._id);
            }
        }
    });
}

function notifyChannel(id) {

}

function parseMessage(message) {
    var match = message.match(/\/[a-z0-9]*/);
    var parsed = {};

    parsed['type'] = 'default';
    parsed['message'] = message;

    if (match !== null) {
        switch (match[0]) {
            case '/r':
                parsed['type'] = 'whisper';
                break;
            case '/p':
                parsed['type'] = 'party';
                break;
            case '/join':
                parsed['type'] = 'join';
                break;
            case '/leave':
                parsed['type'] = 'leave';
                break;
            default:
                var channel = match[0].match(/[0-9]/);
                if (channel.length && belongsToChannel.length >= 1) {
                    var channelDetails = belongsToChannel[channel[0]-1];
                    parsed['type'] = 'channel';
                    parsed['channelId'] = channelDetails.id;
                } else {
                    parsed['type'] = 'chat';
                }

                break;
        }

        parsed['message'] = message.replace(/\/[a-z]*\s|\/[a-z]*[0-9]\s/, "");
    }

    return parsed;
}

function sendMessage() {
    var message = $('input#shout-box').val();
    var request = parseMessage(message);

    $('input#shout-box').val('');

    if (request['type'] === 'join') {
        logMessageToConsole('join channel: ' + request['message']);
    } else if (request['type'] === 'leave') {
        logMessageToConsole('leave channel: ' + request['message']);
    } else {
        mockResponse = {};
        mockResponse.user = you;
        mockResponse.message = request['message'];
        mockResponse.type = request['type'];
        insertMessage(mockResponse);
        request.user = you;
        socket.send(request);
    }

}

function getHandle(id) {
    var handle = id;
    _.each(loggedInUsers,function(i) {
        if (i.sessionid == id) {
            handle = i.handle;
            return false;
        }
    });

    return handle;
}

function insertMessage(response) {
    var handle = (response.user !== null && typeof response.user !== 'undefined') ? response.user:getHandle(response.id);
    var li = $('<li>' + handle + ' ' + getFormattedDate() + ' : ' + response.message + '</li>');

    if(response.type === 'disconnected') {
        $('li#'+response.id).remove();
    } else if (typeof response.type !== 'undefined') {
        li.addClass(response.type);
    }

    $('ul#message-list').append(li);
}

if (isConnected) {
    socket.on('connect', function(data) {
        logMessageToConsole('connect')
    });

    socket.on('message', function(data) {
        data = JSON.parse(data);
        console.log(data);
        if (data.type !== 'connected') {
            insertMessage(data);
            console.log('message');

        } else if (data.type !== 'channel created') {
            getChannels();
            console.log('channel');

        } else {
            getLoggedInUsers();
            console.log('load users');

        }
    });

    socket.on('disconnect', function() {
        $.ajax({
            type: 'post',
            url: '/user/delete/',
            dataType: 'json',
            data: 'handle=' + you + '&sessionid=' + isConnected.transport.sessionid,
            success: function(response) {
                logMessageToConsole('disconnect');
            }
        });
    });
}