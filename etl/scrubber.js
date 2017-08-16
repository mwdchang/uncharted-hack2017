'use strict'

const line = require('line-by-line')
const fs = require('fs')

const args = process.argv

if (args.length < 3) {
  console.error('Oops.... node ./scrubber <input> [limit]')
  process.exit(1)
}

const input = args[2]
const limit = args[3] || null

let reader = new line(input)
let c = 0
let distribution = {}

let normalizeSubject = (s, i) => {
  return s.split('--')[0].toLowerCase()
}

reader.on('line', (line) => {
  const l = JSON.parse(line)
  let r = {}

  // Remap
  r.p_record_id = l.p_record_id
  r.p_date = l.p_date_created_item || l.p_date_catalogued || []
  r.p_date_general = l.p_date_general || []
  r.p_title = l.p_title_full || l.p_title_short || []
  r.p_author = l.p_author_personal_full || l.p_author_unaccented || l.p_author_main || []
  r.p_subject = (l.p_subject_unaccented || []).map(normalizeSubject)
  r.p_isbn = l.p_num_isbn || []
  r.p_copies = l.p_numCopies || ["1"] // Maybe kick if there are no copies

  // Normalize dates
  if (r.p_date.length > 1) { r.p_date = [r.p_date[0]] }
  if (r.p_date_general.length > 1) { r.p_date_general = [r.p_date_general[0]] }

  // Sanity
  if (r.p_title.length === 0 || r.p_author.length === 0) return

  // Compute
  r.p_subject.forEach( d => {
    if (distribution.hasOwnProperty(d) === false) distribution[d] = 0
    distribution[d] += parseInt(r.p_copies[0], 10)
  })

  c++
  console.log(JSON.stringify(r))
  if (limit > 0 && c >= limit) process.exit(0)
})

reader.on('end', ()=> {
  console.error('all done')
  console.error(JSON.stringify(distribution, true, 2))
})
