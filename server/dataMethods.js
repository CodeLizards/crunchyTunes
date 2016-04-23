var _ = require('lodash');

var dataMethods = {
  setRemovalInHalfHour: (track, tracks, callback) => {
    setTimeout(() => {
      dataMethods.removeFromStore(track, tracks);
      callback();
    }, 1800000);
  },
  removeFromStore: (itemToRemove, store) => {
    for (var i = 0; i < store.length; i++) {
      if (_.isEqual(store[i], itemToRemove)) {
        store.splice(i, 1);
        return;
      }
    }
  },
  addToStore: (itemToAdd, store) => {
    if (Array.isArray(store)) {
      store.push(itemToAdd);
    } else {
      console.log('we only currently support adding to arrays');
    }
  },

  isDictator: (user) => user.isDictator,

  updateProperty: (newValue, property, store) => {
    store[property] = newValue;
  },

  updateObjPropInStore: (target, store, callback) => {
    for (var i = 0; i < store.length; i++) {
      if (_.isMatch(store[i], target)) {
        callback(store[i]);
        break;
      }
    }
  },

  getMoods: (store, callback) => {
    console.log('store', store);
    var moodArray = _.map(store, 'mood');
    var totalMood = _.reduce(moodArray, (memo, num) => memo + num, 0);
    console.log('MOODARRAY', moodArray);
    console.log('totalMOOD', totalMood);
    callback(totalMood);

  },

  setTemperature: (store, mood) => {
    // START TOMORROW CHECK MOOD MATH NOT WORKING
    //possible becaue not returning store or manipulating it orsomehtin
    var temperature = Math.floor((mood / store.userData.length) * 100);
    store.temperature = temperature;
  },

  isDictatorSafe: (mood) => {
    if (mood > 75) {
      return false;
    } else {
      return true;
    }
  },

  assignDictator: (user, store) => {
    var otherUsers = _.without(store.userData, user);
    if (otherUsers.length) {
      var index = Math.floor(Math.random() * otherUsers.length);
      var newDictator = otherUsers[index];
      newDictator.isDictator = true;
      store.dictator = newDictator;
    }
  },

  resetPlayerMoods: (store) => {
    _.each(store, (player) => {
      player.mood = 0;
    });
  },

};

module.exports = dataMethods;
