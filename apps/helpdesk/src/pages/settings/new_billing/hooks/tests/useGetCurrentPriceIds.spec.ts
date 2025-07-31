import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'

import { useCurrentPriceIds } from '../useGetCurrentPriceIds'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useGetCurrentPriceIds', () => {
    const currentProducts = {
        [ProductType.Helpdesk]: { price_id: 'helpdeskPriceId' },
        [ProductType.Automation]: { price_id: 'automatePriceId' },
        [ProductType.Convert]: { price_id: 'convertPriceId' },
        [ProductType.Voice]: { price_id: 'voicePriceId' },
        [ProductType.SMS]: { price_id: 'smsPriceId' },
    }

    it('should return the current price ids', () => {
        mockUseAppSelector.mockReturnValueOnce(currentProducts)

        const { result } = renderHook(() => useCurrentPriceIds())

        expect(result.current).toEqual([
            'helpdeskPriceId',
            'automatePriceId',
            'convertPriceId',
            'voicePriceId',
            'smsPriceId',
        ])
    })

    it('should return the current price ids without automation', () => {
        mockUseAppSelector.mockReturnValueOnce({
            ...currentProducts,
            automation: undefined,
        })

        const { result } = renderHook(() => useCurrentPriceIds())

        expect(result.current).toEqual([
            'helpdeskPriceId',
            'convertPriceId',
            'voicePriceId',
            'smsPriceId',
        ])
    })

    it('should return the empty price id list', () => {
        mockUseAppSelector.mockReturnValueOnce(null)

        const { result } = renderHook(() => useCurrentPriceIds())

        expect(result.current).toEqual([])
    })
})
