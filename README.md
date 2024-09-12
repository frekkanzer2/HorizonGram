# HorizonGram
Infinite cloud storage manager that uses Telegram cloud storage to upload and download files.

### Requirements
- Download and install Docker
- Telegram account
- Firebase account
- Node.js v18.19.1
- Npm v10.8.3

### Configuration
1. Start a chat with https://t.me/BotFather on Telegram
2. Send the following message: /newbot
3. Choose a unique username that we are going to reference with <BOT_USERNAME>
4. If the creation successes, BotFather will send you a message with the bot token, that we are going to reference with <BOT_TOKEN>
5. Create a group chat named "Archive" with the id that we are going to reference with <GROUP_ARCHIVE>
6. Make the Archive group chat as a topic chat by editing the settings:

<img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_topics_1.png?raw=true" height="250"> <img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_topics_2.png?raw=true" height="250"> <img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_topics_3.png?raw=true" height="230">

7. Add the bot <BOT_USERNAME> into the Archive group and give him administrator privilege:

<img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_admin_1.png?raw=true" height="360"> <img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_admin_2.png?raw=true" height="430"> <img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_admin_3.png?raw=true" height="130"> <img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/set_admin_4.png?raw=true" height="500">

8. Open Telegram Web, open the Archive group chat and copy the ID:

<img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/save_chat_id.png?raw=true" height="140">

9. Go on your Firebase account, create a new project and a new Realtime Database instance
10. Copy the base URL of the realtime database, we are going to reference if with <FIREBASE_REALTIME_DATABASE_BASE_URL>:

<img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/database_url.png?raw=true" height="200">

11. Go in the Rules section of the realtime database and set the following code:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

12. Create a folder on your local computer. It will be used to store downloaded files. We are going to reference this folder with <DOWNLOADS_FOLDER>
13. Go on the following folder: <REPOSITORY_FOLDER>/server
14. Create a .env file in the server root and add the following code:

```yaml
BOT_TOKEN=<BOT_TOKEN>
ARCHIVE_CHATID=-100<GROUP_ARCHIVE>
REALTIME_DATABASE_URL=<FIREBASE_REALTIME_DATABASE_BASE_URL>
DOWNLOAD_FOLDER_PATH=<DOWNLOADS_FOLDER>
```

15. Change <...> with the correct values
16. Run the following commands on a console:

```
npm install
```

### Start client and server
1. Open <REPOSITORY_FOLDER>/server folder
2. Run the following command on a console:

```
npm start
```

3. Keep the console open while using HorizonGram
4. Open <REPOSITORY_FOLDER>/client folder
5. Open index.html file with a browser

### Server endpoints
Base URL: http://localhost:3000/
- [GET] api/status -> check if server is alive
- [GET] api/folder -> get folders and files list
- [POST] api/folder -> create a new folder
- [DELETE] api/folder -> delete a folder
- [POST] api/file/upload -> upload a new file
- [POST] api/file/download -> download a file
- [DELETE] api/file -> delete a file
- [POST] api/chunks/upload/checks -> do some integrity checks on the file to upload with chunks upload service
- [POST] api/chunks/upload/preparation -> prepare the file to be uploaded with chunks upload service
- [POST] api/chunks/upload -> it's the chunks upload service, upload a single chunk
