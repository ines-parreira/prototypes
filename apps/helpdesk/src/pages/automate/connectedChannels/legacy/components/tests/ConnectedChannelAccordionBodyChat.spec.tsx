import React from 'react'

import { render } from '@testing-library/react'

import { LegacyChannelSlug } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import {
    MAX_ACTIVE_FLOWS,
    ORDER_MANAGEMENT,
} from '../../../../common/components/constants'
import WorkflowsFeatureList from '../../../../common/components/WorkflowsFeatureList'
import { useConnectedChannelsViewContext } from '../../ConnectedChannelsViewContext'
import ConnectedChannelAccordionBodyChat from '../ConnectedChannelAccordionBodyChat'
import ConnectedChannelFeatureToggle from '../ConnectedChannelFeatureToggle'

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings', () =>
    jest.fn(),
)
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('state/billing/selectors', () => ({
    getHasAutomate: jest.fn(),
}))
jest.mock('../../ConnectedChannelsViewContext', () => ({
    useConnectedChannelsViewContext: jest.fn(),
}))
jest.mock('../../../../common/components/WorkflowsFeatureList', () =>
    jest.fn(() => <div>WorkflowsFeatureList</div>),
)
jest.mock('../ConnectedChannelFeatureToggle', () =>
    jest.fn(() => <div>ConnectedChannelFeatureToggle</div>),
)
jest.mock('../AutomateSubscriptionAction', () =>
    jest.fn(() => <div>AutomateSubscriptionAction</div>),
)

const mockChannel = {
    value: {
        meta: { app_id: 'app-1' },
        id: 'channel-1',
    },
} as unknown as SelfServiceChatChannel

describe('ConnectedChannelAccordionBodyChat', () => {
    beforeEach(() => {
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                'app-1': {
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: true },
                    workflows: { entrypoints: [{ id: 'workflow-1' }] },
                },
            },
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
            isUpdatePending: false,
        })
        ;(useAppSelector as jest.Mock).mockReturnValue(true) // hasAutomate is true
        ;(useConnectedChannelsViewContext as jest.Mock).mockReturnValue({
            articleRecommendationHelpCenterId: 1,
            isHelpCenterEmpty: false,
            isOrderManagementAvailable: true,
            articleRecommendationUrl: '/article-recommendation-url',
            workflowConfigurations: [],
            workflowsEntrypoints: [],
        })
    })

    it('renders WorkflowsFeatureList with correct props', () => {
        render(<ConnectedChannelAccordionBodyChat channel={mockChannel} />)

        expect(WorkflowsFeatureList).toHaveBeenCalledWith(
            expect.objectContaining({
                channelType: LegacyChannelSlug.Chat,
                channelId: 'chat-app-1',
                integrationId: 'channel-1',
                entrypoints: [{ id: 'workflow-1' }],
                maxActiveWorkflows: MAX_ACTIVE_FLOWS,
            }),
            expect.anything(),
        )
    })

    it('renders ConnectedChannelFeatureToggle for Order Management when available', () => {
        render(<ConnectedChannelAccordionBodyChat channel={mockChannel} />)

        expect(ConnectedChannelFeatureToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                name: ORDER_MANAGEMENT,
                value: true,
                disabled: false,
            }),
            expect.anything(),
        )
    })

    it('renders ConnectedChannelFeatureToggle for Article Recommendation with correct state', () => {
        render(<ConnectedChannelAccordionBodyChat channel={mockChannel} />)

        expect(ConnectedChannelFeatureToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                name: expect.anything(),
                description:
                    'Requires an active Help Center with published articles.',
                value: true,
                disabled: false,
            }),
            expect.anything(),
        )
    })
})
