import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
  vpc: ec2.Vpc,
  vpcSubnets: ec2.SelectedSubnets
}

export class HitCounter extends Construct {
  public readonly handler: lambda.Function;


  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new aws_lambda_nodejs.NodejsFunction(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'lambda/hitcounter.ts',
      handler: 'handler',
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      },
      bundling: {
        sourceMap: true,
      },
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets
    });

    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
  }
}