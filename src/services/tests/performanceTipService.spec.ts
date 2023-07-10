import {formatDuration} from 'pages/stats/common/utils'
import {
    MetricsBaselinesJSON,
    gradeLabels,
    hintTemplates,
    renderHint,
    Tip,
    tipNotAvailable,
    getPerformanceTip,
    TipQualifier,
    tips,
} from 'services/performanceTipService'
import {MetricName, MetricNameToLabelMap} from 'services/reporting/constants'
import {PlanName} from 'utils/paywalls'

describe('PerformanceTipService', () => {
    const lowerIsBetterMetric = MetricName.MessagesPerTicket
    const higherIsBetterMetric = MetricName.CustomerSatisfaction
    const plan = PlanName.Advanced
    const metricValue = 5
    const MetricBaselineP10Index = 0
    const MetricBaselineP40Index = 1
    const MetricBaselineP60Index = 2
    const MetricBaselineP90Index = 3

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
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP10Index
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Error,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP40Index
                ]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP40Index
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.LightError,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP40Index
                ]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP60Index
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Neutral,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP60Index
                ]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP90Index
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP90Index
                ] - 0.1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Success,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
    ]
    const higherIsBetter = [
        {
            metric: higherIsBetterMetric,
            value:
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP10Index
                ] - 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Error,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP40Index
                ]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value:
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP40Index
                ] - 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.LightError,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP40Index
                ]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value:
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP60Index
                ] - 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Neutral,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP60Index
                ]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value:
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP90Index
                ] - 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value:
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP90Index
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Success,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
    ]
    const otherMetrics = [
        {
            metric: MetricName.FirstResponseTime,
            value:
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP90Index
                ] - 1,
            expectedTip: buildPerformanceTip(
                MetricName.FirstResponseTime,
                TipQualifier.Success,
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: MetricName.FirstResponseTime,
            value: 1000,
            expectedTip: buildPerformanceTip(
                MetricName.FirstResponseTime,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: MetricName.ResolutionTime,
            value:
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineP40Index
                ] + 1,
            expectedTip: buildPerformanceTip(
                MetricName.ResolutionTime,
                TipQualifier.LightError,
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineP40Index
                ]
            ),
        },
    ]

    test.each([...lowerIsBetter, ...higherIsBetter, ...otherMetrics])(
        'should return $expectedTip.type for metric($metric) of value($value)',
        ({metric, value, expectedTip}) => {
            expect(getPerformanceTip(metric, value, plan)).toEqual(expectedTip)
        }
    )

    test.each([
        {
            metric: MetricName.ResolutionTime,
            averageValue:
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineP40Index
                ],
        },
        {
            metric: MetricName.FirstResponseTime,
            averageValue:
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP40Index
                ],
        },
    ])(
        'should render time related metrics ($metric) in human readable form',
        ({metric, averageValue}) => {
            const tip = getPerformanceTip(metric, averageValue, plan)

            expect(tip.hint).toMatch(
                new RegExp(formatDuration(averageValue, 2))
            )
        }
    )

    it('should render metric name using a label', () => {
        const metric = MetricName.ResolutionTime
        const tip = getPerformanceTip(
            metric,
            MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                MetricBaselineP60Index + 1
            ],
            plan
        )
        expect(tip.hint).toMatch(new RegExp(MetricNameToLabelMap[metric]))
    })
})
