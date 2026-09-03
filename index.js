import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "mentor-name";

const findUserByName = async (userName) => {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        name: userName,
      },
    }),
  );

  return result.Item;
};

export const handler = async (event) => {
  const method = event.requestContext.http.method;

  try {
    switch (method) {
      case "GET": {
        if (event.pathParameters?.userName) {
          const result = await findUserByName(event.pathParameters.userName);

          if (!result) {
            return {
              statusCode: 404,
              body: JSON.stringify({
                message: "User not found",
              }),
            };
          }

          return {
            statusCode: 200,
            body: JSON.stringify(result),
          };
        }

        const result = await dynamodb.send(
          new ScanCommand({
            TableName: TABLE_NAME,
          }),
        );

        return {
          statusCode: 200,
          body: JSON.stringify(result.Items),
        };
      }

      case "POST": {
        const body = JSON.parse(event.body);

        if (!body.name || !body.email) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Name and Email are required",
            }),
          };
        }

        const item = {
          name: body.name,
          followers: body.followers ?? 0,
          email: body.email,
        };

        await dynamodb.send(
          new PutCommand({
            TableName: TABLE_NAME,
            ConditionExpression: "attribute_not_exists(#name)",
            ExpressionAttributeNames: {
              "#name": "name",
            },
            Item: item,
          }),
        );

        return {
          statusCode: 201,
          body: JSON.stringify(item),
        };
      }

      case "PUT": {
        if (!event.pathParameters?.userName) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "User name is required",
            }),
          };
        }

        const userName = event.pathParameters.userName;

        const result = await findUserByName(userName);

        if (!result) {
          return {
            statusCode: 404,
            body: JSON.stringify({
              message: "User not found",
            }),
          };
        }

        const body = JSON.parse(event.body);

        const response = await dynamodb.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
              name: userName,
            },
            UpdateExpression: "SET followers = :followers, email = :email",
            ExpressionAttributeValues: {
              ":followers": body.followers,
              ":email": body.email,
            },
            ReturnValues: "ALL_NEW",
          }),
        );

        return {
          statusCode: 200,
          body: JSON.stringify(response.Attributes),
        };
      }

      case "DELETE": {
        if (!event.pathParameters?.userName) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "User name is required",
            }),
          };
        }

        const userName = event.pathParameters.userName;

        const result = await findUserByName(userName);

        if (!result) {
          return {
            statusCode: 404,
            body: JSON.stringify({
              message: "User not found",
            }),
          };
        }

        await dynamodb.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              name: userName,
            },
          }),
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "User deleted successfully",
          }),
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({
            message: `Method ${method} is not allowed`,
          }),
        };
    }
  } catch (error) {
    console.error("Request processing failed:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "A record with this name already exists",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
