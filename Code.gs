const CHANNEL_ACCESS_TOKEN = 'YOUR_CHANNEL_ACCESS_TOKEN';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

function doPost(e) {
  const event = JSON.parse(e.postData.contents).events[0];
  const replyToken = event.replyToken;
  const message = event.message.text;

  if (event.type === 'message' && event.message.type === 'text') {
    const urlRegex = /(https|http):\/\/[^\s]+/g;
    const urls = message.match(urlRegex);

    if (urls) {
      const url = urls[0];
      const content = UrlFetchApp.fetch(url).getContentText();
      const summary = summarize(content);
      replyMessage(replyToken, summary);
    } else {
      replyMessage(replyToken, 'Please send a valid URL.');
    }
  }
}

function summarize(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Summarize the following text. If the text is not in Thai or English, provide the summary in both Thai and English:\n\n${text}`,
          },
        ],
      },
    ],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  return data.candidates[0].content.parts[0].text;
}

function replyMessage(replyToken, message) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const payload = {
    replyToken: replyToken,
    messages: [
      {
        type: 'text',
        text: message,
      },
    ],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(url, options);
}
