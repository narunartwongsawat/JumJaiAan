const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

function doPost(e) {
  const event = JSON.parse(e.postData.contents).events[0];
  const replyToken = event.replyToken;
  const message = event.message.text;

  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const urlRegex = /(https|http):\/\/[^\s]+/g;
  const urls = message.match(urlRegex);

  if (!urls) {
    replyMessage(replyToken, "ไม่พบลิงก์ในข้อความของคุณ กรุณาส่ง URL ที่ถูกต้องเพื่อสรุป");
    return;
  }

  const url = urls[0];
  let content;

  try {
    // Fetch content with error handling for the URL itself
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      replyMessage(replyToken, `ขออภัย ไม่สามารถเข้าถึงลิงก์นั้นได้ อาจเป็นลิงก์เสียหรือไม่เป็นสาธารณะ (รหัสข้อผิดพลาด: ${response.getResponseCode()})`);
      return;
    }
    content = response.getContentText();
  } catch (err) {
    replyMessage(replyToken, "ขออภัย มีปัญหาในการเชื่อมต่อกับ URL นั้น กรุณาตรวจสอบลิงก์แล้วลองอีกครั้ง");
    return;
  }

  // Get the summary with error handling for the Gemini API call
  const summaryResult = summarize(content);

  replyMessage(replyToken, summaryResult);
}

function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '');
}

function summarize(text) {
  const plainText = stripHtmlTags(text);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Summarize the content of the following webpage in Thai, using bullet points: ${plainText}`,
          },
        ],
      },
    ],
  };


  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true, // Important: This prevents the script from stopping on HTTP errors
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode !== 200) {
      Logger.log(`Gemini API Error: Status Code - ${responseCode}, Response Body - ${responseBody}`);
      if (responseCode === 429) {
        return "ฉันค่อนข้างยุ่งอยู่ตอนนี้! โปรดรอสักครู่ก่อนส่งคำขออีกครั้ง";
      }
      return `ขออภัย ไม่สามารถสรุปได้ มีปัญหาเกี่ยวกับบริการ AI (ข้อผิดพลาด ${responseCode}) โปรดลองอีกครั้งในภายหลัง`;
    }

    const data = JSON.parse(responseBody);
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "ขออภัย ได้รับการตอบกลับที่ไม่คาดคิดจาก AI ไม่สามารถสร้างสรุปได้";
    }
  } catch (e) {
    return `เกิดข้อผิดพลาดที่ไม่คาดคิดขณะพยายามสรุป: ${e.toString()}`;
  }
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

// =========== TEST FUNCTION =============
// Use this function to test your summarization logic directly.
function testUrlSummarization() {
  // 1. Put a URL you want to test here.
  const testUrl = "https://en.wikipedia.org/wiki/Artificial_intelligence";

  try {
    // 2. Fetch the content from the URL.
    Logger.log(`Fetching content from: ${testUrl}`);
    const content = UrlFetchApp.fetch(testUrl).getContentText();
    Logger.log("Content fetched successfully.");

    // 3. Call the summarize function.
    Logger.log("Sending content to Gemini for summarization...");
    const summary = summarize(content);

    // 4. Print the summary to the logs.
    Logger.log("--- SUMMARY RESULT ---");
    Logger.log(summary);

  } catch (e) {
    Logger.log(`An error occurred: ${e.toString()}`);
  }
}
