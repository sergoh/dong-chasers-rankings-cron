'use strict';
const AWS = require('aws-sdk');
const attr = require('dynamodb-data-types').AttributeValue;
const axios = require('axios');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


module.exports.run = (event, context, callback) => {
  const today = new Date().toLocaleDateString("en-US");
  const mlbRankingsURL = 'http://mlb.mlb.com/pubajax/wf/flow/stats.splayer?season=2018&sort_order=%27desc%27&sort_column=%27hr%27&stat_type=hitting&page_type=SortablePlayer&game_type=%27R%27&player_pool=QUALIFIER&season_type=ANY&sport_code=%27mlb%27&results=1000&recSP=1&recPP=100'
  axios.get(mlbRankingsURL)
      .then(response => {
        const item = {
          date: today,
          rankings: response.data.stats_sortable_player.queryResults.row
        }
        const params = {
          Item: attr.wrap(item),
          TableName: "dong-chasers-rankings-cron-dev"
        };

        dynamodb.putItem(params, function(err, data) {
          if (err){
            console.log(err);
            callback(err);
          } else {
            console.log(data);
            callback(null, data);
          }
        })
      })
      .catch(error => {
        console.log(error);
      });
};
