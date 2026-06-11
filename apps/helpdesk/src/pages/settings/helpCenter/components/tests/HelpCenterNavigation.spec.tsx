import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import * as segment from '@repo/logging'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'

import { HelpCenterNavigation } from '../HelpCenterNavigation'

jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('pages/common/components/SecondaryNavbar/SecondaryNavbar', () => {
    return {
        SecondaryNavbar: ({ children }: { children?: React.ReactNode }) => (
            <div>{children}</div>
        ),
    }
})

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => {
    return {
        useStoreIntegrations: jest.fn(() => [
            {
                id: 1,
                type: 'shopType',
                name: 'shopName',
            },
        ]),
    }
})
jest.mock('@repo/feature-flags')

const mockUseFlags = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS(billingState),
    entities: {},
} as RootState

describe('HelpCenterNavigation', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': true,
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })
    it('should render', () => {
        render(
            <HelpCenterNavigation
                helpCenterId={1}
                helpCenterShopName={'shopName'}
            />,
            { storeState: defaultState },
        )
    })

    it('should not render the Automation Features tab when `hasAutomate` is false', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        render(
            <HelpCenterNavigation
                helpCenterId={1}
                helpCenterShopName={'shopName'}
            />,
            { storeState: defaultState },
        )
        expect(
            screen.queryByText(/Automation Features/i),
        ).not.toBeInTheDocument()
    })

    it('should display automation features menu item', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        render(
            <HelpCenterNavigation
                helpCenterId={1}
                helpCenterShopName={'shopName'}
            />,
            { storeState: defaultState },
        )
        expect(screen.getByText(/Automation Features/i)).toBeInTheDocument()
    })

    it('should display a red dot whenever shop name is not provided', () => {
        render(<HelpCenterNavigation helpCenterId={1} />, {
            storeState: defaultState,
        })
        expect(screen.getByAltText('status icon')).toBeInTheDocument()
    })

    it('should have "upgrade to AI Agent" if newChannelsView ff is off and hasAutomate = false', () => {
        mockUseFlags.mockReturnValue({
            'new-channels-view': false,
            'change-automate-settings-button-position': true,
        })

        const log = jest.spyOn(segment, 'logEvent')

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        render(<HelpCenterNavigation helpCenterId={1} />, {
            storeState: defaultState,
        })

        const button = screen.getByText(/Upgrade to AI Agent/i)
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
