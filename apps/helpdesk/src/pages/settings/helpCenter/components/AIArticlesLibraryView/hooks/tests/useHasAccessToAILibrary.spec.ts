import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { StoreState } from 'state/types'

import { useHasAccessToAILibrary } from '../useHasAccessToAILibrary'

jest.mock('hooks/useAppSelector')

const mockedUseAppSelector = assumeMock(useAppSelector)

describe('useHasAccessToAILibrary', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [
                        { id: 1, type: IntegrationType.Shopify },
                        { id: 2, type: IntegrationType.BigCommerce },
                    ],
                }),
            } as unknown as StoreState),
        )
    })

    it('should return true if multi store', () => {
        const { result } = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(true)
    })

    it('should return true if single store', () => {
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [{ id: 1, type: IntegrationType.Shopify }],
                }),
            } as unknown as StoreState),
        )

        const { result } = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(true)
    })

    it('should return false if no supported integrations', () => {
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [],
                }),
            } as unknown as StoreState),
        )

        const { result } = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(false)
    })
})
