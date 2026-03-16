import type { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { NavigationProvider } from '../../components/NavigationProvider'
import { TicketInfobarTab } from '../../constants'
import { useNavigation } from '../useNavigation'

const wrapper = ({ children }: { children: ReactNode }) => (
    <NavigationProvider>{children}</NavigationProvider>
)

describe('useNavigation', () => {
    it('should throw an error if not wrapped in a provider', () => {
        const originalError = console.error
        console.error = vi.fn()

        expect(() => {
            renderHook(() => useNavigation())
        }).toThrow(
            '`useNavigation` may only be used within a `NavigationProvider`.',
        )

        console.error = originalError
    })

    it('should return the context when wrapped in a provider', () => {
        const { result } = renderHook(() => useNavigation(), { wrapper })
        expect(result.current).toEqual([
            {
                ticketInfobar: {
                    activeTab: TicketInfobarTab.Customer,
                    isExpanded: true,
                    editingWidgetType: null,
                },
            },
            expect.any(Function),
        ])
    })
})
