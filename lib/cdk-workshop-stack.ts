import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';

import { HitCounter } from './hitcounter';
import { Monitoring } from './monitoring';

export class CdkWorkshopStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new aws_lambda_nodejs.NodejsFunction(this, 'HelloHandler', {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      entry: "lambda/hello.ts",
      handler: "handler",
      bundling: {
        sourceMap: true,
      }
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    const api = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    })

    new Monitoring(this, 'HelloMonitoring', {
      apiId: api.restApiId
    })
  }
}