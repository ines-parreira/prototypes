import React from 'react'

import { render, screen } from '@testing-library/react'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'

import { CollapsibleNavBarWrapper } from '../CollapsibleNavBarWrapper'

jest.mock('common/navigation/hooks/useNavBar/useNavBar')

const mockUseNavBar = useNavBar as jest.MockedFunction<typeof useNavBar>

describe('CollapsibleNavBarWrapper', () => {
    const mockChildren = <div>Test Content</div>

    it('renders children directly when display mode is Open', () => {
        mockUseNavBar.mockReturnValue({
            navBarDisplay: NavBarDisplayMode.Open,
        } as any)

        render(
            <CollapsibleNavBarWrapper>{mockChildren}</CollapsibleNavBarWrapper>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
        expect(
            document.querySelector(
                '[data-name="navbar-collapsible-container"]',
            ),
        ).not.toBeInTheDocument()
    })

    it('wraps children in CollapsibleNavbarContainer when display mode is Hover', () => {
        mockUseNavBar.mockReturnValue({
            navBarDisplay: NavBarDisplayMode.Hover,
        } as any)

        render(
            <CollapsibleNavBarWrapper>{mockChildren}</CollapsibleNavBarWrapper>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
        expect(
            document.querySelector(
                '[data-name="navbar-collapsible-container"]',
            ),
        ).toBeInTheDocument()
    })
})
