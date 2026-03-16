import { render } from '@testing-library/react'

import { TicketInfobarTab } from '../../constants'
import { useNavigation } from '../../hooks/useNavigation'
import { NavigationProvider } from '../NavigationProvider'

describe('NavigationProvider', () => {
    it('should provide the context to its children', () => {
        let ctx: ReturnType<typeof useNavigation> | null = null

        const TestComponent = () => {
            ctx = useNavigation()
            return null
        }

        render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>,
        )

        expect(ctx).toEqual([
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
