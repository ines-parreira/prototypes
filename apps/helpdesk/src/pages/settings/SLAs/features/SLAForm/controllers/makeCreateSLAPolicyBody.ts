import { isString } from 'lodash'
import _isNumber from 'lodash/isNumber'

import type { CreateSLAPolicy, SLAPolicyMetric } from '@gorgias/helpdesk-types'

import type { SLAFormValues } from './useFormValues'

export default function makeCreateSLAPolicyBody(
    formPolicy: SLAFormValues,
): CreateSLAPolicy {
    return {
        ...formPolicy,
        target_channels: formPolicy?.target_channels?.filter(isString) ?? [],
        metrics: formPolicy?.metrics?.reduce((acc, metric) => {
            if (_isNumber(metric.threshold)) {
                return [...acc, metric as SLAPolicyMetric]
            }
            return acc
        }, [] as SLAPolicyMetric[]),
    }
}
