import axios from "axios";

export const saveData = data => {
  return axios.post("https://wagjv3qm05.execute-api.us-west-2.amazonaws.com/riskCalculation", data);
}

export const saveMobile = data => {
  return axios.post("https://wagjv3qm05.execute-api.us-west-2.amazonaws.com/user", data);
}