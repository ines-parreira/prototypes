import {
    MetricsBaselinesJSON,
    gradeLabels,
    hintTemplates,
    MetricName,
    renderHint,
    Tip,
    tipNotAvailable,
    getPerformanceTip,
    TipQualifier,
    tips,
} from 'services/performanceTipService'
import {PlanName} from 'utils/paywalls'

describe('PerformanceTipService', () => {
    const lowerIsBetterMetric = MetricName.MessagesPerTicket
    const higherIsBetterMetric = MetricName.CustomerSatisfaction
    const plan = PlanName.Advanced
    const metricValue = 5

    it('should return N/A tips when missing the plan name', () => {
        expect(
            getPerformanceTip(lowerIsBetterMetric, metricValue, null)
        ).toEqual(tipNotAvailable)
    })

    it('should return N/A tips when missing the value', () => {
        expect(getPerformanceTip(lowerIsBetterMetric, null, plan)).toEqual(
            tipNotAvailable
        )
    })

    const buildPerformanceTip = (
        metric = lowerIsBetterMetric,
        qualifier = TipQualifier.Neutral,
        targetValue = 0
    ): Tip => ({
        type: qualifier,
        title: gradeLabels[qualifier],
        content: tips[metric][qualifier],
        hint: renderHint(hintTemplates[qualifier], metric, targetValue),
    })
    const lowerIsBetter = [
        {
            metric: lowerIsBetterMetric,
            value: 6,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Error,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][0]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value: 5,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.LightError,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][1]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value: 4,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Neutral,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][2]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value: 3.5,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][3]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value: 3,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Success,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][3]
            ),
        },
    ]
    const higherIsBetter = [
        {
            metric: higherIsBetterMetric,
            value: 4,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Error,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][0]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value: 4.25,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.LightError,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][1]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value: 4.6,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Neutral,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][2]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value: 4.8,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][3]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value: 5,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Success,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][3]
            ),
        },
    ]
    const otherMetrics = [
        {
            metric: MetricName.FirstResponseTime,
            value: 1000,
            expectedTip: buildPerformanceTip(
                MetricName.FirstResponseTime,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][3]
            ),
        },
        {
            metric: MetricName.ResolutionTime,
            value: 70000,
            expectedTip: buildPerformanceTip(
                MetricName.ResolutionTime,
                TipQualifier.LightError,
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][1]
            ),
        },
    ]

    test.each([...lowerIsBetter, ...higherIsBetter, ...otherMetrics])(
        'should return $expectedTip.type for metric($metric) of value($value)',
        ({metric, value, expectedTip}) => {
            expect(getPerformanceTip(metric, value, plan)).toEqual(expectedTip)
        }
    )
})
