import {
    CreateSlaPolicyBody,
    CreateSlaPolicyBodyMetricsItemName,
} from '@gorgias/api-types'
import {MappedFormSLAPolicy} from 'pages/settings/SLAs/features/SLAForm/controllers/makeMappedFormSLAPolicy'

export default function makeCreateSLAPolicyBody(
    formPolicy: MappedFormSLAPolicy
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
