import axios from 'axios';

const BASE_URL = 'http://localhost:8080/';

export const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    return null;
  }
};

export const fetchEmails = async (accessToken) => {
  try {
    const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching emails:', error);
  }
};