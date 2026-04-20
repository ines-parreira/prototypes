import { isString } from 'lodash'
import _isNumber from 'lodash/isNumber'

import type { CreateSLAPolicy, SLAPolicyMetric } from '@gorgias/helpdesk-types'

import { mapConditionsToFilters } from './mapConditionFilters'
import type { SLAFormValues } from './useFormValues'

export default function makeCreateSLAPolicyBody(
    formPolicy: SLAFormValues,
): CreateSLAPolicy {
    const { conditions, ...rest } = formPolicy
    const filters = mapConditionsToFilters(conditions)
    return {
        ...rest,
        target_channels: rest?.target_channels?.filter(isString) ?? [],
        metrics: rest?.metrics?.reduce((acc, metric) => {
            if (_isNumber(metric.threshold)) {
                return [...acc, metric as SLAPolicyMetric]
            }
            return acc
        }, [] as SLAPolicyMetric[]),
        ...(filters.length > 0 && { filters }),
    }
}
