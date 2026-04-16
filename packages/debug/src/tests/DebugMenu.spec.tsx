import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DebugMenu } from '../DebugMenu'
import { DebugMenuItem } from '../DebugMenuItem'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { DebugMenu: 'show-debug-menu' },
    useFlag: vi.fn().mockReturnValue(false),
}))

const mockUseFlag = vi.mocked(useFlag)

describe('DebugMenu', () => {
    it('does not render when the flag is off', () => {
        render(
            <DebugMenu>
                <DebugMenuItem id="test" icon="circle-help" label="Test">
                    <div>panel</div>
                </DebugMenuItem>
            </DebugMenu>,
        )

        expect(
            screen.queryByRole('button', { name: /debug menu/i }),
        ).not.toBeInTheDocument()
    })

    it('does not render when there are no children', () => {
        mockUseFlag.mockReturnValue(true)

        render(<DebugMenu>{null}</DebugMenu>)

        expect(
            screen.queryByRole('button', { name: /debug menu/i }),
        ).not.toBeInTheDocument()
    })
})
