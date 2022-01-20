import { Fn } from 'aws-cdk-lib';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

import { NetworkingStack } from './networking-stack';
import { HitCounter } from './hitcounter';
import { Monitoring } from './monitoring';

export class CdkWorkshopStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = new NetworkingStack(this);

    const hello = new aws_lambda_nodejs.NodejsFunction(this, 'HelloHandler', {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      entry: "lambda/hello.ts",
      handler: "handler",
      bundling: {
        sourceMap: true,
      },
      vpc: network.vpc,
      vpcSubnets: network.privateSubnets
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello,
      vpc: network.vpc,
      vpcSubnets: network.privateSubnets,
    });

    const api = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler,
      endpointConfiguration: {
        types: [apigw.EndpointType.PRIVATE],
        vpcEndpoints: [network.apiInterfaceVpcEndpoint]
      },
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            principals: [new iam.StarPrincipal],
            actions: ["execute-api:Invoke"],
            resources: [Fn.join('', ['execute-api:/', '*'])],
            conditions: {
              StringEquals: {
                "aws:SourceVpc": [
                  network.vpc.vpcId,
                ],
                "aws:SourceVpce": [
                  network.apiInterfaceVpcEndpoint.vpcEndpointId,
                ],
              },
            },
          })
        ]
      })
    })

    new Monitoring(this, 'HelloMonitoring', {
      api
    })
  }
}