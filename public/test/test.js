test('chatStringParsing', function() {
    deepEqual(parseMessage('/r hello'), {'type':'whisper', 'message':'hello'});
    deepEqual(parseMessage('/p hello'), {'type':'party', 'message':'hello'});
    deepEqual(parseMessage('hello'), {'type':'default', 'message':'hello'});
    deepEqual(parseMessage('/join channel'), {'type':'join', 'message':'channel'});
    deepEqual(parseMessage('/leave channel'), {'type':'leave', 'message':'channel'});
});