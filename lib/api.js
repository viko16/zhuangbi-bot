'use strict'

const fetch = require('node-fetch')

const url = 'http://www.zhuangbi.info/search?ref=bot&mini=1&q='

function search (word) {
  if (!word) {
    return Promise.reject(new Error('word must not be empty'))
  }

  return fetch(url + encodeURIComponent(word.toString()))
    .then(res => res.json())
}

module.exports = { search }
