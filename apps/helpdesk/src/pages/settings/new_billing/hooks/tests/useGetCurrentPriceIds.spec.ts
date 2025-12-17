import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'

import { useCurrentPlanIds } from '../useGetCurrentPriceIds'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useCurrentPlanIds', () => {
    const currentProducts = {
        [ProductType.Helpdesk]: { plan_id: 'helpdeskPlanId' },
        [ProductType.Automation]: { plan_id: 'automatePlanId' },
        [ProductType.Convert]: { plan_id: 'convertPlanId' },
        [ProductType.Voice]: { plan_id: 'voicePlanId' },
        [ProductType.SMS]: { plan_id: 'smsPlanId' },
    }

    it('should return the current plan ids', () => {
        mockUseAppSelector.mockReturnValueOnce(currentProducts)

        const { result } = renderHook(() => useCurrentPlanIds())

        expect(result.current).toEqual([
            'helpdeskPlanId',
            'automatePlanId',
            'convertPlanId',
            'voicePlanId',
            'smsPlanId',
        ])
    })

    it('should return the current plan ids without automation', () => {
        mockUseAppSelector.mockReturnValueOnce({
            ...currentProducts,
            automation: undefined,
        })

        const { result } = renderHook(() => useCurrentPlanIds())

        expect(result.current).toEqual([
            'helpdeskPlanId',
            'convertPlanId',
            'voicePlanId',
            'smsPlanId',
        ])
    })

    it('should return the empty plan ids list', () => {
        mockUseAppSelector.mockReturnValueOnce(null)

        const { result } = renderHook(() => useCurrentPlanIds())

        expect(result.current).toEqual([])
    })
})
