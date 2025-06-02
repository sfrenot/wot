"use strict";
import express from 'express';
import got from 'got';
import _ from 'lodash';
import fs from 'fs/promises';
import provinces_pret from './provinces_pret.json' with { type: "json" };
import clan_results from './clan_results.json' with { type: "json" };

const DELAY = 10;

const app = express();
const CLAN_ID = 500165786;

const groutDesc = await got(`https://eu.wargaming.net/globalmap/game_api/clan/${CLAN_ID}`).json();

const formatDate = function(date, offset) {
  const heure = String(Number(date.substring(0, 2)) + 2);

  if (offset) {
    return heure + ":15";
  } else {
    return heure + ":00";
  }
};

const cartes = {
  "Abbey": {"traduction": "Abbaye", "base": "S"},
  "Cliff": {"traduction": "Falaise", "base": "S"},
  "El Halluf": {"traduction": "El Halluf", "base": "S"},
  "Ensk": {"traduction": "Ensk", "base": "N"},
  "Fisherman's Bay": {"traduction": "Baie du pêcheur", "base": "N"},
  "Highway": {"traduction": "Autoroute", "base": "N"},
  "Himmelsdorf": {"traduction": "Himmelsdorf", "base": "S"},
  "Karelia": {"traduction": "Carélie", "base": "N"},
  "Lakeville": {"traduction": "Lakeville", "base": "N"},
  "Live Oaks": {"traduction": "Live Oaks", "base": "S"},
  "Malinovka": {"traduction": "Malinovka", "base": "S"},
  "Mines": {"traduction": "Mines", "base": "S"},
  "Murovanka": {"traduction": "Murovanka", "base": "N"},
  "Pearl River": {"traduction": "Rivière de perles", "base": "N"},
  "Prokhorovka": {"traduction": "Prokhorovka", "base": "N"},
  "Redshire": {"traduction": "Redshire", "base": "S"},
  "Sand River": {"traduction": "Rivière de sable", "base": "E"},
  "Serene Coast": {"traduction": "Plage sereine", "base": "S"},
  "Steppes": {"traduction": "Steppes", "base": "S"},
  "Westfield": {"traduction": "Westfield", "base": "S"}
};


const colors = {
  '16:00:00false': '#eaff67',
  '16:00:00true': '#ffca3e',
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

const getColorElo = function(elo) {
  if (elo <= groutDesc.elo_rating_10) {
    return "SpringGreen";
  } else if (elo < groutDesc.elo_rating_10 +100) {
    return "yellow";
  } else {
    return "red";
  }
}

const getColorPwin = function(pwin) {
  if (pwin >= 60) {
    return "SpringGreen";
  } else if (pwin >= 10) {
    return "yellow";
  } else {
    return "red";
  }
}

const getRisk = function(elo, pwin) {
  if (getColorElo(elo) === getColorPwin(pwin)) { // Thumb
    return `<td style="background: ${getColorElo(elo)}">&#128077;</td>`;
  } else if (getColorPwin(pwin) === "SpringGreen") { // Smiley
    return `<td style="background: ${getColorPwin(pwin)}">&#128522;</td>`;
  } else { // Question mark
    return `<td style="color: ${getColorPwin(pwin)}">&#9888;</td>`;
  }
}

const displayLink = function(elo, tag, id, isRed, battleCount, winPercent) {
  // "[<a href=\"https://eu.wargaming.net/globalmap/game_api/clan/" + id + "\">" + elo + "-" + tag + "</a>]";
  // const redColor = isRed ? "red" : (elo <= groutDesc.elo_rating_10 ? "SpringGreen" : "orangeRed"); 


  return `[${elo}/<a style='color: ${getColorElo(elo)}' target='_blank' href='https://eu.wargaming.net/clans/wot/${id}'>${tag}</a>/${battleCount}/${winPercent}]`;
};

const getInfo = async function(prov) {
  const res = await got("https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=" + prov.alias).json()
  
  let owner = '';
  let Fws = false;

  let prets = res.pretenders.map(function(pret) {
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

  if (_.isEmpty(prets)) {
    prets=provinces_pret[prov.name] || [];
  } else {
    provinces_pret[prov.name] = prets;
  }
  
  return `
    <tr style='background-color: ${colors[prov.primetime + prov.is_battle_offset]}'>
      <td> <img src='${prov.arena_name.replace(/'/, '')}.png' width="60px" ></img></td>
      <td>${cartes[prov.arena_name].traduction} (${cartes[prov.arena_name].base})</td>
      <td>${formatDate(prov.primetime, prov.is_battle_offset)}</td>
      <td>${prov.name} ${owner}</td>
      <td>${prets.join('<BR>')}</td>
    </tr>`;
};

const delay = function () {
  return new Promise(function(res) {
    return setTimeout(res, DELAY);
  });
};
//   <table style=\"display: inline-block; vertical-align: top;\">
const getData2 = async function() {
  const a = `
  <head>
    <style>
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
      }
    </style>
  </head>
  <div style=" font-size: 20px; font-weight: bold;">
  ${groutDesc.tag} - ${groutDesc.elo_rating_10}  / ${groutDesc.battles_count_10} / ${groutDesc.wins_percent_10} --  ${(new Date()).toLocaleTimeString()}
  </div>
  <table style=\"display: inline-block;\">
    <colgroup>
      <col span=\"1\" style=\"width: 60px;\"">
      <col span=\"1\" style=\"width: 140px;\">
      <col span=\"1\">  
      <col span=\"1\" style=\"width: 370px;\">
      <col span=\"1\">
    </colgroup>
    <tr style=\"text-align: left;\">
      <th></th><th>Carte (Base Verte)</th><th>Heure</th><th>Province</th><th>Attaquants</th>
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
  // ****************************
  //     Injection leaderboard
  // ****************************
  //Test 
  // const results = []
  results.push(`
    <table style="display: inline-block;
           vertical-align: top; margin-left: 20px;
           text-align: center;">
      <tr><th>[Cote/Tag/#ba/win]</th><th>Victoires</th><th>Défaites</th><th>Status</th><th style="border: 3px solid;">Risque</th></tr>
  `);

  _.forEach(clan_results, (clan) => {
    const pwin = clan.wins * 100 / (clan.wins + clan.losts);

    results.push(`
      <tr>
        <td>${displayLink(clan.detail.elo_rating_10, clan.detail.tag, clan.detail.id, false, clan.detail.battles_count_10, clan.detail.wins_percent_10)}</td>
        <td>${clan.wins}</td>
        <td>${clan.losts}</td>
        <td style='color: ${getColorPwin(pwin)};'>***</td>
        ${getRisk(clan.detail.elo_rating_10, pwin)}
      </tr>
    `);
  })
  
  results.push("</table>");
  return results.join('\n');
};

app.get('/', function(req, res) {
  return getData2().then(function(rep) {
    fs.writeFile('./provinces_pret.json', JSON.stringify(provinces_pret, null, 2))
    .then(() => {
      return res.send(rep);
    })
  }).catch(function(err) {
    console.log(err);
    return res.send("Erreur");
  });
});

export default app;
