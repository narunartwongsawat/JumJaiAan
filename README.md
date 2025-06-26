# JumJaiAan - LINE Chatbot for Summarization

This project is a LINE chatbot that uses the Gemini AI to summarize content from a given URL. It can also translate the summary into Thai.

## Features

- Summarizes the content of a URL provided in a LINE message.
- If the content is not in Thai or English, it provides the summary in both Thai and English.

## Setup

1.  **Create a LINE Official Account (OA) and a channel in the [LINE Developers Console](https://developers.line.biz/en/).**
2.  **Obtain a Channel Access Token** from your channel settings in the LINE Developers Console.
3.  **Create a new project in [Google Apps Script](https://script.google.com/).**
4.  **Get a Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
5.  **Copy the code from the `Code.gs` file in this repository into your Google Apps Script project.**
6.  **In the `Code.gs` file, replace the placeholder values for `CHANNEL_ACCESS_TOKEN` and `GEMINI_API_KEY` with your actual credentials.**
7.  **Deploy your Google Apps Script project as a web app.**
8.  **Copy the web app URL provided after deployment.**
9.  **In the LINE Developers Console, set the Webhook URL for your channel to the URL of your deployed Google Apps Script web app.**
