'use strict'

const line = require('line-by-line')
const fs = require('fs')
const es = require('elasticsearch')

const HOST = 'localhost:9200'
const INDEX = 'catalog-1'
const BATCH = 2000
const args = process.argv

if (args.length !== 3) {
  console.log('Opps node ./es-load.js <filename>')
}

let reader = new line('sample-data.txt')
let client = es.Client({ host: HOST, log: 'error' })
let bulk = [];
let c = 0;

let add = (bulk, data) =>  {
  bulk.push({'index': {'_type': 'item'}})
  bulk.push(data)
}


reader.on('line', (line) => {
  c++;
  reader.pause()
  add(bulk, line)
  if (c % BATCH === 0) {
    client.bulk({index: INDEX, body: bulk}, (err, res)=> {
      console.log('Processed ', c)
      if (err) { console.log('error', err) }
    });
  }
})

if (bulk.length > 0) {
  client.bulk({index: INDEX, body: bulk}, (err, res)=> {
    console.log('Processed ', c)
    if (err) { console.log('error', err) }
  });
}
