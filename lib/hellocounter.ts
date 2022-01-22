import { Construct } from 'constructs';
import { aws_lambda } from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_apigateway } from 'aws-cdk-lib';

interface HelloCounterProps {
  isProd?: boolean;
}

export class HelloCounter extends Construct {
  public readonly api: aws_apigateway.LambdaRestApi;

  constructor(scope: Construct, id: string, props?: HelloCounterProps) {
    super(scope, id);

    const isProd = props?.isProd ?? false;

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    const hello = new aws_lambda_nodejs.NodejsFunction(this, 'HelloHandler', {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      entry: "lambda/hello.ts",
      handler: "handler",
      bundling: {
        sourceMap: !isProd,
      }
    })

    const counter = new aws_lambda_nodejs.NodejsFunction(this, 'HitCounterHandler', {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      entry: 'lambda/hitcounter.ts',
      handler: 'handler',
      environment: {
        HITS_TABLE_NAME: table.tableName,
        DOWNSTREAM_FUNCTION_NAME: hello.functionName
      },
      bundling: {
        sourceMap: !isProd,
      }
    });

    table.grantReadWriteData(counter);

    hello.grantInvoke(counter);

    this.api = new aws_apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: counter
    })
  }
}