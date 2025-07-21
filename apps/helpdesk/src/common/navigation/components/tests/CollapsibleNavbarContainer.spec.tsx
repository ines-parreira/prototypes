import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import {
    NavBarContext,
    NavBarContextType,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { Panels } from 'core/layout/panels'

import { CollapsibleNavbarContainer } from '../CollapsibleNavbarContainer'

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

describe('CollapsibleNavbarContainer', () => {
    const defaultProps = {
        children: <div>Test Content</div>,
    }

    const renderWithContext = () =>
        render(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Panels size={100}>
                    <CollapsibleNavbarContainer {...defaultProps} />
                </Panels>
            </NavBarContext.Provider>,
        )

    it('calls appropriate handlers on overlay mouse enter', () => {
        const mockOnOverlayHover = jest.fn()

        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Collapsed,
            onOverlayHover: mockOnOverlayHover,
        })

        const { container } = renderWithContext()
        const overlay = container.querySelector('[data-name="navbar-overlay"]')!

        fireEvent.mouseEnter(overlay)

        expect(mockOnOverlayHover).toHaveBeenCalled()
    })

    it('calls onNavHover when mouse enters collapsible container', () => {
        const mockOnNavHover = jest.fn()

        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Collapsed,
            onNavHover: mockOnNavHover,
        })

        const { container } = renderWithContext()
        const collapsible = container.querySelector(
            '[data-name="navbar-collapsible-container"]',
        )!

        fireEvent.mouseEnter(collapsible)

        expect(mockOnNavHover).toHaveBeenCalled()
    })
})
