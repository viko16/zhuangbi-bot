'use strict'

const TG_TOKEN = process.env.TG_TOKEN
const SERVER_HOST = process.env.SERVER_HOST

const TelegramBot = require('node-telegram-bot-api')
const api = require('./api')

let bot

if (process.env.NODE_ENV !== 'development') {
  // running in server
  bot = new TelegramBot(TG_TOKEN)
  bot.setWebHook(SERVER_HOST + bot.token)
  console.log('running in production')
} else {
  // developing
  bot = new TelegramBot(TG_TOKEN, { polling: true })
  console.log('running in development')
}

// 内联查询
bot.on('inline_query', (inline) => {
  if (!inline.query || !inline.query.trim()) {
    return
  }

  api.search(inline.query.trim())
    .then(json => {
      // Arrya<InlineQueryResultGif> | Array<InlineQueryResultPhoto>
      const rst = generateResult(json)
      return bot.answerInlineQuery(inline.id, rst)
    })
    .catch(err => {
      console.error('error: ', err)
      return bot.sendMessage(inline.from.id, 'Seems something wrong 😨')
    })
})

// 普通应答
bot.on('text', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "I'm alive! And get " + msg.text)
})

module.exports = bot

/**
 * 转换成符合 InlineQueryResultGif 或 InlineQueryResultPhoto 的数组
 * 根据文档所示，最多只保留前 50 个
 *
 * @param {Array<Object>} arr
 * @returns Arrya<InlineQueryResultGif> | Array<InlineQueryResultPhoto>
 */
function generateResult (arr) {
  let result = []
  arr = arr.slice(0, 50)

  arr.forEach(el => {
    if (el.image_url.endsWith('.gif')) {
      // https://core.telegram.org/bots/api#inlinequeryresultgif
      result = result.concat({
        type: 'gif',
        id: el.id.toString(),
        gif_url: el.image_url + '?ref=bot',
        thumb_url: el.image_url + '?ref=bot',
        gif_width: parseInt(el.w, 10),
        gif_height: parseInt(el.h, 10)
      })
    } else {
      // https://core.telegram.org/bots/api#inlinequeryresultphoto
      result = result.concat({
        type: 'photo',
        id: el.id.toString(),
        photo_url: el.image_url + '?ref=bot',
        thumb_url: el.image_url + '?ref=bot',
        photo_width: parseInt(el.w, 10),
        photo_height: parseInt(el.h, 10)
      })
    }
  })
  return result
}
