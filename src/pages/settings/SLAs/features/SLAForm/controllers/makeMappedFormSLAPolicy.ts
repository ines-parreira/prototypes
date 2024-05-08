import {SLAPolicy} from '@gorgias/api-queries'
import {
    SLAPolicyMetricsItem,
    SLAPolicyMetricsItemName,
} from '@gorgias/api-types'

export type MappedFormSLAPolicy = ReturnType<typeof makeMappedFormSLAPolicy>

export default function makeMappedFormSLAPolicy(policy: SLAPolicy) {
    return {
        uuid: policy.uuid,
        name: policy.name,
        target_channels: policy.target_channels,
        active: policy.deactivated_datetime === null,
        metrics: policy.metrics.reduce(
            (acc, metric) => ({
                ...acc,
                [metric.name]: {
                    threshold: metric.threshold,
                    unit: metric.unit,
                },
            }),
            {} as Partial<
                Record<
                    SLAPolicyMetricsItemName,
                    {
                        threshold: SLAPolicyMetricsItem['threshold']
                        unit: SLAPolicyMetricsItem['unit']
                    }
                >
            >
        ),
    }
}
