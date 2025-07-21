import { renderHook } from 'utils/testing/renderHook'

import useIsTicketNavigationAvailable from '../useIsTicketNavigationAvailable'

jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('state/ticket/selectors', () => ({
    isTicketNavigationAvailable: jest.fn(() => () => true),
}))

describe('useIsTicketNavigationAvailable', () => {
    it('should return a value', () => {
        const { result } = renderHook(() =>
            useIsTicketNavigationAvailable('123'),
        )
        expect(result.current).toBe(true)
    })
})
