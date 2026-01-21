# WhatsApp to Google Sheets Logger

This bot listens to your WhatsApp messages and logs them to a Google Sheet using a Service Account.

## Features
- **Automatic Logging**: Saves incoming messages to Google Sheets.
- **Rich Media Support**: Logs text, images, videos, documents, locations, and contacts.
- **Retry Logic**: Automatically retries failed network requests.
- **Secure**: Uses environment variables and Google Service Account authentication.

## Prerequisites
- Node.js installed (v16 or higher recommended).
- A Google Cloud Platform account.
- A WhatsApp account (on your phone).

## Setup Guide

### 1. Clone/Download
Download this project to your computer.

### 2. Install Dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### 3. Google Cloud Setup
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  **Enable API**: Search for "Google Sheets API" and enable it.
4.  **Create Service Account**:
    - Go to "IAM & Admin" > "Service Accounts".
    - Click "Create Service Account".
    - Give it a name and click "Create".
    - (Optional) Skip role assignment for now (or give "Editor" if you want).
    - Click "Done".
5.  **Get Key**:
    - Click on the newly created service account email.
    - Go to the "Keys" tab.
    - Click "Add Key" > "Create new key".
    - Select **JSON** and click "Create".
    - Save the file as `service-account.json` in this project folder.

### 4. Configure Google Sheet
1.  Create a new Google Sheet.
2.  **Share the Sheet**: Click "Share" and paste the **Service Account Email** (found in the JSON file or Cloud Console). Give it **Editor** access.
3.  **Get ID**: Copy the Spreadsheet ID from the URL:
    `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`

### 5. Environment Variables
1.  Rename `.env.example` to `.env` (or create a new `.env` file).
2.  Update the values:
    ```ini
    SPREADSHEET_ID=your_spreadsheet_id_here
    GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
    ```

### 6. Run the Bot
Start the bot:
```bash
node index.js
```
1.  A QR code will appear in the terminal.
2.  Scan it with WhatsApp (Linked Devices).
3.  Once connected, send a message to the bot (or in a group it's in) to test!

## Troubleshooting
- **403 Permission Denied**: Ensure you shared the sheet with the Service Account email.
- **API Not Enabled**: Ensure Google Sheets API is enabled in Cloud Console.
