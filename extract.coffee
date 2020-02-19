request = require "request-promise"

request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/dawn_of_industry_eu_league1/landing\?page_number\=0\&page_size\=290\&sort_by\=rating\&sort_order\=desc\&timezone_offset\=-60'
.then (res) ->
  # console.log res
  JSON.parse(res).data.forEach (prov) ->
    if prov.attackers_count < 32
      console.log "#{prov.arena_name}, #{prov.name}, #{if prov.owner then prov.owner.elo_rating_10 else ''}"
