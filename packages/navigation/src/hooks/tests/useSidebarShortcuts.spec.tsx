import type { ReactNode } from 'react'

import { useShortcuts } from '@repo/utils'
import { renderHook } from '@testing-library/react'

import { MockSidebarProvider } from '../../fixtures/MockSidebarProvider'
import { useSidebarShortcuts } from '../useSidebarShortcuts'

vi.mock('@repo/utils', () => ({
    useShortcuts: vi.fn(),
}))

describe('useSidebarShortcuts', () => {
    it('registers TOGGLE_NAVBAR action with the App component', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <MockSidebarProvider>{children}</MockSidebarProvider>
        )

        renderHook(() => useSidebarShortcuts(), { wrapper })

        expect(useShortcuts).toHaveBeenCalledWith('App', {
            TOGGLE_NAVBAR: { action: expect.any(Function) },
        })
    })

    it('TOGGLE_NAVBAR action calls onSidebarShortcutToggle', () => {
        const onSidebarShortcutToggle = vi.fn()
        const wrapper = ({ children }: { children: ReactNode }) => (
            <MockSidebarProvider
                onSidebarShortcutToggle={onSidebarShortcutToggle}
            >
                {children}
            </MockSidebarProvider>
        )

        renderHook(() => useSidebarShortcuts(), { wrapper })

        const capturedActions = vi.mocked(useShortcuts).mock.calls[0][1]
        ;(capturedActions.TOGGLE_NAVBAR.action as () => void)()

        expect(onSidebarShortcutToggle).toHaveBeenCalledTimes(1)
    })
})
