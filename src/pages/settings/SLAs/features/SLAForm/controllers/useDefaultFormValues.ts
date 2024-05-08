import {useMemo} from 'react'
import {CreateSlaPolicyBodyMetricsItemUnit} from '@gorgias/api-types'

import {MappedFormSLAPolicy} from './makeMappedFormSLAPolicy'

export default function useDefaultFormValues(
    policy: MappedFormSLAPolicy | undefined
) {
    return useMemo(
        () =>
            policy
                ? {
                      name: policy.name,
                      target_channels: policy.target_channels,
                      metrics: {
                          FRT: {
                              unit:
                                  policy.metrics.FRT?.unit ||
                                  CreateSlaPolicyBodyMetricsItemUnit.Second,
                              threshold: policy.metrics.FRT?.threshold,
                          },
                          RT: {
                              unit:
                                  policy.metrics.RT?.unit ||
                                  CreateSlaPolicyBodyMetricsItemUnit.Second,
                              threshold: policy.metrics.RT?.threshold,
                          },
                      },
                      active: policy.active,
                  }
                : {
                      name: '',
                      metrics: {
                          FRT: {
                              unit: CreateSlaPolicyBodyMetricsItemUnit.Second,
                              threshold: undefined,
                          },
                          RT: {
                              unit: CreateSlaPolicyBodyMetricsItemUnit.Second,
                              threshold: undefined,
                          },
                      },
                      active: true,
                      target_channels: [],
                  },
        [policy]
    )
}
