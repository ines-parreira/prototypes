import { useMemo } from 'react'

import { SLAPolicyMetricType, SLAPolicyMetricUnit } from '@gorgias/api-types'

import { MappedFormSLAPolicy } from './makeMappedFormSLAPolicy'

export type SLAFormValues = ReturnType<typeof useFormValues>

export default function useFormValues(
    policy?: Omit<MappedFormSLAPolicy, 'uuid'>,
) {
    return useMemo(
        () =>
            policy
                ? {
                      name: policy.name,
                      target_channels: policy.target_channels,
                      metrics: [
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
                                  policy.metrics.RT?.unit ||
                                  SLAPolicyMetricUnit.Second,
                              threshold: policy.metrics.RT?.threshold,
                          },
                      ],
                      active: policy.active,
                  }
                : {
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
                  },
        [policy],
    )
}
