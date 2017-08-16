'use strict'

// Server and web socket stuff
const SERVER = 'ws://45.55.209.67:4571/rtsearches'
const WS = require('ws')
const fs = require('fs')
const socket = new WS(SERVER)
const express = require('express')
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cors = require('cors')


// ES stuff
const es = require('elasticsearch')
const HOST = 'http://10.64.16.97:9200'
const INDEX = 'catalog-1'
const client = es.Client({ host: HOST, log: 'error' })

// Misc
const _ = require('lodash')


// Cache
const distribution = JSON.parse(fs.readFileSync('distribution.json', 'utf-8'))
let totalSearch = 0;
let rtDistribution = {};


socket.on('open', ()=> {
   console.log('connected...')
})

socket.on('message', (evt)=> {
   let searchData = JSON.parse(evt);
   searchData = searchData[0] || {};
   searchData.timestamp = (new Date()).getTime()

   console.log('recevied', searchData);

   client.search({
     index: INDEX,
     type: 'item',
     body: {
       size: 20,
       query: {
         bool: {
           should: [

             {
               match_phrase : {
                 p_title: {
                   query: searchData.terms,
                   boost: 3
                 }
               }
             },

             {
               match_phrase : {
                 p_author: {
                   query: searchData.terms,
                   boost: 2
                 }
               }
             },


             // Should 1: title
             {
               match : {
                 p_title: {
                   query: searchData.terms,
                   operator: 'or'
                 }
               }
             },

             // Should 2: subject
             {
               match:  {
                 p_subject: {
                   query: searchData.terms,
                   operator: 'or'
                 }
               }
             }

           ]
         }
       }
     }
   }).then(
     function(response) {
       // console.log(response.hits)
       let results = response.hits.hits.map( d => d._source );
       let matches = [];
       let subjects = [];
       results.forEach( r => {
         // console.log('> ', r.p_title)
         matches.push(r.p_title[0])
         subjects = subjects.concat(r.p_subject)
       })

       /*
       console.log('!!!', matches)
       console.log('!!!', subjects)
       */

       searchData.matches = matches
       searchData.subjects = _.uniq(subjects)

       totalSearch++
       let temp = searchData.subjects
       temp.forEach( t => {
         if (rtDistribution.hasOwnProperty(t) === false) {
           rtDistribution[t] = 0;
         }
         rtDistribution[t] ++;
       })

       const keys = Object.keys(rtDistribution)
       let list = []
       keys.forEach(key => {
     		 list.push({
     		 	subject: key,
     		 	value: rtDistribution[key]
     		 })
     	 })
       let rtResults = _.orderBy(list, [d => -d.value]);
     	 rtResults = _.take(rtResults, 10);
       let payload = {
         total: totalSearch,
         distribution: rtResults
       }

       io.emit('broadcast', {type:'search', data: searchData})
       io.emit('broadcast', {type:'rt-distribution', data: payload})
     },
     function(error) {
       console.log('doh !!!!', error)
     }
   );


   // console.log(JSON.stringify(searchData, true, 1));
   // io.emit('broadcast', searchData);
})

io.on('connection', (socket)=> {
  // io.emit('broadcast', 'blahblah')
})

io.on('disconnect', (data) => {
})

io.on('event', (data) => {
})



app.use(cors())
app.use(express.static('ui/build'))

app.get('/api/distribution', (req, res) => {
  /*
  let dummy = [
    {subject: 'orange', value: 0.1},
    {subject: 'apple', value: 0.1},
    {subject: 'grape', value: 0.2},
    {subject: 'coffee', value: 0.2},
    {subject: 'mouse', value: 0.1},
    {subject: 'computer', value: 0.3},
    {subject: 'music', value: 0.1}
  ];
  */
  res.statuscode = 200;
  res.json(distribution);
})

app.get('/xyz', (req, res) => {
   res.statuscode = 200
   res.json({xyz: 'hello'})
});

app.get('/', (req, res) => {
  res.sendFile('/index.html');
})


server.listen(22222)
