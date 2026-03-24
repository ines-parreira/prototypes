import { PlanName } from '@repo/billing'

import { formatDuration } from 'domains/reporting/pages/common/utils'
import { MetricName } from 'domains/reporting/services/constants'
import type { Tip } from 'domains/reporting/services/supportPerformanceTipService'
import {
    formatMetricValue,
    getPerformanceTip,
    MetricsBaselinesJSON,
    randomIndexGrade,
    TipQualifier,
    tips,
} from 'domains/reporting/services/supportPerformanceTipService'

describe('SupportPerformanceTipService', () => {
    const lowerIsBetterMetric = MetricName.MessagesPerTicket
    const higherIsBetterMetric = MetricName.CustomerSatisfaction
    const plan = PlanName.Advanced
    const metricValue = 5
    const MetricBaselineAvgIndex = 0
    const MetricBaselineP90Index = 1

    it('should return N/A tips when missing the plan name', () => {
        expect(
            getPerformanceTip(lowerIsBetterMetric, metricValue, null),
        ).toEqual(null)
    })

    it('should return N/A tips when missing the value', () => {
        expect(getPerformanceTip(lowerIsBetterMetric, null, plan)).toEqual(null)
    })

    const buildPerformanceTip = (
        metric = lowerIsBetterMetric,
        qualifier: TipQualifier,
        average: number,
        topTen: number,
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
                ],
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
                ],
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
                ],
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
                ],
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
                ],
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
                ],
            ),
        },
    ]
    const otherMetrics = [
        {
            metric: MetricName.MedianFirstResponseTime,
            value: 1000,
            expectedTip: buildPerformanceTip(
                MetricName.MedianFirstResponseTime,
                TipQualifier.Success,
                MetricsBaselinesJSON[MetricName.MedianFirstResponseTime][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[MetricName.MedianFirstResponseTime][plan][
                    MetricBaselineP90Index
                ],
            ),
        },

        {
            metric: MetricName.MedianFirstResponseTime,
            value:
                MetricsBaselinesJSON[MetricName.MedianFirstResponseTime][plan][
                    MetricBaselineAvgIndex + 1
                ] + 1,
            expectedTip: buildPerformanceTip(
                MetricName.MedianFirstResponseTime,
                TipQualifier.LightSuccess,
                MetricsBaselinesJSON[MetricName.MedianFirstResponseTime][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[MetricName.MedianFirstResponseTime][plan][
                    MetricBaselineP90Index
                ],
            ),
        },
        {
            metric: MetricName.MedianResolutionTime,
            value:
                MetricsBaselinesJSON[MetricName.MedianResolutionTime][plan][
                    MetricBaselineAvgIndex
                ] + 1,
            expectedTip: buildPerformanceTip(
                MetricName.MedianResolutionTime,
                TipQualifier.LightError,
                MetricsBaselinesJSON[MetricName.MedianResolutionTime][plan][
                    MetricBaselineAvgIndex
                ],
                MetricsBaselinesJSON[MetricName.MedianResolutionTime][plan][
                    MetricBaselineP90Index
                ],
            ),
        },
    ]

    test.each([...lowerIsBetter, ...higherIsBetter, ...otherMetrics])(
        'should return $expectedTip.type for metric($metric) of value($value)',
        ({ metric, value, expectedTip }) => {
            const tip = getPerformanceTip(metric, value, plan)
            expect(tip).not.toBeNull()
            if (tip !== null) {
                expect(tip.type).toEqual(expectedTip.type)
                expect(tip.topTen).toEqual(expectedTip.topTen)
                expect(tip.average).toEqual(expectedTip.average)

                expect(expectedTip.type).not.toBeNull()
                if (expectedTip.type !== null) {
                    expect(tips[metric][expectedTip.type]).toContainEqual(
                        tip.content,
                    )
                }
            }
        },
    )

    test.each([
        {
            metric: MetricName.MedianResolutionTime,
            topTenValue:
                MetricsBaselinesJSON[MetricName.MedianResolutionTime][plan][
                    MetricBaselineP90Index
                ],
        },
        {
            metric: MetricName.MedianFirstResponseTime,
            topTenValue:
                MetricsBaselinesJSON[MetricName.MedianFirstResponseTime][plan][
                    MetricBaselineP90Index
                ],
        },
    ])(
        'should render time related metrics ($metric) in human readable form',
        ({ metric, topTenValue }) => {
            const tip = getPerformanceTip(metric, topTenValue, plan)

            expect(tip).not.toBeNull()
            if (tip !== null) {
                expect(tip.topTen).toMatch(
                    new RegExp(formatDuration(topTenValue, 2)),
                )
            }
        },
    )
})
