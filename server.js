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
})

io.on('connection', (socket)=> {
  io.emit('broadcast', 'blahblah')
})

io.on('disconnect', (data) => {
})

io.on('event', (data) => {
})

app.get('/xyz', (req, res) => {
   res.statuscode = 200
   res.json({xyz: 'hello'})
});

server.listen(22222)
