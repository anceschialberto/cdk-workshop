import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CdkWorkshopStack } from "./cdk-workshop-stack";

export class CdkWorkshopStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
      super(scope, id, props);
  
      new CdkWorkshopStack(this, 'CdkWorkshopStack');
    }
  }