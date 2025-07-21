import { SLAPolicy } from '@gorgias/helpdesk-queries'
import { SLAPolicyMetric } from '@gorgias/helpdesk-types'

export type MappedFormSLAPolicy = ReturnType<typeof makeMappedFormSLAPolicy>

export default function makeMappedFormSLAPolicy(policy: SLAPolicy) {
    const { uuid, name, target_channels, business_hours_only } = policy

    return {
        uuid,
        name,
        target_channels,
        business_hours_only,
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
