import { renderHook } from '@repo/testing'

import type { NavBarContextType } from '../useNavBar/context'
import { NavBarDisplayMode } from '../useNavBar/context'
import { useNavBar } from '../useNavBar/useNavBar'
import { NavBarMenuIcons, useNavBarMenuIcon } from '../useNavBarMenuIcon'

jest.mock('../useNavBar/useNavBar')
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

describe('useNavBarMenuIcon', () => {
    it('should return menu icon when Open', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: false,
            navBarDisplay: NavBarDisplayMode.Open,
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })

    it('should return double left arrow when Open and hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: true,
            navBarDisplay: NavBarDisplayMode.Open,
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.DoubleLeft)
    })

    it('should return double right arrow when Hover and hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: true,
            navBarDisplay: NavBarDisplayMode.Hover,
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.DoubleRight)
    })

    it('should return menu icon when Hover and not hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: false,
            navBarDisplay: NavBarDisplayMode.Hover,
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })

    it('should return double right arrow when Collapsed and hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: true,
            navBarDisplay: NavBarDisplayMode.Collapsed,
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.DoubleRight)
    })

    it('should return menu icon when Collapsed and not hovered', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: false,
            navBarDisplay: NavBarDisplayMode.Collapsed,
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })

    it('should return menu icon with an unsupported display mode', () => {
        mockUseNavBar.mockReturnValue({
            ...mockNavBarContextValues,
            isNavHovered: false,
            // @ts-expect-error - Testing the default case
            navBarDisplay: 'Unsupported',
        })

        const { result } = renderHook(useNavBarMenuIcon)
        expect(result.current).toBe(NavBarMenuIcons.Menu)
    })
})
