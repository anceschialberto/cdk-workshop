import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Lambda } from '@aws-sdk/client-lambda';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamo = new DynamoDB({});
const lambda = new Lambda({});

export const handler: APIGatewayProxyHandler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // update dynamo entry for "path" with hits++
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  });

  // call downstream function and capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: Buffer.from(JSON.stringify(event)), 
  });

  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(Buffer.from(resp.Payload!).toString());
};
