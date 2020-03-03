"use strict";
const AWS = require("aws-sdk");
const regionString = "us-east-2";

AWS.config.update({ region: regionString });

// Handler is the function being exported
exports.handler = function(event, context, callback) {
  const ddb = new AWS.DynamoDB({ apiVersion: regionString });
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-2"
  });

  // The item we want to pull out of the table
  const params = {
    TableName: "adamTestDBTable",
    Key: {
      id: "3"
    }
  };

  documentClient.get(params, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(JSON.stringify(data));
  });
};
