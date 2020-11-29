import axios from 'axios';
import {Clipboard} from 'react-native';
import Config from 'react-native-config';

const BASE_URL = Config.BASE_URL;

const URL = `${BASE_URL}/notification/mobile-token`;

export const subscribeToken = (deviceToken, authorizationHeader) => {
  console.log(authorizationHeader);
  console.log(Clipboard.setString(deviceToken));
  return axios
    .post(
      URL,
      {
        deviceToken,
      },
      {
        headers: {
          Authorization: `Bearer ${authorizationHeader}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .then(res => console.log('success', res))
    .catch(err => console.log(Object.values(err)));
};

export const unsubscribeToken = authorizationHeader =>
  axios.delete(URL, {
    headers: {
      Authorization: `Bearer ${authorizationHeader}`,
      'Content-Type': 'application/json',
    },
  });
