import {
    CreateSlaPolicyBody,
    CreateSlaPolicyBodyMetricsItemName,
} from '@gorgias/api-types'

import {SLAFormValues} from './useFormValues'

export default function makeCreateSLAPolicyBody(
    formPolicy: SLAFormValues
): CreateSlaPolicyBody {
    return {
        ...formPolicy,
        metrics: [
            ...(formPolicy.metrics.FRT?.threshold
                ? [
                      {
                          name: CreateSlaPolicyBodyMetricsItemName.Frt,
                          threshold: formPolicy.metrics.FRT.threshold,
                          unit: formPolicy.metrics.FRT.unit,
                      },
                  ]
                : []),
            ...(formPolicy.metrics.RT?.threshold
                ? [
                      {
                          name: CreateSlaPolicyBodyMetricsItemName.Rt,
                          threshold: formPolicy.metrics.RT.threshold,
                          unit: formPolicy.metrics.RT.unit,
                      },
                  ]
                : []),
        ],
    }
}
