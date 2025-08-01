import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { ActiveContent } from 'common/navigation'
import {
    NavBarContext,
    NavBarContextType,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import useAppSelector from 'hooks/useAppSelector'

import { useDesktopOnlyShowGlobalNavFeatureFlag } from '../../hooks/useShowGlobalNavFeatureFlag'
import Navbar from '../Navbar'
import { NavBarProvider } from '../NavBarProvider'

import css from '../Navbar.less'

jest.mock('../../hooks/useShowGlobalNavFeatureFlag', () => ({
    useDesktopOnlyShowGlobalNavFeatureFlag: jest.fn(),
}))
const useDesktopOnlyShowGlobalNavFeatureFlagMock = assumeMock(
    useDesktopOnlyShowGlobalNavFeatureFlag,
)

jest.mock('common/notifications', () => ({
    NotificationsButton: () => <div>NotificationsButton</div>,
}))

jest.mock('common/segment')
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('pages/tickets/navbar/CreateTicketNavbarButton', () => () => (
    <div>CreateTicketNavbarButton</div>
))
jest.mock('pages/tickets/navbar/PlaceCallNavbarButton', () => () => (
    <div>PlaceCallNavbarButton</div>
))
jest.mock('../MainNavigation', () => ({
    __esModule: true,
    ...jest.requireActual('../MainNavigation'),
    default: () => <div>MainNavigation</div>,
}))
jest.mock('../UserMenuWithToggle', () => () => <div>UserMenuWithToggle</div>)

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

describe('Navbar', () => {
    const props = {
        activeContent: ActiveContent.Tickets,
        children: null,
        title: '',
    }

    const renderWithContext = (component: React.ReactNode) => {
        return render(<NavBarProvider>{component}</NavBarProvider>)
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(false)
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(false)
    })

    it('should set the navbar width if resizing is not disabled', () => {
        const { container } = renderWithContext(<Navbar {...props} />)
        expect(container.firstChild).toHaveStyle('width: 238px')
    })

    it('should not set the navbar width if resizing is disabled', () => {
        const { container } = renderWithContext(<Navbar {...props} />)
        expect(container.firstChild).not.toHaveStyle('width:')
    })

    it('should render the main navigation if the user does not have the global nav flag', () => {
        const { getByText } = renderWithContext(<Navbar {...props} />)
        expect(getByText('MainNavigation')).toBeInTheDocument()
    })

    it('should render the title if the user has the global nav flag', () => {
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(true)
        const { getByText } = renderWithContext(
            <Navbar {...props} title="beep-boop-title" />,
        )
        expect(getByText('beep-boop-title')).toBeInTheDocument()
    })

    it('should render the split ticket view toggle', () => {
        const { getByText } = renderWithContext(
            <Navbar
                {...props}
                splitTicketViewToggle={<button>SplitTicketView</button>}
            />,
        )
        expect(getByText('SplitTicketView')).toBeInTheDocument()
    })

    it('should hide the navigation when the panel is opened', () => {
        const { container } = renderWithContext(<Navbar {...props} />)
        expect(
            container.querySelector(`.${css['hidden-panel']}`),
        ).toBeInTheDocument()
    })

    it('should show the navigation when the panel is opened', () => {
        useAppSelectorMock.mockReturnValue(true)
        const { container } = renderWithContext(<Navbar {...props} />)
        expect(
            container.querySelector(`.${css['hidden-panel']}`),
        ).not.toBeInTheDocument()
    })

    it('should render header content if given', () => {
        const { getByText } = renderWithContext(
            <Navbar {...props} headerContent={<div>HeaderContent</div>} />,
        )
        expect(getByText('HeaderContent')).toBeInTheDocument()
    })

    it('should show the user menu if the user does not have the global nav flag', () => {
        const { getByText } = renderWithContext(
            <Navbar {...props} activeContent={ActiveContent.Settings} />,
        )
        expect(getByText('UserMenuWithToggle')).toBeInTheDocument()
    })

    it('should hide the user menu if the user has the global nav flag', () => {
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(true)
        const { queryByText } = renderWithContext(<Navbar {...props} />)
        expect(queryByText('UserMenuWithToggle')).not.toBeInTheDocument()
    })

    it('should have resize when navbarDisplay is Open', () => {
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(true)
        const { container } = render(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Navbar {...props} />
            </NavBarContext.Provider>,
        )
        expect(container.firstChild).toHaveAttribute('style')
    })
    it('should not have resize when navbarDisplay is Open but the disableResize prop is true', () => {
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(true)
        const { container } = render(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <Navbar {...props} disableResize={true} />
            </NavBarContext.Provider>,
        )
        expect(container.firstChild).not.toHaveAttribute('style')
    })

    it('should not have resize when navbarDisplay is not Open', () => {
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(true)
        const values = {
            ...mockNavBarContextValues,
            navBarDisplay: NavBarDisplayMode.Collapsed,
        }

        const { container } = render(
            <NavBarContext.Provider value={values}>
                <Navbar {...props} />
            </NavBarContext.Provider>,
        )
        expect(container.firstChild).not.toHaveAttribute('style')
    })
})
