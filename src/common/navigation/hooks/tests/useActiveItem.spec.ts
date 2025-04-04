import { renderHook } from '@testing-library/react-hooks'
import type { Location } from 'history'
import { useLocation } from 'react-router-dom'

import { assumeMock } from 'utils/testing'

import useActiveItem from '../useActiveItem'

jest.mock('react-router-dom', () => ({ useLocation: jest.fn() }))
const useLocationMock = assumeMock(useLocation)

describe('useActiveItem', () => {
    it.each([
        ['/app', 'tickets'],
        ['/app/automation', 'automate'],
        ['/app/convert', 'convert'],
        ['/app/customers', 'customers'],
        ['/app/home', 'home'],
        ['/app/settings', 'settings'],
        ['/app/stats', 'statistics'],
        ['/app/ticket', 'tickets'],
        ['/app/tickets', 'tickets'],
        ['/app/views', 'tickets'],
        ['/app/whatever', 'tickets'],
        ['/app/voice-of-customer', 'voice-of-customer'],
    ])('should return the corrent item for %s', (path, item) => {
        useLocationMock.mockReturnValue({ pathname: path } as Location)

        const { result } = renderHook(() => useActiveItem())
        expect(result.current).toBe(item)
    })
})
