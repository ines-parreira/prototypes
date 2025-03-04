import { useMemo } from 'react'

import { SLAPolicyMetricType, SLAPolicyMetricUnit } from '@gorgias/api-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { MappedFormSLAPolicy } from './makeMappedFormSLAPolicy'

export type SLAFormValues = ReturnType<typeof useFormValues>

export default function useFormValues(
    policy?: Omit<MappedFormSLAPolicy, 'uuid'>,
) {
    const isTrackTotalHitsEnabled = useFlag(FeatureFlagKey.PauseSLA)

    return useMemo(
        () =>
            policy
                ? {
                      name: policy.name,
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
                      target_channels: policy.target_channels,
                      business_hours_only: isTrackTotalHitsEnabled
                          ? policy.business_hours_only
                          : false,
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
                      business_hours_only: isTrackTotalHitsEnabled
                          ? true
                          : false,
                  },
        [policy, isTrackTotalHitsEnabled],
    )
}
