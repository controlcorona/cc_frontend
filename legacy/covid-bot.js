
var covidBot = BotUI('covid-bot');

var hasCough, hasTroubleBreathing, fever, hasContactHistory, pincode, risk, loadingIndex, assessmentId, mobile;

let messages = {
  "initialMessage": "We are at WAR, War against Corona and India needs your Help. All we need from you is an honest self assessment of your health. If enough people do this in our city, we'll be able to stop this Virus right in it's track by predicting where it is spreading",
  "firstMessage": {
    "Very Low": "There is a very low chance that you're infected. Though you should take care",
    "Low": "There is a low chance that you're infected. Though you should take care",
    "Medium": "It is possible that you're infected",
    "High": "There is a high chance that you're infected",
    "Very High": "There is a very high chance that you're infected",
  },
  "extraMessages": {
    "Very Low": [
      "Stay quarantined"
    ],
    "Low": [
      "Stay quarantined"
    ],
    "Medium": [
      "Strictly stay quarantined"
    ],
    "High": [
      "Immediately contact the authorities to get checked up",
      "Strictly stay quarantined and suggest your family members to also stay quarantined",
      "Do not get out of your home"
    ],
    "Very High": [
      "Immediately contact the authorities to get checked up without any delay",
      "Strictly stay quarantined and suggest your family members to also stay quarantined",
      "Strictly do not get out of your home for any reason"
    ],
  },
  "tips": [
    "You have to maintain social distancing",
    "Wash hands frequently",
    "Do not touch your face with dirty hands",
    "Central Helpline Number : - +91-11-23978046"
  ]
}

covidBot.message.add({
  content: messages['initialMessage']
}).then(function () {
  return covidBot
    .message.add({
      delay: 150,
      content: 'Do you have dry cough?'
    });
}).then(function () {
  return covidBot
    .action.button({
      delay: 100,
      action: [{
        text: 'Yes',
        value: 'yes'
      }, {
        text: 'No',
        value: 'no'
      }]
    });
}).then(function (res) {
  hasCough = res.value
  return covidBot
    .message.add({
      delay: 150,
      content: 'Do you have trouble breathing?'
    });
}).then(function () {
  return covidBot
    .action.button({
      delay: 100,
      action: [{
        text: 'Yes',
        value: 'yes'
      }, {
        text: 'No',
        value: 'no'
      }]
    });
}).then(function (res) {
  hasTroubleBreathing = res.value
  return covidBot
    .message.add({
      delay: 150,
      content: 'What is your temperature?'
    });
}).then(function () {
  return covidBot
    .action.button({
      delay: 100,
      action: [{
        text: 'Less than 99F',
        value: 'no'
      }, {
        text: '99F to 101F',
        value: 'low'
      }, {
        text: 'more than 101F',
        value: 'high'
      }]
    });
}).then(function (res) {
  fever = res.value
  return covidBot
    .message.add({
      delay: 150,
      content: 'Have you been in contact with anyone who is positively tested with Corona Virus?'
    });
}).then(function () {
  return covidBot
    .action.button({
      delay: 100,
      action: [{
        text: 'Yes',
        value: 'yes'
      }, {
        text: 'No',
        value: 'no'
      }]
    });
}).then(function (res) {
  hasContactHistory = res.value
  return covidBot
    .message.add({
      delay: 150,
      content: 'What is your pincode?'
    });
}).then(function () {
  return askForPincode();
}).then(function (res) {
  pincode = res.toString();
  return covidBot
    .message.add({
      loading: true
    });
}).then(function (index) {
  loadingIndex = index;
  return fetch('https://wagjv3qm05.execute-api.us-west-2.amazonaws.com/riskCalculation', {
    method: 'post',
    body: JSON.stringify({
      "hasDryCough": hasCough == 'yes',
      "hasTravelHistory": false,
      "hasTroubleBreathing": hasTroubleBreathing == 'yes',
      "fever": fever,
      "hasContactHistory": hasContactHistory == 'yes',
      "pincode": pincode,
    })
  })
}).then(function (res) {
  return res.json()
}).then(function (res) {
  risk = res.risk
  assessmentId = res.id;
  return covidBot
    .message.update(loadingIndex, {
      delay: 150,
      loading: false,
      content: messages["firstMessage"][risk]
    });
}).then(function () {
  let promiseArray = []
  messages["extraMessages"][risk].forEach((element, index) => {
    promiseArray.push(covidBot
      .message.add({
        delay: index ? 150 * (index + 1) : 150,
        content: element
      }))
  });
  return Promise.all(promiseArray)
}).then(function () {
  return covidBot
    .message.add({
      delay: 1500,
      content: 'Would you like to add your mobile number to receive updates for cases and risk in your locality?'
    });
}).then(function () {
  return covidBot
    .action.button({
      delay: 100,
      action: [{
        text: 'Yes I\'m in',
        value: 'yes'
      }, {
        text: 'No',
        value: 'no'
      }]
    });
}).then(function (res) {
  if (res.value == 'yes') {
    return covidBot
      .action.text({
        action: {
          placeholder: 'Mobile'
        }
      }).then(function (res) {
        mobile = res.value;
        return covidBot
          .message.add({
            loading: true
          });
      }).then(function (index) {
        loadingIndex = index
        return fetch('https://wagjv3qm05.execute-api.us-west-2.amazonaws.com/user', {
          method: 'post',
          body: JSON.stringify({
            "mobile": mobile,
            "assessmentId": assessmentId,
            "pincode": pincode
          })
        })
      }).then(function () {
        return covidBot
          .message.update(loadingIndex, {
            delay: 150,
            content: 'Thanks! We\'ll keep you updated'
          });
      })
  } else {
    return new Promise(function (resolve, reject) {
      resolve();
    })
  }
}).then(function () {
  return covidBot
    .message.add({
      delay: 150,
      content: 'Share this with your friends and family, the more people use this, the better chances we have to win this war'
    });
}).then(function () {
  return covidBot
    .message.add({
      type: 'html',
      content: '<a href="whatsapp://send?text=I%20did%20my%20part%2C%20now%20it%27s%20your%20turn.%20Join%20the%20%2AWar%20against%20Corona%2A%0Ahttps%3A%2F%2Fwaragainstcorona.in%2F"><img src="wa-logo.png" height=40 width=40></a>'
    })
})
// .then(function () {
//   let promiseArray = []
//   messages["tips"].forEach((element, index) => {
//     promiseArray.push(covidBot
//       .message.add({
//         delay: index ? 150 * (index + 1) : 150,
//         content: element
//       }))
//   });
//   return Promise.all(promiseArray);
// });

function askForPincode() {
  return covidBot
    .action.text({
      sub_type: 'number',
      delay: 100,
      action: {
        placeholder: 'Your pincode'
      }
    }).then(function ({ value }) {
      return verifyPincode(value);
    }).catch(function (invalidPincode) {
      return covidBot
        .message.add({
          delay: 150,
          content: `Invalid pincode: ${invalidPincode}`
        }).then(askForPincode);
    })
}

function verifyPincode(value) {
  let pincode = parseInt(value);
  return new Promise(function (resolve, reject) {
    if (Number.isInteger(pincode) && pincode.toString().length === 6) {
      resolve(pincode);
    } else {
      reject(value);
    }
  })
}