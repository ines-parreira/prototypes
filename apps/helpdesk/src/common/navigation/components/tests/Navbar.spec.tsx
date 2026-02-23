import type React from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { ActiveContent } from 'common/navigation'
import type { NavBarContextType } from 'common/navigation/hooks/useNavBar/context'
import {
    NavBarContext,
    NavBarDisplayMode,
} from 'common/navigation/hooks/useNavBar/context'
import useAppSelector from 'hooks/useAppSelector'
import { renderWithRouter } from 'utils/testing'

import { useDesktopOnlyShowGlobalNavFeatureFlag } from '../../hooks/useShowGlobalNavFeatureFlag'
import Navbar from '../Navbar'
import { NavBarProvider } from '../NavBarProvider'

import css from '../Navbar.less'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

jest.mock('../../hooks/useShowGlobalNavFeatureFlag', () => ({
    useDesktopOnlyShowGlobalNavFeatureFlag: jest.fn(),
}))
const useDesktopOnlyShowGlobalNavFeatureFlagMock = assumeMock(
    useDesktopOnlyShowGlobalNavFeatureFlag,
)

jest.mock('common/notifications', () => ({
    NotificationsButton: () => <div>NotificationsButton</div>,
}))

jest.mock('@repo/logging')
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('providers/ui/SpotlightContext', () => ({
    useSpotlightContext: jest.fn(() => ({
        isOpen: false,
        setIsOpen: jest.fn(),
    })),
}))

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
        return renderWithRouter(<NavBarProvider>{component}</NavBarProvider>)
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(false)
        useDesktopOnlyShowGlobalNavFeatureFlagMock.mockReturnValue(false)
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
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

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should not render the main navigation, title or split ticket view toggle when wayfinding flag is enabled', () => {
            const { queryByText } = renderWithContext(
                <Navbar
                    {...props}
                    title="beep-boop-title"
                    splitTicketViewToggle={<button>SplitTicketView</button>}
                />,
            )
            expect(queryByText('MainNavigation')).not.toBeInTheDocument()
            expect(queryByText('beep-boop-title')).not.toBeInTheDocument()
            expect(queryByText('SplitTicketView')).not.toBeInTheDocument()
        })

        it('should still render header content when wayfinding flag is enabled', () => {
            const { getByText } = renderWithContext(
                <Navbar {...props} headerContent={<div>HeaderContent</div>} />,
            )
            expect(getByText('HeaderContent')).toBeInTheDocument()
        })
    })
})
