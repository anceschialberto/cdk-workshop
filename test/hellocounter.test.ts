import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
import { HelloCounter } from '../lib/hellocounter';

test('DynamoDB Table Created', () => {
  const stack = new Stack();
  // WHEN
  new HelloCounter(stack, 'HelloCounter');
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});