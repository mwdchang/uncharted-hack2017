'use strict'

const SERVER = 'ws://45.55.209.67:4571/rtsearches'
const WS = require('ws')
const fs = require('fs')
const socket = new WS(SERVER)
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

socket.on('open', ()=> {
   console.log('connected...')
})

socket.on('message', (evt)=> {
   let searchData = JSON.parse(evt);
   searchData = searchData[0] || {};
   searchData.timestamp = (new Date()).getTime()

   console.log('recevied', searchData);

   // FIXME
   searchData.hits = [
     {title: 'title 1', subject:['orange', 'apple', 'coffee']},
     {title: 'title 2', subject:['orange', 'apple',]},
     {title: 'title 3', subject:['orange', 'apple', 'coffee', 'music']}
   ]
   // console.log(JSON.stringify(searchData, true, 1));
   io.emit('broadcast', searchData);
})

io.on('connection', (socket)=> {
  // io.emit('broadcast', 'blahblah')
})

io.on('disconnect', (data) => {
})

io.on('event', (data) => {
})


app.get('/distribution', (req, res) => {
  let dummy = [
    {subject: 'orange', value: 0.1},
    {subject: 'apple', value: 0.1},
    {subject: 'grape', value: 0.2},
    {subject: 'coffee', value: 0.2},
    {subject: 'mouse', value: 0.1},
    {subject: 'computer', value: 0.3},
    {subject: 'music', value: 0.1}
  ];
  res.statuscode = 200;
  res.json(dummy);
})



app.get('/xyz', (req, res) => {
   res.statuscode = 200
   res.json({xyz: 'hello'})
});

server.listen(22222)
