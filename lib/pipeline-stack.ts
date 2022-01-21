import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { pipelines } from 'aws-cdk-lib';

import { CdkWorkshopStage } from "./cdk-workshop-stage";

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
  
      const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
        synth: new pipelines.ShellStep('Synth', {
          // Use a connection created using the AWS console to authenticate to GitHub
          input: pipelines.CodePipelineSource.connection('anceschialberto/cdk-workshop', 'main', {
            connectionArn: 'XXXXXXXXXXXXXXX',
          }),
          commands: [
            'npm ci',
            'npx cdk synth',
          ],
        }),
      });

      pipeline.addStage(new CdkWorkshopStage(this, 'Dev'));
    }
  }