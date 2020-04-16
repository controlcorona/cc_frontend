import React, { Component } from "react";
import Vue from "vue";
import BotUI from "botui";
import "botui/build/botui.min.css";
import "botui/build/botui-theme-default.css";
import { messages } from "./messages";
import { saveData, saveMobile } from "../../services/quiz";

export default class botUi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
    };
    this.covidBot = null;
  }

  componentDidMount() {
    this.covidBot = BotUI("covid-bot-ui", {
      vue: Vue, // pass the dependency.
    });
    this.startTheBot();
  }

  startTheBot = () => {
    this.addQuestionWithOptions("wantsToHelpIndia", messages.initialMessage, [
      {
        text: "Yes! I'm ready to help India",
        value: "yes",
      },
      {
        text: "No. I don't want to help",
        value: "no",
      },
    ]).then(() => {
      return this.symptomsQuestionaire();
    }).then(() => {
      return this.addQuestionWithOptions(
        "wantsToAddMobileNumber",
        'Would you like to add your mobile number to receive updates for cases and risk in your locality?',
        [
          {
            text: "Yes I'm in",
            value: "yes",
          },
          {
            text: "No",
            value: "no",
          },
        ]
      );
    }).then(() => {
      if (this.state.data.wantsToAddMobileNumber === 'yes') {
        return this.addMobile();
      } else {
        return Promise.resolve();
      }
    }).then(() => {
      return this.addMessage('Share this with your friends and family, the more people use this, the better chances we have to win this war');
    }).then(() => {
      return this.addHtml('<a href="whatsapp://send?text=I%20did%20my%20part%2C%20now%20it%27s%20your%20turn.%20Join%20the%20%2AWar%20against%20Corona%2A%0Ahttps%3A%2F%2Fwaragainstcorona.in%2F"><img src="wa-logo.png" height=40 width=40></a>');
    });
  };

  symptomsQuestionaire = () => {
    return this.addQuestionWithOptions("hasDryCough", "Do you have dry cough?", [
      {
        text: "Yes",
        value: "yes",
      },
      {
        text: "No",
        value: "no",
      },
    ]).then(() => {
      return this.addQuestionWithOptions(
        "hasTroubleBreathing",
        "Do you have trouble breathing?",
        [
          {
            text: "Yes",
            value: "yes",
          },
          {
            text: "No",
            value: "no",
          },
        ]
      );
    }).then(() => {
      return this.addQuestionWithOptions("fever", "What is your temperature?", [
        {
          text: "Less than 99F",
          value: "no",
        },
        {
          text: "99F to 101F",
          value: "low",
        },
        {
          text: "more than 101F",
          value: "high",
        },
      ]);
    }).then(() => {
      return this.addQuestionWithOptions(
        "hasContactHistory",
        "Have you been in contact with anyone who is positively tested with Corona Virus?",
        [
          {
            text: "Yes",
            value: "yes",
          },
          {
            text: "No",
            value: "no",
          },
        ]
      );
    }).then(() => {
      return this.addQuestionWithUserInput(
        "pincode",
        "What is your pincode?",
        "Pincode"
      );
    }).then(() => {
      return this.sendData();
    });
  }

  addQuestionWithOptions = (answerKey, question, options) => {
    return this.addMessage(question, 150)
      .then(() => {
        return this.addButtons(options, 100);
      })
      .then((res) => {
        this.setState((prevState) => ({
          data: { ...prevState.data, [answerKey]: res.value },
        }));
        return Promise.resolve();
      });
  };

  addQuestionWithUserInput = (answerKey, question, placeholder) => {
    return this.addMessage(question, 150)
      .then(() => {
        return this.addUserInput(placeholder, 100);
      })
      .then((res) => {
        this.setState((prevState) => ({
          data: { ...prevState.data, [answerKey]: res.value },
        }));
        return Promise.resolve();
      });
  };

  addMessage = (message, delay = 0, loading = false) => {
    return this.covidBot.message.add({
      content: message,
      delay,
      loading,
    });
  };

  updateMessage = (index, message, delay = 0, loading = false) => {
    return this.covidBot.message.update(index, {
      content: message,
      delay,
      loading,
    });
  };

  addHtml = (message) => {
    return this.covidBot.message.add({
      content: message,
      type: 'html'
    });
  };

  addMobile = () => {
    let loadingIndex;
    return this.addUserInput(
      "Mobile",
    ).then((res) => {
      this.setState((prevState) => ({
        data: { ...prevState.data, ['mobile']: res.value },
      }));
      return Promise.resolve();
    }).then(() => {
      return this.covidBot.message.add({
        loading: true,
      });
    }).then((index) => {
      loadingIndex = index
      return saveMobile({
        "mobile": this.state.data.mobile,
        "assessmentId": this.state.data.assessmentId,
        "pincode": this.state.data.pincode
      });
    }).then((resp) => {
      return this.updateMessage(loadingIndex, "Thanks! We'll keep you updated");
    }).catch((error) => {
      return this.updateMessage(loadingIndex, "There are some issues with the system");
    });
  }

  addUserInput = (placeholder) => {
    return this.covidBot
      .action.text({
        sub_type: 'number',
        delay: 100,
        action: {
          placeholder: placeholder
        }
      });
  }

  addButtons = (actions, delay = 0) => {
    return this.covidBot.action.button({
      action: actions,
      delay,
    });
  };

  render() {
    return (
      <div id="covid-bot-ui">
        <bot-ui></bot-ui>
      </div>
    );
  }

  sendData = () => {
    let loadingIndex;
    return this.covidBot.message.add({
      loading: true,
    }).then((index) => {
      loadingIndex = index
      return saveData({
        "hasDryCough": this.state.data.hasDryCough === 'yes',
        "hasTravelHistory": false,
        "hasTroubleBreathing": this.state.data.hasTroubleBreathing === 'yes',
        "fever": this.state.data.fever,
        "hasContactHistory": this.state.data.hasContactHistory === 'yes',
        "pincode": this.state.data.pincode,
      });
    }).then((resp) => {
      console.log("res", resp);
      this.setState((prevState) => ({
        data: { ...prevState.data, ['assessmentId']: resp.data.id },
      }));
      this.setState((prevState) => ({
        data: { ...prevState.data, ['risk']: resp.data.risk },
      }));
      return this.updateMessage(loadingIndex, messages["firstMessage"][resp.data.risk]);
    }).then(() => {
      let promiseArray = []
      messages["extraMessages"][this.state.data.risk].forEach((element, index) => {
        promiseArray.push(this.addMessage(element, index ? 150 * (index + 1) : 150));
      });
      return Promise.all(promiseArray)
    });
  };
}