import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'

import useActiveItem from '../../hooks/useActiveItem'
import {
    NavBarContext,
    NavBarContextType,
    NavBarDisplayMode,
} from '../../hooks/useNavBar/context'
import GlobalNavigation from '../GlobalNavigation'

jest.mock('state/currentUser/selectors', () => ({ getCurrentUser: jest.fn() }))
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))
const getHasAutomateMock = assumeMock(getHasAutomate)

jest.mock('../../hooks/useActiveItem', () => jest.fn())
const useActiveItemMock = assumeMock(useActiveItem)

jest.mock('../GlobalNavigationSpotlight', () => ({
    GlobalNavigationSpotlight: () => <div>GlobalNavigationSpotlight</div>,
}))
jest.mock('../NotificationsItem', () => () => <div>NotificationsItem</div>)
jest.mock('../UserItem', () => () => <div>UserItem</div>)

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

describe('GlobalNavigation', () => {
    const mockNavBarContextValues: NavBarContextType = {
        navBarDisplay: NavBarDisplayMode.Open,
        setNavBarDisplay: jest.fn(),
        isNavBarVisible: false,
        isNavHovered: false,
        onNavHover: jest.fn(),
        onNavLeave: jest.fn(),
        onOverlayHover: jest.fn(),
        onMenuToggle: jest.fn(),
    }

    const renderWithContext = () =>
        render(
            <NavBarContext.Provider value={mockNavBarContextValues}>
                <GlobalNavigation />
            </NavBarContext.Provider>,
        )

    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.BasicAgent } }),
        )
        useActiveItemMock.mockReturnValue('tickets')
        mockUseFlag.mockImplementation(() => false)
    })

    it('should render the menu icon when the nav is pinned', () => {
        const { getByText } = renderWithContext()
        expect(getByText('menu')).toBeInTheDocument()
    })

    it('should render the home icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('home')).toBeInTheDocument()
    })

    it('should render the search icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('GlobalNavigationSpotlight')).toBeInTheDocument()
    })

    it('should render the notifications icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('NotificationsItem')).toBeInTheDocument()
    })

    it('should render the tickets icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('question_answer')).toBeInTheDocument()
    })

    it('should not render the automation icon if the user is not a lead agent', () => {
        const { queryByText } = renderWithContext()
        expect(queryByText('bolt')).not.toBeInTheDocument()
    })

    it('should render the automation icon if the user is a lead agent', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        const { getByText } = renderWithContext()
        expect(getByText('bolt')).toBeInTheDocument()
    })

    it('should not render the automation icon if the AutomateSettingsRevamp feature flag is enabled', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.AutomateSettingsRevamp ? true : false,
        )
        const { queryByText } = renderWithContext()
        expect(queryByText('bolt')).not.toBeInTheDocument()
    })

    it('should not render the convert icon if the user is not an admin', () => {
        const { queryByText } = renderWithContext()
        expect(queryByText('monetization_on')).not.toBeInTheDocument()
    })

    it('should render the convert icon if the user is an admin', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Admin } }),
        )
        const { getByText } = renderWithContext()
        expect(getByText('monetization_on')).toBeInTheDocument()
    })

    it('should render the customers icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('people')).toBeInTheDocument()
    })

    it('should render the stats icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('bar_chart')).toBeInTheDocument()
    })

    it('should render the settings icon', () => {
        const { getByText } = renderWithContext()
        expect(getByText('settings')).toBeInTheDocument()
    })

    it('should render the user item', () => {
        const { getByText } = renderWithContext()
        expect(getByText('UserItem')).toBeInTheDocument()
    })

    it('should not render the ai agent icon if user is not a lead agent', () => {
        const { queryByText } = renderWithContext()
        expect(queryByText('auto_awesome')).not.toBeInTheDocument()
    })

    it('should not render the ai agent icon if the feature flag is not enabled', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        const { queryByText } = renderWithContext()
        expect(queryByText('auto_awesome')).not.toBeInTheDocument()
    })

    it('should not render the ai agent icon if the feature flag is enabled but user does not have access to automate', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.ConvAiStandaloneMenu ? true : false,
        )
        getHasAutomateMock.mockReturnValue(false)
        const { queryByText } = renderWithContext()
        expect(queryByText('auto_awesome')).not.toBeInTheDocument()
    })

    it('should render the ai agent icon if the feature flag is enabled and user has access to automate', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Agent } }),
        )
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.ConvAiStandaloneMenu ? true : false,
        )
        getHasAutomateMock.mockReturnValue(true)
        const { queryByText } = renderWithContext()
        expect(queryByText('auto_awesome')).toBeInTheDocument()
    })
})
