import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DynamoService {
    private docClient: DynamoDBDocumentClient;
    private tableName = process.env.DYNAMODB_TABLE;

    constructor(){
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION,
            ...(process.env.IS_OFFLINE && {
                endpoint: "http://localhost:8000",
            }),
        });
        this.docClient = DynamoDBDocumentClient.from(client);
    }

    async putUser(user: any) {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                PK: `USER#${user.id}`,
                SK: `PROFILE#${user.id}`,
                ...user,
            },
        });
        await this.docClient.send(command);
        return user;
    }

    async getUser(id: string) {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                PK: `USER#${id}`,
                SK: `PROFILE#${id}`,
            },
        });
        const response = await this.docClient.send(command);
        return response.Item;
    }

    async getAllUsers() {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: "begins_with(PK, :pk)",
            ExpressionAttributeValues: {
                ":pk": "USER#",
            },
        });
        const response = await this.docClient.send(command);
        return response.Items ?? [];
    }
}
