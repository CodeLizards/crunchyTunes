module.exports = (server) => {

  var io = require('socket.io')(server);
  var sessionData = require('./sessionData.js');
  var dataMethods = require('./dataMethods.js');

  io.on('connection', (socket) => {
    var user;

    socket.on('add track', (track) => {
      // sessionData is a server side data store
      dataMethods.addToStore(track, sessionData.tracks);
      dataMethods.setRemovalInHalfHour(track, sessionData.tracks, function () {
        socket.emit('remove from playlist', sessionData.tracks);
      });

      socket.emit('new track', sessionData.tracks);
      socket.broadcast.emit('new track', sessionData.tracks);
    });

    socket.on('track play', (playing) => {
      sessionData.currentTrack = playing;
      socket.emit('update track', sessionData.currentTrack);
      socket.broadcast.emit('update track', sessionData.currentTrack);
      // then delete track from playlist
      dataMethods.removeFromStore(playing, sessionData.tracks);
      socket.emit('remove from playlist', sessionData.tracks);
      socket.broadcast.emit('remove from playlist', sessionData.tracks);
    });

    // handle messages to send from one to all
    socket.on('new message', (message) => {
      socket.emit('new message', message);
      socket.broadcast.emit('new message', message);
    });

    socket.on('add user', (username) => {
      socket.username = username;
      socket.emit('user joined', socket.username);
      user = {
        username: username,
        userId: socket.id,
        isDictator: false,
        mood: 0,
      };

      if (sessionData.userData.length === 0) {
        user.isDictator = true;
        sessionData.dictator = user;
        socket.emit('you are dictator', sessionData.dictator);
      }

      socket.broadcast.emit('new dictator', sessionData.dictator);
      dataMethods.addToStore(user, sessionData.userData);

    });

    socket.on('disconnect', () => {
      // handles undefined user for disconnects before
      // joining with the modal
      var isDictator = user ? user.isDictator : false;
      if (isDictator) {
        dataMethods.assignDictator(user, sessionData);
        var dictatorId = sessionData.dictator.userId;
        if (io.sockets.connected[dictatorId]) {
          io.to(dictatorId).emit('you are dictator', sessionData.dictator);
          socket.broadcast.emit('new dictator', sessionData.dictator);

          // i do not think the line below is necessary but haven't tested extensively
          // io.sockets.connected[dictatorId].broadcast.emit('assign dictator');
        }
      }
      dataMethods.removeFromStore(user, sessionData.userData);
    });

      // need to handle dictator change on disconnect

    socket.on('mood change', (sentiment) => {
      var target = { userId: socket.id };
      dataMethods.updateObjPropInStore(target, sessionData.userData, (user) => {
        user.mood = sentiment;
      });

      dataMethods.getMoods(sessionData.userData, (mood) => {

        dataMethods.setTemperature(sessionData, mood);
        socket.broadcast.emit('temperatureUpdate', { temperature: sessionData.temperature });
        socket.emit('temperatureUpdate', { temperature: sessionData.temperature });
        dataMethods.getMoods(sessionData.userData, (moods) => {
          dataMethods.setTemperature(sessionData, moods);
          var isDictatorSafe = dataMethods.isDictatorSafe(mood);
          if (!isDictatorSafe) {
            dataMethods.assignDictator(sessionData);
            dataMethods.resetPlayerMoods(sessionData.userData);
            socket.broadcast.emit('new dictator', sessionData.dictator);
            var dictatorId = sessionData.dictator.userId;
            if (io.sockets.connected[dictatorId]) {
              io.sockets.connected[dictatorId].emit('you are dictator', sessionData.dictator);
            }
          }
        });
      });
    });
  });
};
