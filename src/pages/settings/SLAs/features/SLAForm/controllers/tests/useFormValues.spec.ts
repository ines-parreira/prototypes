import { renderHook } from '@testing-library/react-hooks'

import { SLAPolicyMetricType, SLAPolicyMetricUnit } from '@gorgias/api-types'

import { slaPolicy3 } from 'pages/settings/SLAs/fixtures/fixtures'

import makeMappedFormSLAPolicy from '../makeMappedFormSLAPolicy'
import useFormValues from '../useFormValues'

describe('useFormValues', () => {
    it('should return default values when no policy is provided', () => {
        const { result } = renderHook(() => useFormValues())

        expect(result.current).toEqual({
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
            business_hours_only: true,
        })
    })

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
            business_hours_only: true,
        })
    })
})
