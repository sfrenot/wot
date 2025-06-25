"use strict";
import express from 'express';
import fssync from 'fs';
import got from 'got';
import _ from 'lodash';
import fs from 'fs/promises';
import provinces_pret from './provinces_pret.json' with { type: "json" };
import clan_results from './clan_results.json' with { type: "json" };

const DELAY = 10;

const app = express();
const CLAN_ID = 500165786;
let groutDesc;


const KEY_API = fssync.readFileSync("./key.wot", 'utf8')

const front_id = 'season_22_eu'; // ID du front

// const formatDate = function(date, offset) {
//   const heure = String(Number(date.substring(0, 2)) + 2);

//   if (offset) {
//     return heure + ":15";
//   } else {
//     return heure + ":00";
//   }
// };
const formatDate = function(date) {
  let [hh, mm] = date.split(/:/)
  return `${Number(hh)+2}:${mm}`;
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
  '16:00': '#eacc67',
  '16:15': '#ffca3e',
  '17:00': '#eaca67',
  '17:15': '#bdca3e',
  '18:00': '#7fa3bf',
  '18:15': '#4e7fa5',
  '19:00': '#62c867',
  '19:15': '#c1ec8e',
  '20:00': '#b1d2b2',
  '20:15': '#c3d4c3',
  '21:00': '#99e89c',
  '21:15': '#cce8cc'
};

const getColorElo = function(elo) {
  if (elo <= groutDesc.ratings.elo_10) {
    return "SpringGreen";
  } else if (elo < groutDesc.ratings.elo_10 +100) {
    return "Yellow"; //Jaune
  } else {
    return "red";
  }
}

const getColorPwin = function(pwin) {
  if (pwin >= 60) {
    return "SpringGreen";
  } else if (pwin >= 10) {
    return "Yellow";
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
  return `[${elo}/<a style='color: ${getColorElo(elo)}' target='_blank' href='https://eu.wargaming.net/clans/wot/${id}'>${tag}</a>/${battleCount}/${winPercent}%]`;
};

const getPretsInfo = async function(attackers) {
  let prets = attackers.map(async function(pret_id) {
    let pret = (await got(`https://api.worldoftanks.eu/wot/globalmap/claninfo/?application_id=${KEY_API}&clan_id=${pret_id}`).json()).data[pret_id];
    if (pret.tag === 'GR0UT') {
      Fws = true;
      return `<b style='color: red'>${displayLink(pret.ratings.elo_10, pret.tag, pret.clan_id, true, pret.statistics.battles_10_level, Math.trunc((pret.statistics.wins / pret.statistics.battles)*100))}</b>`;
    } else {
      return displayLink(pret.ratings.elo_10, pret.tag, pret.clan_id, false, pret.statistics.battles_10_level, Math.trunc((pret.statistics.wins / pret.statistics.battles)*100));
    }
  });

  return Promise.all(prets);
};

const getInfo = async function(prov) {
  let owner = '';
  let Fws = false;

  if (prov.owner_clan_id === CLAN_ID) { Fws = true; } // On est proprietaire

  let prets = await getPretsInfo(prov.attackers);

  // if (prov.attackers.length < 32 || Fws) {
  if (prov.owner_clan_id) {
    let ownerdetail = (await got(`https://api.worldoftanks.eu/wot/globalmap/claninfo/?application_id=${KEY_API}&clan_id=${prov.owner_clan_id}`).json()).data[prov.owner_clan_id];

    owner = displayLink(ownerdetail.ratings.elo_10, 
                        ownerdetail.tag, 
                        ownerdetail.clan_id, 
                        false, 
                        ownerdetail.statistics.battles_10_level,
                        Math.trunc((ownerdetail.statistics.wins / ownerdetail.statistics.battles)*100));
  }
  // }

  // if (_.isEmpty(prets)) {
  //   prets=provinces_pret[prov.name] || [];
  // } else {
  //   provinces_pret[prov.name] = prets;
  // }
  const heure = new Date().getHours()
  if (heure >= 18 && heure <= 23 && _.isEmpty(prets)) {
    prets=provinces_pret[prov.name] || [];
  } else {
    provinces_pret[prov.name] = prets;
  }

  return `
    <tr style='background-color: ${colors[prov.prime_time]}'>
      <td> <img src='${prov.arena_name.replace(/'/, '')}.png' width="60px" ></img></td>
      <td>${cartes[prov.arena_name].traduction} (${cartes[prov.arena_name].base})</td>
      <td>${formatDate(prov.prime_time)}</td>
      <td><a target="_blank" 
               href='https://eu.wargaming.net/globalmap/?utm_campaign=wgcc&utm_medium=link&utm_source=clan_profile_global_map_page#province/${prov.province_id}'>${prov.province_name}
          <a> ${owner}</td>
      <td>${prets.join('<BR>')}</td>
    </tr>`;
};


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
  ${groutDesc.tag} - ${groutDesc.ratings.elo_10}  / ${groutDesc.statistics.battles_10_level} / ${groutDesc.statistics.wins} --  ${(new Date()).toLocaleTimeString()}
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

  const provincesData = (await got(`https://api.worldoftanks.eu/wot/globalmap/provinces/?application_id=${KEY_API}&front_id=${front_id}`).json()).data;
  const provinces = _.sortBy(provincesData, ['battles_start_at', 'attackers.length' ]);

  const results = [a];

  for (let province of provinces) {
    console.log("Rechecherche province " + province.province_id);
    const info = await getInfo(province);
    results.push(info);
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
      <tr><th>[Cote/Tag/#ba/win]</th><th>Victoires</th><th>Défaites</th><th>Status</th><th>Risque</th></tr>
  `);

  _.forEach(clan_results, (clan) => {
    const pwin = clan.wins * 100 / (clan.wins + clan.losts);

    results.push(`
      <tr style="background-color: #89CFF0;">
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

app.get('/', async function(req, res) {
groutDesc = (await got(`https://api.worldoftanks.eu/wot/globalmap/claninfo/?application_id=${KEY_API}&clan_id=${CLAN_ID}`).json()).data[CLAN_ID];

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
