import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {billingState} from 'fixtures/billing'
import {RootState} from 'state/types'
import {GorgiasChatMinimumSnippetVersion} from 'models/integration/types'
import * as segment from 'common/segment'
import {TicketChannel} from 'business/types/ticket'
import {getHasAutomate} from 'state/billing/selectors'
import {HelpCenterNavigation} from '../HelpCenterNavigation'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    __esModule: true,
    getHasAutomate: jest.fn(),
}))

jest.mock('pages/common/components/SecondaryNavbar/SecondaryNavbar', () => {
    return ({children}: {children: React.ReactNode}) => <div>{children}</div>
})

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => {
    return jest.fn(() => [
        {
            id: 1,
            type: 'shopType',
            name: 'shopName',
        },
    ])
})
jest.mock('react-router-dom', () => {
    return {
        useHistory: () => ({
            location: {
                pathname: '/app/settings/help-center/1',
            },
            push: jest.fn(),
        }),
        Link: () => 'Link',
        NavLink: ({children}: {children: React.ReactNode}) => (
            <div>{children}</div>
        ),
    }
})

jest.mock('launchdarkly-react-client-sdk')

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const mockGetHasAutomate = getHasAutomate as jest.MockedFunction<
    typeof getHasAutomate
>

const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS(billingState),
} as RootState
const mockedStore = mockStore({
    ...defaultState,
    entities: {
        chatInstallationStatus: {
            installed: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
        },
    },
})

describe('HelpCenterNavigation', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': true,
        })
    })
    it('should render', () => {
        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation
                    helpCenterId={1}
                    helpCenterShopName={'shopName'}
                />
            </Provider>
        )
    })

    it('should not render the automate tab when `hasAutomate` is false', () => {
        mockGetHasAutomate.mockReturnValue(false)
        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation
                    helpCenterId={1}
                    helpCenterShopName={'shopName'}
                />
            </Provider>
        )
        expect(screen.queryByText(/Automate/i)).not.toBeInTheDocument()
    })

    it('should display automate menu item', () => {
        mockGetHasAutomate.mockReturnValue(true)
        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation
                    helpCenterId={1}
                    helpCenterShopName={'shopName'}
                />
            </Provider>
        )
        expect(screen.getByText(/Automate/i)).toBeInTheDocument()
    })

    it('should display a red dot whenever shop name is not provided', () => {
        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation helpCenterId={1} />
            </Provider>
        )
        expect(screen.getByAltText('status icon')).toBeInTheDocument()
    })

    it('should have "upgrade to automate" if newChannelsView ff is off and hasAutomate = false', () => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': false,
            'change-automate-settings-button-position': true,
        })

        const log = jest.spyOn(segment, 'logEvent')

        mockGetHasAutomate.mockReturnValue(false)
        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation helpCenterId={1} />
            </Provider>
        )

        const button = screen.getByText(/Upgrade to automate/i)
        expect(button).toBeInTheDocument()
        button.click()
        expect(log).toHaveBeenCalledWith(
            segment.SegmentEvent.AutomateSettingButtonClicked,
            {
                channel: TicketChannel.HelpCenter,
                version: 'Upsell',
            }
        )
    })

    it('should have "Automate Settings" if newChannelsView ff is off and hasAutomate = true and helpCEnterShopName is defined', () => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': false,
            'change-automate-settings-button-position': true,
        })
        mockGetHasAutomate.mockReturnValue(true)

        const log = jest.spyOn(segment, 'logEvent')

        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation
                    helpCenterId={1}
                    helpCenterShopName={'shopName'}
                />
            </Provider>
        )

        const button = screen.getByText(/Automate Settings/i)
        expect(button).toBeInTheDocument()
        button.click()
        expect(log).toHaveBeenCalledWith(
            segment.SegmentEvent.AutomateSettingButtonClicked,
            {
                channel: TicketChannel.HelpCenter,
                version: 'Setting',
            }
        )
    })

    it('should have "Connect to Automate" if newChannelsView ff is off and hasAutomate = true and helpCEnterShopName is defined', () => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': false,
            'change-automate-settings-button-position': true,
        })
        mockGetHasAutomate.mockReturnValue(true)

        const log = jest.spyOn(segment, 'logEvent')

        render(
            <Provider store={mockedStore}>
                <HelpCenterNavigation helpCenterId={1} />
            </Provider>
        )

        const button = screen.getByText(/Connect to Automate/i)
        expect(button).toBeInTheDocument()
        button.click()
        expect(log).toHaveBeenCalledWith(
            segment.SegmentEvent.AutomateSettingButtonClicked,
            {
                channel: TicketChannel.HelpCenter,
                version: 'Store',
            }
        )
    })
})
