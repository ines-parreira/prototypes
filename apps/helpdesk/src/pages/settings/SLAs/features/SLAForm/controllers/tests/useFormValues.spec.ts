import { renderHook } from '@repo/testing'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { slaPolicy3 } from 'pages/settings/SLAs/fixtures/fixtures'

import makeMappedFormSLAPolicy from '../makeMappedFormSLAPolicy'
import useFormValues from '../useFormValues'

describe('useFormValues', () => {
    it('should map provided policy to form values correctly', () => {
        const policy = makeMappedFormSLAPolicy(slaPolicy3)
        const { result } = renderHook(() => useFormValues(policy))

        expect(result.current).toEqual({
            name: 'policy',
            metrics: [
                {
                    name: SLAPolicyMetricType.Frt,
                    unit: SLAPolicyMetricUnit.Minute,
                    threshold: 30,
                },
                {
                    name: SLAPolicyMetricType.Rt,
                    unit: SLAPolicyMetricUnit.Minute,
                    threshold: 120,
                },
            ],
            active: true,
            target_channels: ['email', 'chat'],
            business_hours_only: policy.business_hours_only,
        })
    })
})
