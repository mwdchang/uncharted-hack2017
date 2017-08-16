'use strict'

const line = require('line-by-line')
const fs = require('fs')
const es = require('elasticsearch')

// const HOST = 'localhost:9200'
const HOST = 'http://10.64.16.97:9200'
const INDEX = 'catalog-1'
const BATCH = 2000
const args = process.argv

if (args.length !== 3) {
  console.log('Opps node ./es-load.js <filename>')
}

let reader = new line(args[2])
let client = es.Client({ host: HOST, log: 'error' })
let bulk = [];
let c = 0;

let add = (bulk, data) =>  {
  bulk.push({'index': {'_type': 'item'}})
  bulk.push(data)
}



reader.on('line', (line) => {
  c++;
  add(bulk, JSON.parse(line))
	// console.log('line', line);

  if (c % BATCH === 0) {
    reader.pause()
	// console.log('hi');
    client.bulk({index: INDEX, body: bulk}, (err, res)=> {
      console.log('Processed ', c)
      if (err) { console.log('error', err) }
		  bulk = []
      reader.resume()
    });
  }
})


reader.on('end', ()=> {
  console.log('bukl', bulk.length);
  if (bulk.length > 0) {
    client.bulk({index: INDEX, body: bulk}, (err, res)=> {
      console.log('Processed ', c)
      if (err) { console.log('error', err) }
    });
  }
});
