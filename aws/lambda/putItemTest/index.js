"use strict";
const AWS = require("aws-sdk");
const regionString = "us-east-2";

AWS.config.update({ region: regionString });

// Handler is the function being exported
exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: regionString });
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: regionString
  });

  let responseBody = "";
  let statusCode = 0;

  const { id, firstName, lastName } = JSON.parse(event.body);

  // The item we want to pull out of the table
  const params = {
    TableName: "adamTestDBTable",
    Item: {
      id: id,
      firstName: firstName,
      lastName: lastName
    }
  };
  try {
    const data = await documentClient.put(params).promise();
    statusCode = 201;
    responseBody = JSON.stringify(data);
  } catch (err) {
    responseBody = "Could not put user data";
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    headers: {
      myHeader: "Put Test"
    },
    body: responseBody
  };
  return response;
};
