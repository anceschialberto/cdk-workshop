import { Construct } from 'constructs';
import { aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { GraphWidget } from 'aws-cdk-lib/aws-cloudwatch';

export interface MonitoringProps {
  apiId: string;
}

export class Monitoring extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    const { apiId } = props;

    /*
     * Custom metrics
     */
    const apiGateway4xxErrorPercentage = new cloudwatch.MathExpression({
      expression: 'm1/m2*100',
      label: '% API Gateway 4xx Errors',
      usingMetrics: {
        m1: new cloudwatch.Metric({
          metricName: '4XXError',
          namespace: 'AWS/ApiGateway',
          dimensionsMap: {
            ApiId: apiId
          },
          unit: cloudwatch.Unit.COUNT,
          label: '4XX Errors',
          statistic: 'sum',
          period: Duration.seconds(900)
        }),
        m2: new cloudwatch.Metric({
          metricName: 'Count',
          namespace: 'AWS/ApiGateway',
          dimensionsMap: {
            ApiId: apiId
          },
          unit: cloudwatch.Unit.COUNT,
          label: '# Requests',
          statistic: 'sum',
          period: Duration.seconds(900)
        }),
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
          new cloudwatch.Metric({
            metricName: 'Count',
            namespace: 'AWS/ApiGateway',
            dimensionsMap: {
              ApiId: apiId
            },
            unit: cloudwatch.Unit.COUNT,
            label: '# Requests',
            statistic: 'sum',
            period: Duration.seconds(900)
          })
        ],
        stacked: false,
        width: 8
      }),
      new GraphWidget({
        title: 'API GW Errors',
        left: [
          new cloudwatch.Metric({
            metricName: '4XXError',
            namespace: 'AWS/ApiGateway',
            dimensionsMap: {
              ApiId: apiId
            },
            unit: cloudwatch.Unit.COUNT,
            label: '4XX Errors',
            statistic: 'sum',
            period: Duration.seconds(900)
          }),
          new cloudwatch.Metric({
            metricName: '5XXError',
            namespace: 'AWS/ApiGateway',
            dimensionsMap: {
              ApiId: apiId
            },
            unit: cloudwatch.Unit.COUNT,
            label: '5XX Errors',
            statistic: 'sum',
            period: Duration.seconds(900)
          })
        ],
        stacked: false,
        width: 8
      })
    );
  }
}