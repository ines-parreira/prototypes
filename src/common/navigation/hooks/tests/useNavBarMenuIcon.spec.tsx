import {renderHook} from '@testing-library/react-hooks'

import {NavBarContextType, NavBarDisplayMode} from '../useNavBar/context'
import {useNavBar} from '../useNavBar/useNavBar'
import {NavBarMenuIcons, useNavBarMenuIcon} from '../useNavBarMenuIcon'

jest.mock('../useNavBar/useNavBar')
const mockUseNavBar = useNavBar as jest.MockedFunction<typeof useNavBar>
const mockNavBarContextValues: NavBarContextType = {
    navBarDisplay: NavBarDisplayMode.Collapsed,
    setNavBarDisplay: jest.fn(),
    isNavBarVisible: false,
    isGlobalNavHovered: false,
    onGlobalNavHover: jest.fn(),
    onGlobalNavLeave: jest.fn(),
    onOverlayEnter: jest.fn(),
    onMenuToggle: jest.fn(),
}

describe('useNavBarMenuIcon', () => {
    it('should return double left arrow when Open and hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isGlobalNavHovered: true,
            navBarDisplay: NavBarDisplayMode.Open,
        })

        const {result} = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.DoubleLeft)
    })

    it('should return menu icon when Open and not hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isGlobalNavHovered: false,
            navBarDisplay: NavBarDisplayMode.Open,
        })

        const {result} = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })

    it('should return double right arrow when Hover and hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isGlobalNavHovered: true,
            navBarDisplay: NavBarDisplayMode.Hover,
        })

        const {result} = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.DoubleRight)
    })

    it('should return menu icon when Hover and not hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isGlobalNavHovered: false,
            navBarDisplay: NavBarDisplayMode.Hover,
        })

        const {result} = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })

    it('should return menu icon when Collapsed', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isGlobalNavHovered: false,
            navBarDisplay: NavBarDisplayMode.Collapsed,
        })

        const {result} = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })
    it('should return menu icon with an unsupported display mode', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isGlobalNavHovered: false,
            // @ts-expect-error - Testing the default case
            navBarDisplay: 'Unsupported',
        })

        const {result} = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })
})
