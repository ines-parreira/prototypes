import { SLAPolicy } from '@gorgias/api-queries'
import { SLAPolicyMetric } from '@gorgias/api-types'

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
                    SLAPolicyMetric['name'],
                    {
                        threshold: SLAPolicyMetric['threshold']
                        unit: SLAPolicyMetric['unit']
                    }
                >
            >,
        ),
    }
}
