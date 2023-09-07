import {formatDuration} from 'pages/stats/common/utils'
import {
    MetricsBaselinesJSON,
    formatMetricValue,
    Tip,
    getPerformanceTip,
    TipQualifier,
    tips,
    randomIndexGrade,
} from 'services/supportPerformanceTipService'
import {MetricName} from 'services/reporting/constants'
import {PlanName} from 'utils/paywalls'

describe('SupportPerformanceTipService', () => {
    const lowerIsBetterMetric = MetricName.MessagesPerTicket
    const higherIsBetterMetric = MetricName.CustomerSatisfaction
    const plan = PlanName.Advanced
    const metricValue = 5
    const MetricBaselineAvgIndex = 0
    const MetricBaselineP90Index = 1

    it('should return N/A tips when missing the plan name', () => {
        expect(
            getPerformanceTip(lowerIsBetterMetric, metricValue, null)
        ).toEqual(null)
    })

    it('should return N/A tips when missing the value', () => {
        expect(getPerformanceTip(lowerIsBetterMetric, null, plan)).toEqual(null)
    })

    const buildPerformanceTip = (
        metric = lowerIsBetterMetric,
        qualifier: TipQualifier,
        average: number,
        topTen: number
    ): Tip => ({
        type: qualifier,
        content: randomIndexGrade(tips[metric][qualifier]),
        average: formatMetricValue(metric, average),
        topTen: formatMetricValue(metric, topTen),
    })

    const lowerIsBetter = [
        {
            metric: lowerIsBetterMetric,
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.LightError,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: lowerIsBetterMetric,
            value:
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ] - 1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ],
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
                ] - 1,
            expectedTip: buildPerformanceTip(
                lowerIsBetterMetric,
                TipQualifier.Success,
                MetricsBaselinesJSON[lowerIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ],
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
                    MetricBaselineAvgIndex
                ] - 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.LightError,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: higherIsBetterMetric,
            value:
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ] + 0.1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ],
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
                ] + 1,
            expectedTip: buildPerformanceTip(
                higherIsBetterMetric,
                TipQualifier.Success,
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[higherIsBetterMetric][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
    ]
    const otherMetrics = [
        {
            metric: MetricName.FirstResponseTime,
            value: 1000,
            expectedTip: buildPerformanceTip(
                MetricName.FirstResponseTime,
                TipQualifier.Success,
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP90Index
                ]
            ),
        },

        {
            metric: MetricName.FirstResponseTime,
            value:
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineAvgIndex + 1
                ] + 1,
            expectedTip: buildPerformanceTip(
                MetricName.FirstResponseTime,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
        {
            metric: MetricName.ResolutionTime,
            value:
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineAvgIndex
                ] + 1,
            expectedTip: buildPerformanceTip(
                MetricName.ResolutionTime,
                TipQualifier.LightError,
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineP90Index
                ]
            ),
        },
    ]

    test.each([...lowerIsBetter, ...higherIsBetter, ...otherMetrics])(
        'should return $expectedTip.type for metric($metric) of value($value)',
        ({metric, value, expectedTip}) => {
            const tip = getPerformanceTip(metric, value, plan)
            expect(tip).not.toBeNull()
            if (tip !== null) {
                expect(tip.type).toEqual(expectedTip.type)
                expect(tip.topTen).toEqual(expectedTip.topTen)
                expect(tip.average).toEqual(expectedTip.average)

                expect(expectedTip.type).not.toBeNull()
                if (expectedTip.type !== null) {
                    expect(tips[metric][expectedTip.type]).toContainEqual(
                        tip.content
                    )
                }
            }
        }
    )

    test.each([
        {
            metric: MetricName.ResolutionTime,
            topTenValue:
                MetricsBaselinesJSON[MetricName.ResolutionTime][plan][
                    MetricBaselineP90Index
                ],
        },
        {
            metric: MetricName.FirstResponseTime,
            topTenValue:
                MetricsBaselinesJSON[MetricName.FirstResponseTime][plan][
                    MetricBaselineP90Index
                ],
        },
    ])(
        'should render time related metrics ($metric) in human readable form',
        ({metric, topTenValue}) => {
            const tip = getPerformanceTip(metric, topTenValue, plan)

            expect(tip).not.toBeNull()
            if (tip !== null) {
                expect(tip.topTen).toMatch(
                    new RegExp(formatDuration(topTenValue, 2))
                )
            }
        }
    )
})
