"use strict";
import express from 'express';
import got from 'got';
import _ from 'lodash';
import fs from 'fs/promises';
import clan_results from './clan_results.json' with { type: "json" };

const app = express();

const getData2 = async function() {
  const history = await got('https://eu.wargaming.net/globalmap/game_api/clan/500165786/log?category=all&page_size=30000000').json();
  const validBattles = history.data
                    .filter(function(b) { return b.type !== "LANDING_BET_CANCELLED" && b.type !== "LANDING_BET_CREATED" })

  const clans = _.sortBy(_.uniq(
                  validBattles
                  .map((data) => { return {"tag": data.enemy_clan.tag, "id": data.enemy_clan.id}} )
                ), 'tag');
  


  for (let clan of clans) {
    const detail = await got(`https://eu.wargaming.net/globalmap/game_api/clan/${clan.id}/`).json();
    const wins = validBattles.filter((data) => data.enemy_clan.tag === clan.tag && data.type === 'TOURNAMENT_BATTLE_WON').length;
    const losts = validBattles.filter((data) => data.enemy_clan.tag === clan.tag && data.type === 'TOURNAMENT_BATTLE_LOST').length;
    clan_results[clan.tag] = {
      "wins": wins,
      "losts": losts,
      "detail": detail
    };
  }
  
}
// Testing
// getData2()

app.get('/', function(req, res) {
  return getData2().then(function(rep) {
    fs.writeFile('./clan_results.json', JSON.stringify(clan_results, null, 2))
    .then(() => {
      return res.send("clan_results.json updated");
    });
    
  }).catch(function(err) {
    console.log(err);
    return res.send("Erreur");
  });
});

export default app;
