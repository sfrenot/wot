app = require('express')()
request = require "request-promise"
#tough = require "tough-cookie"
_ = require "lodash"

formatDate = (date, offset) ->
  heure = String(Number(date.substring(0,2))+1)
  if offset
    heure+":15"
  else
    heure+":00"

colors =
  '17:00:00false': '#eaea67'
  '17:00:00true': '#bdca3e'
  '18:00:00false': '#7fa3bf'
  '18:00:00true': '#4e7fa5'
  '19:00:00false': '#62d867'
  '19:00:00true': '#c1ec8e'
  '20:00:00false': '#b1d2b2'
  '20:00:00true': '#c3d4c3'
  '21:00:00false': '#99e89c'
  '21:00:00true': '#cce8cc'

traduction =
  'Abbey': 'Abbaye'
  'Cliff': 'Falaise'
  'Fisherman\'s Bay': 'Baie du pêcheur'
  'Karelia': 'Carélie'
  'Highway': 'Autoroute'
  'Pearl River': 'Rivière de perles'
  'Serene Coast': 'Plage sereine'
  'Sand River': 'Rivière de sable'
  'Serene Coast': 'Plage sereine'


getInfo = (prov) ->
  request "https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=#{prov.alias}"
  .then (r) ->
    res = JSON.parse(r)
    Fws = false
    prets = res.pretenders.map (pret) ->
      if pret.tag is 'FWS'
        Fws = true
        "<b style='color: red'>FWS</b>"
      else
       pret.elo_rating

    if prov.attackers_count < 32 || Fws
	    "<tr style='background-color: #{colors[prov.primetime+prov.is_battle_offset]}'><td>#{if traduction[prov.arena_name]? then traduction[prov.arena_name] else prov.arena_name}</td><td>#{formatDate(prov.primetime, prov.is_battle_offset)}</td><td>#{prov.name} (#{if prov.owner then prov.owner.elo_rating_10 else ''} / #{prov.attackers_count})</td><td>#{prets.join(', ')}</td></tr>"


getData2 = () ->
  a = """
    <table>
      <colgroup>
       <col span="1" style="width: 125px;">
       <col span="1">
       <col span="1" style="width: 245px;">
       <col span="1">
      </colgroup>
      <tr style="text-align: left;">
        <th>Carte</th><th>Heure</th><th>Province</th><th>Attaquants</th>
      </tr>
  """
  promises = []

  # request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/dawn_of_industry_eu_league1/landing\?page_number\=0\&page_size\=290\&sort_by\=rating\&sort_order\=desc\&timezone_offset\=-60'
  # https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing?page_number=1&page_size=30&sort_by=applications_number&sort_order=desc&timezone_offset=-120
  # https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing\?page_number\=0\&page_size\=290
  #request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/dawn_of_industry_eu_league1/landing\?page_number\=0\&page_size\=290'
  #
  #cookie = new tough.Cookie
  #  wgcwx_lang: 'fr'
  #  wgcwx_csrf_token: '07a7840a-a2eb-477f-ac7b-97d24f81a2f2'
  #  wgcwx_auth_sso_attempt_immediate: yes
  #  wgcwx_oid_session_key: 'e35b522276c79d942884f36f4b04699b'
  #  wgcwx_session_key: '09aed1359eef82bb9219e910d41fc89f'

  #cookiejar = request.jar()
  #cookiejar.setCookie(cookie, 'https://eu.wargaming.net')

  #options =
  #  method: 'GET'
  #  uri: 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing\?page_number\=0\&page_size\=290'
  #  headers:
  #    'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
  #  jar: cookiejar


  request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing\?page_number\=0\&page_size\=290'
  #request options
  .then (res) ->
    # console.log res
    (_.sortBy JSON.parse(res).data, ['primetime', 'is_battle_offset', 'attackers_count']).forEach (prov) ->
      #console.log(prov)
      #process.exit()
      promises.push(getInfo(prov))

    Promise.all(promises)
    .then (res) ->
      res.forEach (ligne) ->
        unless _.isEmpty(ligne)
          # console.log 'ligne', ligne
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
