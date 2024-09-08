1. Start a chat with https://t.me/BotFather on Telegram
2. Send the following message: /newbot
3. Choose a unique username that we are going to reference with <BOT_USERNAME>
4. If the creation successes, BotFather will send you a message with the bot token, that we are going to reference with <BOT_TOKEN>
5. Create a group chat named "Archive" with the id that we are going to reference with <GROUP_ARCHIVE>
6. Create a group chat named "List" with the id that we are going to reference with <GROUP_LIST>
7. Make the List group chat as a topic chat by editing the settings:

![image](https://github.com/user-attachments/assets/f337c52a-cf5f-4256-bf4c-2fcb7039fbc8)

8. Create a .env file in the server root and add the following variables:

![image](https://github.com/user-attachments/assets/df58843c-5d71-4268-be14-c46cd113e699)

Note: the <GROUP_LIST> was changed when you set the topic chat. Now you should report the id in the .env file by adding a "100".
For example: <GROUP_LIST> = -5637546 -> -1005637546.

9. Add the bot into each group
10. In the List group, promote the bot as an administrator in the group settings
