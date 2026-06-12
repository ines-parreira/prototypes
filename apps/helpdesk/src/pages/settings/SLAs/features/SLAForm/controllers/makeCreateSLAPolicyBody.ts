import type { CreateSLAPolicy, SLAPolicyMetric } from '@gorgias/helpdesk-types'
import { isNumber, isString } from '@gorgias/toolkit'

import { mapConditionsToFilters } from './mapConditionFilters'
import type { SLAFormValues } from './useFormValues'

export function makeCreateSLAPolicyBody(
    formPolicy: SLAFormValues,
): CreateSLAPolicy {
    const { conditions, ...rest } = formPolicy
    const filters = mapConditionsToFilters(conditions)
    return {
        ...rest,
        target_channels: rest?.target_channels?.filter(isString) ?? [],
        metrics: rest?.metrics?.reduce((acc, metric) => {
            if (isNumber(metric.threshold)) {
                return [...acc, metric as SLAPolicyMetric]
            }
            return acc
        }, [] as SLAPolicyMetric[]),
        ...(filters.length > 0 && { filters }),
    }
}
