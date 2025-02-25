import _isNumber from 'lodash/isNumber'

import { CreateSlaPolicyBody, SLAPolicyMetric } from '@gorgias/api-types'

import { SLAFormValues } from './useFormValues'

export default function makeCreateSLAPolicyBody(
    formPolicy: SLAFormValues,
): CreateSlaPolicyBody {
    return {
        ...formPolicy,
        metrics: formPolicy.metrics.reduce((acc, metric) => {
            if (_isNumber(metric.threshold)) {
                return [...acc, metric as SLAPolicyMetric]
            }
            return acc
        }, [] as SLAPolicyMetric[]),
    }
}
