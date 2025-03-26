import { render, screen } from '@testing-library/react'

import {
    NavBarContextType,
    NavBarDisplayMode,
} from '../../hooks/useNavBar/context'
import { useNavBar } from '../../hooks/useNavBar/useNavBar'
import { NavBarButtonTooltip } from '../NavBarButtonTooltip'

jest.mock('../../hooks/useNavBar/useNavBar')
const mockUseNavBar = useNavBar as jest.MockedFunction<typeof useNavBar>

const mockNavBarContextValues: NavBarContextType = {
    navBarDisplay: NavBarDisplayMode.Open,
    setNavBarDisplay: jest.fn(),
    isNavBarVisible: false,
    isNavHovered: false,
    onNavHover: jest.fn(),
    onNavLeave: jest.fn(),
    onOverlayHover: jest.fn(),
    onMenuToggle: jest.fn(),
    onNavBarShortCutToggle: jest.fn(),
}

describe('NavBarButtonTooltip', () => {
    it('should render the expand message when nav bar is not visible', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Collapsed,
        })

        render(<NavBarButtonTooltip />)

        expect(screen.getByText('Expand')).toBeInTheDocument()
        expect(screen.getByText('[')).toBeInTheDocument()
    })

    it('should render collapse message when nav bar is visible', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Open,
        })

        render(<NavBarButtonTooltip />)

        expect(screen.getByText('Collapse')).toBeInTheDocument()
        expect(screen.getByText('[')).toBeInTheDocument()
    })
})
