"use strict";
import express from 'express';
import got from 'got';
import _ from 'lodash';

const DELAY = 10;

const app = express();

const formatDate = function(date, offset) {
  const heure = String(Number(date.substring(0, 2)) + 2);

  if (offset) {
    return heure + ":15";
  } else {
    return heure + ":00";
  }
};

const colors = {
  '17:00:00false': '#eaea67',
  '17:00:00true': '#bdca3e',
  '18:00:00false': '#7fa3bf',
  '18:00:00true': '#4e7fa5',
  '19:00:00false': '#62d867',
  '19:00:00true': '#c1ec8e',
  '20:00:00false': '#b1d2b2',
  '20:00:00true': '#c3d4c3',
  '21:00:00false': '#99e89c',
  '21:00:00true': '#cce8cc'
};

const traduction = {
  'Abbey': 'Abbaye',
  'Cliff': 'Falaise',
  'Fisherman\'s Bay': 'Baie du pêcheur',
  'Karelia': 'Carélie',
  'Highway': 'Autoroute',
  'Pearl River': 'Rivière de perles',
  'Serene Coast': 'Plage sereine',
  'Sand River': 'Rivière de sable',
  'Serene Coast': 'Plage sereine'
};

const displayLink = function(elo, tag, id, isRed, battleCount, winPercent) {
  // "[<a href=\"https://eu.wargaming.net/globalmap/game_api/clan/" + id + "\">" + elo + "-" + tag + "</a>]";
  const redColor = isRed ? "red" : "black"; 
  return `[${elo}/<a style='color: ${redColor}' target='_blank' href='https://eu.wargaming.net/clans/wot/${id}'>${tag}</a>/${battleCount}/${winPercent}]`;
};

const getInfo = async function(prov) {
  const res = await got("https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=" + prov.alias).json()
  
  let owner = '';
  let Fws = false;

  const prets = res.pretenders.map(function(pret) {
    if (pret.tag === 'GR0UT') {
      Fws = true;
      return `<b style='color: red'>${displayLink(pret.elo_rating, pret.tag, pret.id, true, pret.arena_battles_count, pret.arena_wins_percent)}</b>`;
    } else {
      return displayLink(pret.elo_rating, pret.tag, pret.id, false, pret.arena_battles_count, pret.arena_wins_percent);
    }
  });

  if (prov.attackers_count < 32 || Fws) {
    owner = prov.owner ? displayLink(prov.owner.elo_rating_10, prov.owner.tag, prov.owner.id, false, res.owner.arena_battles_count,res.owner.arena_wins_percent) : "";
  }
  
  return `
    <tr style='background-color: ${colors[prov.primetime + prov.is_battle_offset]}'>
    <td>${traduction[prov.arena_name] != null ? traduction[prov.arena_name] : prov.arena_name}</td>
    <td>${formatDate(prov.primetime, prov.is_battle_offset)}</td>
    <td>${prov.name} ${owner}</td>
    <td>${prets.join('<BR>')}</td></tr>`;
};

const delay = function () {
  return new Promise(function(res) {
    return setTimeout(res, DELAY);
  });
};

const getData2 = async function() {
  const a = `
  <table>
    <colgroup>
    <col span=\"1\" style=\"width: 130px;\">
    <col span=\"1\">  
    <col span=\"1\" style=\"width: 370px;\">
    <col span=\"1\">
    </colgroup>
    <tr style=\"text-align: left;\">
      <th>Carte</th><th>Heure</th><th>Province</th><th>Attaquants (${(new Date()).toLocaleTimeString()})</th>
    </tr>
  `;
  const provincesData = await got('https://eu.wargaming.net/globalmap/game_api/provinces/filter/season_22_eu/landing\?page_number\=0\&page_size\=290')
  const provinces = _.sortBy(JSON.parse(provincesData.body).data, ['primetime', 'is_battle_offset', 'attackers_count']);
  const results = [a];

  for (let province of provinces) {
    console.log("Rechecherche province " + province.alias);
    // await delay();
    const info = await getInfo(province);
    results.push(info);
    // break;
  }

  results.push("</table>");

  return results.join('\n');
};

app.get('/', function(req, res) {
  return getData2().then(function(rep) {
    return res.send(rep);
  }).catch(function(err) {
    console.log(err);
    return res.send("Erreur");
  }
  );
});

export default app;
