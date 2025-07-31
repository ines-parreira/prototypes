import { renderHook } from '@repo/testing'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { slaPolicy3 } from 'pages/settings/SLAs/fixtures/fixtures'

import makeMappedFormSLAPolicy from '../makeMappedFormSLAPolicy'
import useFormValues from '../useFormValues'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

describe('useFormValues', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it.each([
        [true, true],
        [false, false],
    ])(
        'should return default values when no policy is provided depending on value of FF',
        (isTrackTotalHitsEnabled, expectedBusinessHoursOnlyValue) => {
            mockUseFlag.mockReturnValue(isTrackTotalHitsEnabled)
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
                business_hours_only: expectedBusinessHoursOnlyValue,
            })
        },
    )

    it.each([
        [true, true],
        [false, false],
    ])(
        'should map provided policy to form values correctly',
        (isTrackTotalHitsEnabled, expectedBusinessHoursOnlyValue) => {
            mockUseFlag.mockReturnValue(isTrackTotalHitsEnabled)

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
                business_hours_only: expectedBusinessHoursOnlyValue,
            })
        },
    )
})
