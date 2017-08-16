'use strict'

const fs = require('fs')
const sax = require('sax')

const XML = '/home/ubuntu/data/Endeca.xml'

let saxStream = sax.createStream(false, {
   trim: true
})
let count = 0
let obj = null;
let key = null;

let start = (new Date()).getTime()

saxStream.on('opentag', function(node) {
   if (node.name === 'RECORD') {
      obj = {}
   } else if (node.name === 'PROP') {
      key = node.attributes.NAME
      if (obj.hasOwnProperty(key) === false) {
         obj[key] = []
      }
   }
})

saxStream.on('text', function(text) {
   if (obj !== null && text !== '' && key !== null) obj[key].push(text)
})

saxStream.on('closetag', function(tag) {
   if (tag === 'RECORD') {
      console.log(JSON.stringify(obj))
      count++

      if (count % 1000 === 0) {
         let now = (new Date()).getTime()
         console.error(count, (count / ((now - start)/1000)).toFixed(2))
      }

   } else if (tag === 'PROP') {
      key = null
   }
})

fs.createReadStream(XML).pipe(saxStream)
