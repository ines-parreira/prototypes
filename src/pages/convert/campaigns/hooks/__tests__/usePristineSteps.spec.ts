import { act } from '@testing-library/react-hooks'

import { usePristineSteps } from 'pages/convert/campaigns/hooks/usePristineSteps'
import { CampaignStepsKeys } from 'pages/convert/campaigns/types/CampaignSteps'
import { renderHook } from 'utils/testing/renderHook'

describe('usePristineSteps()', () => {
    it('returns the initial state', () => {
        const { result } = renderHook(() => usePristineSteps())

        expect(result.current.pristine).toEqual({
            basics: true,
            audience: true,
            message: true,
            publish_schedule: true,
        })
    })

    it('updates the state of a step', () => {
        const { result } = renderHook(() => usePristineSteps())

        act(() => {
            result.current.onChangePristine('basics')
        })

        expect(result.current.pristine).toEqual({
            basics: false,
            audience: true,
            message: true,
            publish_schedule: true,
        })
    })

    it('sets the default step as not pristine', () => {
        const { result } = renderHook(() =>
            usePristineSteps(CampaignStepsKeys.Basics),
        )

        expect(result.current.pristine).toEqual({
            basics: false,
            audience: true,
            message: true,
            publish_schedule: true,
        })
    })
})
