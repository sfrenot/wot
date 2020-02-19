app = require('express')()
request = require "request-promise"

# getData = () ->
#   request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/dawn_of_industry_eu_league1/landing\?page_number\=0\&page_size\=290\&sort_by\=rating\&sort_order\=desc\&timezone_offset\=-60'
#   .then (res) ->
#     # console.log res
#     a = "<table>"
#     JSON.parse(res).data.forEach (prov) ->
#       if prov.attackers_count < 32
#         a = a.concat("<tr><td>#{prov.arena_name}</td><td>#{prov.primetime}</td><td>#{prov.name}</td><td>#{if prov.owner then prov.owner.elo_rating_10 else ''}</td><tr>")
#     a.concat("</table>")


getInfo = (prov) ->
  # console.log "->#{prov.alias}"
  request "https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=#{prov.alias}"
  .then (r) ->
    res = JSON.parse(r)
    prets = res.pretenders.map (pret) ->
      pret.elo_rating
    "<tr><td>#{prov.arena_name}</td><td>#{prov.primetime}</td><td>#{prov.name} (#{if prov.owner then prov.owner.elo_rating_10 else ''} / #{prov.attackers_count})</td><td>#{prets.join(', ')}<tr>"

getData2 = () ->
  a = "<table>"
  promises = []

  request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/dawn_of_industry_eu_league1/landing\?page_number\=0\&page_size\=290\&sort_by\=rating\&sort_order\=desc\&timezone_offset\=-60'
  .then (res) ->
    # console.log res
    JSON.parse(res).data.forEach (prov) ->
      if prov.attackers_count < 32
        promises.push(getInfo(prov))
    Promise.all(promises)
    .then (res) ->
      res.forEach (ligne) ->
        a = a.concat(ligne)

      a = a.concat("</table>")
      # console.log '->', a
#
app.get '/', (req, res) ->
  getData2().then (rep) ->
    # console.log "->", rep
    res.send(rep)

# getData2()
module.exports = app
