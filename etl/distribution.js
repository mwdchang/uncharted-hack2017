'use strict'

const line = require('line-by-line')
const fs = require('fs')
const _ = require('lodash')

const args = process.argv

if (args.length !==  3) {
  console.error('Oops.... node ./distribution <input>')
  process.exit(1)
}

const input = args[2]

let reader = new line(input)
let c = 0
let distribution = {}

reader.on('line', (line) => {
  const r = JSON.parse(line)

  // Compute
  r.p_subject.forEach( d => {
    if (distribution.hasOwnProperty(d) === false) distribution[d] = 0
    distribution[d] += parseInt(r.p_copies[0], 10)
  })
})

reader.on('end', ()=> {
  const keys = Object.keys(distribution)
	let list = []
	let total = 0;
  keys.forEach(key => {
		list.push({
			subject: key,
			value: distribution[key]
		})
		total += distribution[key]
	})
  let results = _.orderBy(list, [d => -d.value]);
	results = _.take(results, 100);

  console.log(JSON.stringify({
		total: total,
		distribution: results}))
})
