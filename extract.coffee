app = require('express')()
request = require "request-promise"

getData = () ->
  request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/dawn_of_industry_eu_league1/landing\?page_number\=0\&page_size\=290\&sort_by\=rating\&sort_order\=desc\&timezone_offset\=-60'
  .then (res) ->
    # console.log res
    a = "<table>"
    JSON.parse(res).data.forEach (prov) ->
      if prov.attackers_count < 32
        a = a.concat("<tr><td>#{prov.arena_name}</td><td>#{prov.primetime}</td><td>#{prov.name}</td><td>#{if prov.owner then prov.owner.elo_rating_10 else ''}</td><tr>")
    a.concat("</table>")

app.get '/', (req, res) ->
  getData().then (rep) ->
    # console.log "->", rep
    res.send(rep)

module.exports = app
