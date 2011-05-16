var socket = new io.Socket('localhost', {port: 8080});
var isConnected = socket.connect();
var you = '';

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
                    $('#login-container').hide();
                    $('.modal-overLay').fadeOut(500);
                    insertMessage(you, 'has connected');
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
                var users = response.users;
                _.each(users,function(i) {
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
                    insertMessage(you, "Joined channel " + channel);
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
                insertMessage(you, "Joined channel " + response.channel.channel);
                notifyChannel(response.channel._id);
            }
        }
    });
}

function notifyChannel(id) {

}

function parseMessage(message) {
    var match = message.match(/\/[a-z]*|[0-9]/);
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
                break;
        }

        parsed['message'] = message.replace(/\/[a-z]*\s|\/[a-z]*[0-9]\s/, "");
    }

    return parsed;
}

function sendMessage() {
    var message = $('input#shout-box').val();
    var parsedMessage = parseMessage(message);

    $('input#shout-box').val('');

    if (parsedMessage['type'] === 'join') {
        logMessageToConsole('join channel: ' + parsedMessage['message']);
    } else if (parsedMessage['type'] === 'leave') {
        logMessageToConsole('leave channel: ' + parsedMessage['message']);
    } else {
        insertMessage(you, parsedMessage['message'], parsedMessage['type']);
        socket.send(parsedMessage);
    }

}

function insertMessage(user, message, type) {
    var li = $('<li>' + user + ' ' + getFormattedDate() + ' : ' + message + '</li>');

    if(type === 'disconnected') {
        $('li#'+user).remove();
    } else if (typeof type !== 'undefined') {
        li.addClass(type);
    }

    $('ul#message-list').append(li);
}

if (isConnected) {
    socket.on('connect', function(data) {
        logMessageToConsole('connect')
    });

    socket.on('message', function(data) {
        data = JSON.parse(data);
        insertMessage(data.id, data.message, data.type);
    });

    socket.on('disconnect', function() {
        $.ajax({
            type: 'get',
            url: '/delete/',
            dataType: 'json',
            data: 'handle=' + you + '&sessionid=' + isConnected.transport.sessionid,
            success: function(response) {
                logMessageToConsole('disconnect');
            }
        });
    });
}