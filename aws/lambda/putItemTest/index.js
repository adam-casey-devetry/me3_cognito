"use strict";
const AWS = require("aws-sdk");
const regionString = "us-east-2";

AWS.config.update({ region: regionString });

// Handler is the function being exported
exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: regionString });
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-2"
  });

  // The item we want to pull out of the table
  const params = {
    TableName: "adamTestDBTable",
    Item: {
      id: "4",
      firstName: "Jane",
      lastName: "Doe"
    }
  };
  try {
    const data = await documentClient.put(params).promise();
    console.log(JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
};
