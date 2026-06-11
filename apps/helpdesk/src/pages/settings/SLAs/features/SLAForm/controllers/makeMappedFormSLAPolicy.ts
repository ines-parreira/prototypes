import type { SLAPolicy } from '@gorgias/helpdesk-queries'
import type { SLAPolicyFilter, SLAPolicyMetric } from '@gorgias/helpdesk-types'

export type MappedFormSLAPolicy = {
    uuid: string
    name: string
    target_channels: (string | null)[]
    target?: string | number | null
    business_hours_only: boolean
    filters?: SLAPolicyFilter[]
    active: boolean
    metrics: Partial<
        Record<
            SLAPolicyMetric['name'],
            {
                threshold: SLAPolicyMetric['threshold']
                unit: SLAPolicyMetric['unit']
            }
        >
    >
}

export function makeMappedFormSLAPolicy(
    policy: SLAPolicy,
): MappedFormSLAPolicy {
    const {
        uuid,
        name,
        target_channels,
        target,
        business_hours_only,
        filters,
    } = policy

    return {
        uuid,
        name,
        target_channels,
        target,
        business_hours_only,
        filters,
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
