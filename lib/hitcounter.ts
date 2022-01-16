import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // TODO
  }
}