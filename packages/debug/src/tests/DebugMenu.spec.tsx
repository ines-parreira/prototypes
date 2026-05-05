import { useFlag } from '@repo/feature-flags'
import { SidebarProvider } from '@repo/navigation'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DebugMenu } from '../DebugMenu'
import { DebugMenuItem } from '../DebugMenuItem'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { DebugMenu: 'show-debug-menu' },
    useFlag: vi.fn().mockReturnValue(false),
}))

const mockUseFlag = vi.mocked(useFlag)

describe('DebugMenu', () => {
    afterEach(() => {
        mockUseFlag.mockReturnValue(false)
        window.USER_IMPERSONATED = null
    })

    it('does not render when the flag is off and the session is not impersonated', () => {
        render(
            <DebugMenu>
                <DebugMenuItem id="test" icon="circle-help" label="Test">
                    <div>panel</div>
                </DebugMenuItem>
            </DebugMenu>,
        )

        expect(
            screen.queryByRole('button', { name: /system-window-terminal/i }),
        ).not.toBeInTheDocument()
    })

    it('renders when the flag is off but the session is impersonated', () => {
        window.USER_IMPERSONATED = true

        render(
            <DebugMenu>
                <DebugMenuItem id="test" icon="circle-help" label="Test">
                    <div>panel</div>
                </DebugMenuItem>
            </DebugMenu>,
            { wrapper: SidebarProvider },
        )

        expect(
            screen.getByRole('button', { name: /system-window-terminal/i }),
        ).toBeInTheDocument()
    })

    it('does not render when there are no children', () => {
        mockUseFlag.mockReturnValue(true)

        render(<DebugMenu>{null}</DebugMenu>)

        expect(
            screen.queryByRole('button', { name: /system-window-terminal/i }),
        ).not.toBeInTheDocument()
    })
})
