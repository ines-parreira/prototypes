import { useMemo } from 'react'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import type { MappedFormSLAPolicy } from './makeMappedFormSLAPolicy'

export type SLAFormValues = ReturnType<typeof useFormValues>

export default function useFormValues(
    policy?: Omit<MappedFormSLAPolicy, 'uuid'>,
) {
    return useMemo(() => {
        if (!policy) {
            return {
                name: '',
                metrics: [
                    {
                        name: SLAPolicyMetricType.Frt,
                        unit: SLAPolicyMetricUnit.Second,
                        threshold: undefined,
                    },
                    {
                        name: SLAPolicyMetricType.Rt,
                        unit: SLAPolicyMetricUnit.Second,
                        threshold: undefined,
                    },
                ],
                active: true,
                target_channels: [],
                target: undefined,
                business_hours_only: true,
            }
        }

        const metrics = !!policy.metrics[SLAPolicyMetricType.WaitTime]
            ? [
                  {
                      name: SLAPolicyMetricType.WaitTime,
                      unit: policy.metrics[SLAPolicyMetricType.WaitTime]?.unit,
                      threshold:
                          policy.metrics[SLAPolicyMetricType.WaitTime]
                              ?.threshold,
                  },
              ]
            : [
                  {
                      name: SLAPolicyMetricType.Frt,
                      unit:
                          policy.metrics.FRT?.unit ||
                          SLAPolicyMetricUnit.Second,
                      threshold: policy.metrics.FRT?.threshold,
                  },
                  {
                      name: SLAPolicyMetricType.Rt,
                      unit:
                          policy.metrics.RT?.unit || SLAPolicyMetricUnit.Second,
                      threshold: policy.metrics.RT?.threshold,
                  },
              ]

        return {
            name: policy.name,
            metrics,
            active: policy.active,
            target_channels: policy.target_channels,
            target: policy.target,
            business_hours_only: policy.business_hours_only,
        }
    }, [policy])
}
