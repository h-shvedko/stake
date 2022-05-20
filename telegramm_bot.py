import time, subprocess
import telepot
from telepot.loop import MessageLoop
from telepot.namedtuple import InlineQueryResultArticle, InputTextMessageContent


def handle(msg):
    print(msg)
    content_type, chat_type, chat_id = telepot.glance(msg)
    query_id, from_id, query_string = telepot.glance(msg, flavor='inline_query')
#     print ('Inline Query:', query_id, from_id, query_string)

    if (content_type == 'text'):
        command = msg['text']
        print ('Got command: %s' % command)

        if  '/help' in command:
            bot.sendMessage(chat_id, "/start - start your qraGo robot")
            bot.sendMessage(chat_id, "/stop - stop your qraGo robot")
        if  '/start' in command:
            p = subprocess.Popen('protractor confStake.js', shell=True)
            p = subprocess.Popen('protractor confBet365.js', shell=True)
            bot.sendMessage(chat_id, "Starting bet robot")
#         if '/login' in command:
#             login =
        if  '/stop' in command:
            p = subprocess.Popen('taskkill /F /IM chrome.exe', shell=True)
            bot.sendMessage(chat_id, "Stopping bet robot")


bot = telepot.Bot('5363170931:AAFwKQLhUj5cic2PCoerCuYRx-SYicAzOzo')

bot.message_loop(handle)

while 1:
    time.sleep(20)
