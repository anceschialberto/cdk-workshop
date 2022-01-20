import { Construct } from 'constructs';
import { aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { GraphWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { aws_apigateway as apigw } from 'aws-cdk-lib';

export interface MonitoringProps {
  api: apigw.LambdaRestApi;
}

export class Monitoring extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    const { api } = props;

    /*
     * Custom metrics
     */
    const apiGateway4xxErrorPercentage = new cloudwatch.MathExpression({
      expression: 'm1/m2*100',
      label: '% API Gateway 4xx Errors',
      usingMetrics: {
        m1: this.metricForApiGw(api.restApiName, '4XXError', '4XX Errors', 'sum'),
        m2: this.metricForApiGw(api.restApiName, 'Count', '# Requests', 'sum'),
      },
      period: Duration.minutes(5)
    });

    /*
     * Alarms
     */
    new cloudwatch.Alarm(this, 'API Gateway 4XX Errors > 1%', {
      metric: apiGateway4xxErrorPercentage,
      threshold: 1,
      evaluationPeriods: 6,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    /*
     * Custom Cloudwatch Dashboard 
     */
    new cloudwatch.Dashboard(this, 'CloudWatchDashBoard').addWidgets(
      new GraphWidget({
        title: 'Requests',
        left: [
          this.metricForApiGw(api.restApiName, 'Count', '# Requests', 'sum'),
        ],
        stacked: false,
        width: 8
      }),
      new GraphWidget({
        title: 'API GW Errors',
        left: [
          this.metricForApiGw(api.restApiName, '4XXError', '4XX Errors', 'sum'),
          this.metricForApiGw(api.restApiName, '5XXError', '5XX Errors', 'sum'),
        ],
        stacked: false,
        width: 8
      })
    );
  }

  private metricForApiGw(apiName: string, metricName: string, label: string, stat = 'avg'): cloudwatch.Metric {
    let dimensions = {
      ApiName: apiName,
    };
    return this.buildMetric(metricName, 'AWS/ApiGateway', dimensions, cloudwatch.Unit.COUNT, label, stat);
  }

  private buildMetric(metricName: string, namespace: string, dimensions: cloudwatch.DimensionsMap, unit: cloudwatch.Unit, label: string, stat = 'avg', period = 900): cloudwatch.Metric {
    return new cloudwatch.Metric({
      metricName,
      namespace: namespace,
      dimensionsMap: dimensions,
      unit: unit,
      label: label,
      statistic: stat,
      period: Duration.seconds(period)
    });
  }
}