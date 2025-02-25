import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { TicketChannel } from 'business/types/ticket'
import * as segment from 'common/segment'
import { billingState } from 'fixtures/billing'
import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'
import { getHasAutomate } from 'state/billing/selectors'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { HelpCenterNavigation } from '../HelpCenterNavigation'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    __esModule: true,
    getHasAutomate: jest.fn(),
}))

jest.mock('pages/common/components/SecondaryNavbar/SecondaryNavbar', () => {
    return ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    )
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
        NavLink: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    }
})

jest.mock('launchdarkly-react-client-sdk')

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const mockGetHasAutomate = getHasAutomate as jest.MockedFunction<
    typeof getHasAutomate
>

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS(billingState),
    entities: {
        chatInstallationStatus: {
            installed: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
        },
    },
} as RootState

describe('HelpCenterNavigation', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': true,
        })
    })
    it('should render', () => {
        renderWithStoreAndQueryClientProvider(
            <HelpCenterNavigation
                helpCenterId={1}
                helpCenterShopName={'shopName'}
            />,
            defaultState,
        )
    })

    it('should not render the automate tab when `hasAutomate` is false', () => {
        mockGetHasAutomate.mockReturnValue(false)
        renderWithStoreAndQueryClientProvider(
            <HelpCenterNavigation
                helpCenterId={1}
                helpCenterShopName={'shopName'}
            />,
            defaultState,
        )
        expect(screen.queryByText(/Automate/i)).not.toBeInTheDocument()
    })

    it('should display automate menu item', () => {
        mockGetHasAutomate.mockReturnValue(true)
        renderWithStoreAndQueryClientProvider(
            <HelpCenterNavigation
                helpCenterId={1}
                helpCenterShopName={'shopName'}
            />,
            defaultState,
        )
        expect(screen.getByText(/Automate/i)).toBeInTheDocument()
    })

    it('should display a red dot whenever shop name is not provided', () => {
        renderWithStoreAndQueryClientProvider(
            <HelpCenterNavigation helpCenterId={1} />,
            defaultState,
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
        renderWithStoreAndQueryClientProvider(
            <HelpCenterNavigation helpCenterId={1} />,
            defaultState,
        )

        const button = screen.getByText(/Upgrade to automate/i)
        expect(button).toBeInTheDocument()
        button.click()
        expect(log).toHaveBeenCalledWith(
            segment.SegmentEvent.AutomateSettingButtonClicked,
            {
                channel: TicketChannel.HelpCenter,
                version: 'Upsell',
            },
        )
    })
})
