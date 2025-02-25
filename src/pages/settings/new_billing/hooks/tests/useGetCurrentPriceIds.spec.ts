import { renderHook } from '@testing-library/react-hooks'

import useAppSelector from 'hooks/useAppSelector'

import { useCurrentPriceIds } from '../useGetCurrentPriceIds'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useGetCurrentPriceIds', () => {
    const currentProducts = {
        helpdesk: { price_id: 'helpdeskPrice' },
        automation: { price_id: 'automationPrice' },
        convert: { price_id: 'convertPlan' },
    }

    it('should return the current price ids', () => {
        mockUseAppSelector.mockReturnValueOnce(currentProducts)

        const { result } = renderHook(() => useCurrentPriceIds())

        expect(result.current).toEqual([
            'helpdeskPrice',
            'automationPrice',
            'convertPlan',
        ])
    })

    it('should return the current price ids without automation', () => {
        mockUseAppSelector.mockReturnValueOnce({
            ...currentProducts,
            automation: undefined,
        })

        const { result } = renderHook(() => useCurrentPriceIds())

        expect(result.current).toEqual(['helpdeskPrice', 'convertPlan'])
    })

    it('should return the empty price id list', () => {
        mockUseAppSelector.mockReturnValueOnce(null)

        const { result } = renderHook(() => useCurrentPriceIds())

        expect(result.current).toEqual([])
    })
})
