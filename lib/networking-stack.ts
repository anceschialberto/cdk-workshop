import { Construct } from 'constructs';
import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

export class NetworkingStack extends NestedStack {
  public readonly vpc: ec2.Vpc;
  public readonly privateSubnets: ec2.SelectedSubnets;
  public readonly apiInterfaceVpcEndpoint: ec2.InterfaceVpcEndpoint;

  constructor(scope: Construct, props?: NestedStackProps) {
    super(scope, 'NetworkingNestedStack', props);

    this.vpc = new ec2.Vpc(this, 'VPC');

    this.vpc.addGatewayEndpoint('DynamoDBGatewayVpcEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
    })

    // Iterate the private subnets
    this.privateSubnets = this.vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
    });

    this.apiInterfaceVpcEndpoint = new ec2.InterfaceVpcEndpoint(this, 'ApiGatewayInterfaceVpcEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.APIGATEWAY,
      subnets: this.privateSubnets,
      privateDnsEnabled: true,
    });
  }
}