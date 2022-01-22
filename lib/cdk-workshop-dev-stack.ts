import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { HelloCounter } from './hellocounter';
import { Environment, Config } from './interfaces';
import { Monitoring } from './monitoring';

export class CdkWorkshopDevStack extends Stack implements Config {
  targetEnv = Environment.Dev;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const helloCounter = new HelloCounter(this, 'HelloCounter');

    new Monitoring(this, 'Monitoring', {
      api: helloCounter.api
    })
  }
}