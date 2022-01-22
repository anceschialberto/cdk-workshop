#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopDevStack } from '../lib/cdk-workshop-dev-stack';
import { CdkWorkshopProdStack } from '../lib/cdk-workshop-prod-stack';

const devEnvironment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
};

const prodEnvironment = {
  account: process.env.CDK_DEPLOY_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION
};

const app = new cdk.App();

new CdkWorkshopDevStack(app, 'CdkWorkshopDevStack', {
  env: devEnvironment
});

new CdkWorkshopProdStack(app, 'CdkWorkshopProdStack', {
  env: prodEnvironment
});
