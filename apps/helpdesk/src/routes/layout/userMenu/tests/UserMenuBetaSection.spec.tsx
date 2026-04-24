import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button, Menu } from '@gorgias/axiom'

import { UserMenuBetaSection } from '../UserMenuBetaSection'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2BaselineFlag: jest.fn(),
}))

const { useHelpdeskV2BaselineFlag } = jest.requireMock('@repo/feature-flags')
const useHelpdeskV2BaselineFlagMock = useHelpdeskV2BaselineFlag as jest.Mock

const renderInMenu = () =>
    render(
        <Menu defaultOpen trigger={<Button>Open menu</Button>}>
            <UserMenuBetaSection />
        </Menu>,
    )

describe('UserMenuBetaSection', () => {
    let onToggle: jest.Mock

    beforeEach(() => {
        onToggle = jest.fn()
    })

    it('renders nothing when the UIVisionBeta baseline flag is disabled', () => {
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle,
        })

        renderInMenu()

        expect(
            screen.queryByRole('menuitem', { name: /New UI/ }),
        ).not.toBeInTheDocument()
    })

    it('renders the New UI toggle and Leave feedback link when the flag is enabled', () => {
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle,
        })

        renderInMenu()

        expect(
            screen.getByRole('menuitem', { name: /New UI/ }),
        ).toBeInTheDocument()
        const leaveFeedback = screen.getByRole('menuitem', {
            name: /Leave feedback/,
        })
        expect(leaveFeedback).toHaveAttribute(
            'href',
            'https://gorgias.typeform.com/to/htnf1rc4',
        )
        expect(leaveFeedback).toHaveAttribute('target', '_blank')
        expect(leaveFeedback).toHaveAttribute('rel', 'noreferrer noopener')
    })

    it('calls the onToggle callback when the New UI menu item is clicked', async () => {
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: false,
            onToggle,
        })
        const user = userEvent.setup()

        renderInMenu()

        await user.click(screen.getByRole('menuitem', { name: /New UI/ }))

        expect(onToggle).toHaveBeenCalledTimes(1)
    })
})
