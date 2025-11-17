import { render, screen } from '@testing-library/react'

import type { NavBarContextType } from 'common/navigation/hooks/useNavBar/context'
import {
    NavBarContext,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { Panels } from 'core/layout/panels'

import NavbarPanel from '../NavbarPanel'

jest.mock('common/navigation/hooks/useNavBar/useNavBar')
const mockUseNavBar = useNavBar as jest.MockedFunction<typeof useNavBar>
const mockNavBarContextValues: NavBarContextType = {
    navBarDisplay: NavBarDisplayMode.Open,
    setNavBarDisplay: jest.fn(),
    isNavHovered: false,
    isNavBarVisible: true,
    onNavHover: jest.fn(),
    onNavLeave: jest.fn(),
    onOverlayHover: jest.fn(),
    onMenuToggle: jest.fn(),
    onNavBarShortCutToggle: jest.fn(),
}

describe('NavbarPanel', () => {
    const defaultProps = {
        children: <div>Test Content</div>,
    }

    const renderWithContext = () =>
        render(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Panels size={100}>
                    <NavbarPanel {...defaultProps} />
                </Panels>
            </NavBarContext.Provider>,
        )

    it('renders Panel component when display mode is Open', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Open,
        })

        const { container } = renderWithContext()

        expect(
            container.querySelector('[data-panel-name="navigation"]'),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders the CollapsibleNavbar component when display mode is Hover', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Hover,
            isNavHovered: true,
        })

        const { container } = renderWithContext()

        expect(
            container.querySelector(
                '[data-name="navbar-collapsible-container"]',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
})
