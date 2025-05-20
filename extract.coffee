app = require('express')()
request = require "request-promise"
tough = require "tough-cookie"
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

displayLink = (elo, tag, id) ->
  "[<a href=\"https://eu.wargaming.net/globalmap/game_api/clan/#{id}\">#{elo}-#{tag}</a>]"

getInfo = (prov) ->
  request "https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=#{prov.alias}"
  .then (r) ->
    res = JSON.parse(r)
    Fws = false
    prets = res.pretenders.map (pret) ->
      if pret.tag is 'GROUT'
        Fws = true
        "<b style='color: red'>GROUT</b>"
      else
       displayLink(pret.elo_rating,pret.tag, pret.id)

    if prov.attackers_count < 32 || Fws
     owner = if prov.owner
       displayLink(prov.owner.elo_rating_10,prov.owner.tag, prov.owner.id)
     else
       ""
	
      "<tr style='background-color: #{colors[prov.primetime+prov.is_battle_offset]}'><td>#{if traduction[prov.arena_name]? then traduction[prov.arena_name] else prov.arena_name}</td><td>#{formatDate(prov.primetime, prov.is_battle_offset)}</td><td>#{prov.name} (#{owner} / #{prov.attackers_count})</td><td>#{prets.join(', ')}</td></tr>"


getData2 = () ->
  a = """
    <table>
      <colgroup>
       <col span="1" style="width: 130px;">
       <col span="1">
       <col span="1" style="width: 330px;">
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
  #
  cookie = new tough.Cookie
    wgcwx_csrf_token:'07a7840a-a2eb-477f-ac7b-97d24f81a2f2'
    wgcwx_auth_sso_attempt_immediate:'yes'
    wgcwx_lang:'fr'
    wgcwx_oid_session_key:'e35b522276c79d942884f36f4b04699b'
    wgcwx_session_key:'09aed1359eef82bb9219e910d41fc89f'
    teclient:'1740006295128418326'
    'cm.internal.bs_id':'a5b4a3a6-796f-472c-f725-4679af3acbff'
    wgn_realm:'eu'
    OptanonAlertBoxClosed:'2025-05-09T07:43:04.374Z'
    _ga:'GA1.1.1123040020.1746776585'
    _yjsu_yjad:'1746776585.64eda85c-df3d-46f8-b64a-82b4c27bd81a'
    'cm.internal.spa_id':'519617862'
    'cm.internal.realm':'eu'
    csrftoken:'ra2wIi9DU9V95rrnqEqER3IGqi0Y5RBQ'
    _gcl_au:'1.1.2036299121.1746776584.1968607514.1747721724.1747721726'
    npprod_wgn_account_is_authenticated:'yes'
    django_language:'fr'
    wgn_account_is_authenticated:'yes'
    session_id:'a5b4a3a6-796f-472c-f725-4679af3acbff'
    sessionid:'ku2o3cn7pwta6u8iihkhfhvlbr9njjpd'
    authentication_confirmation_expires_at:'1747722352'
    wgni_use_browser_history_update:'Q8yo2RmuJTjTOXQFmXQRPB5lEaZBppMP'
    OptanonConsent:'isGpcEnabled=0&datestamp=Tue+May+20+2025+10%3A49%3A14+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202502.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=5eb741ee-1202-4585-9e01-3c5783df228f&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CC0002%3A1%2CC0004%3A1%2CC0005%3A1&intType=1&geolocation=FR%3BARA&AwaitingReconsent=false'
    tspaid:'JA9sD4ABRKhYguOWFbvNgJwKnR7v9FwtZnO2amWwERqlS2M6wQjHqJk2QJw8OjTyzrLLS60UzrWlTY6313jDuHA'
    _ga_BWRKLL4HR5:'GS2.1.s1747721721$o3$g1$t1747730961$j53$l0$h0$dTUWBDZCC8ICM1vJeylczJ4jvTq_GSvUHoA'

  cookiejar = request.jar()
  cookiejar.setCookie(cookie, 'https://eu.wargaming.net')

  options =
    method: 'GET'
    uri: 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing\?page_number\=0\&page_size\=290'
    headers:
      'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      'x-csrf-token': '07a7840a-a2eb-477f-ac7b-97d24f81a2f2'

    jar: cookiejar


  #request 'https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing\?page_number\=0\&page_size\=290'
  request options
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
