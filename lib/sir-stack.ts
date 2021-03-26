import * as cdk from '@aws-cdk/core';
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
// import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from '@aws-cdk/aws-iam';
import * as appsync from '@aws-cdk/aws-appsync';

export class SirStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
    });

    const todosTable = new ddb.Table(this, "weather", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const todosLambda = new lambda.Function(this, "TodoApiHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("lambda"),
      memorySize: 1024,
      environment: {
        TODOS_TABLE: todosTable.tableName,

      },
      // layers : [lambdaLayerGenerateId,lambdaLayerVerifyTenant]
    });

    todosLambda.addToRolePolicy(new iam.PolicyStatement({
      resources: ["*"],
      actions: ["dynamodb:*"]}))

todosTable.grantFullAccess(todosLambda)

const lambdaDs = api.addLambdaDataSource('lambdaDatasource', todosLambda);

lambdaDs.createResolver({
  typeName: "Query",
  fieldName: "getCurrent"
});

lambdaDs.createResolver({
  typeName: "Query",
  fieldName: "getData"
});

new cdk.CfnOutput(this, "GraphQLAPIURL", {
  value: api.graphqlUrl
});
  }
}
