import { Template, Capture } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { HitCounter } from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new aws_lambda_nodejs.NodejsFunction(stack, 'TestFunction', {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      entry: "lambda/hello.ts",
      handler: "handler",
    })
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});