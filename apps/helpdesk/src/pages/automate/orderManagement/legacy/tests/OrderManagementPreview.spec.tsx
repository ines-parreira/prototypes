import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { billingState } from 'fixtures/billing'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { RootState } from 'state/types'

import OrderManagementPreview from '../OrderManagementPreview'

const mockOnChannelChange = jest.fn()

const mockChatChannel: SelfServiceChannel = {
    type: TicketChannel.Chat,
    value: {
        id: 1,
        name: 'Test Chat',
        type: IntegrationType.GorgiasChat,
        meta: { app_id: 'app-1' },
    } as GorgiasChatIntegration,
}

const mockChannels: SelfServiceChannel[] = [mockChatChannel]

const captured: {
    onChange?: (...args: any[]) => void
} = {}

jest.mock('pages/automate/connectedChannels/ConnectedChannelsContext', () => ({
    useConnectedChannelsContext: () => ({
        channels: mockChannels,
        channel: mockChatChannel,
        onChannelChange: mockOnChannelChange,
    }),
}))

jest.mock(
    'pages/automate/common/components/preview/SelfServicePreviewContainer',
    () => ({
        __esModule: true,
        default: ({ channel, onChange, children }: any) => {
            captured.onChange = onChange
            return <div>{children(channel)}</div>
        },
    }),
)

jest.mock(
    'pages/automate/common/components/preview/SelfServicePreview',
    () => ({
        __esModule: true,
        default: () => <div>SelfServicePreview</div>,
    }),
)

jest.mock(
    'pages/automate/common/components/preview/SelfServiceFeatureDisabledOnChannelAlert',
    () => ({
        __esModule: true,
        default: () => <div>SelfServiceFeatureDisabledOnChannelAlert</div>,
    }),
)

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({ integrations: [] }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {},
            },
        },
        chatsApplicationAutomationSettings: {
            'app-1': {
                orderManagement: { enabled: true },
                workflows: { entrypoints: [] },
            },
        },
    },
} as unknown as RootState

const history = createMemoryHistory()

describe('OrderManagementPreview', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        captured.onChange = undefined
    })

    it('should render without crashing when order management is enabled', () => {
        render(
            <OrderManagementPreview
                history={history}
                selfServiceConfiguration={mockSelfServiceConfiguration}
            />,
            { storeState: defaultState },
        )
        expect(screen.getByText('SelfServicePreview')).toBeInTheDocument()
    })

    it('should pass onChannelChange directly as onChange', () => {
        render(
            <OrderManagementPreview
                history={history}
                selfServiceConfiguration={mockSelfServiceConfiguration}
            />,
            { storeState: defaultState },
        )
        expect(captured.onChange).toBe(mockOnChannelChange)
    })

    it('should render disabled alert when order management is disabled for chat channel', () => {
        render(
            <OrderManagementPreview
                history={history}
                selfServiceConfiguration={mockSelfServiceConfiguration}
            />,
            {
                storeState: {
                    ...defaultState,
                    entities: {
                        ...defaultState.entities,
                        chatsApplicationAutomationSettings: {
                            'app-1': {
                                orderManagement: { enabled: false },
                                workflows: { entrypoints: [] },
                            },
                        },
                    },
                } as unknown as RootState,
            },
        )
        expect(
            screen.getByText('SelfServiceFeatureDisabledOnChannelAlert'),
        ).toBeInTheDocument()
        expect(screen.queryByText('SelfServicePreview')).not.toBeInTheDocument()
    })

    it('should render preview when order management settings are absent for chat channel', () => {
        render(
            <OrderManagementPreview
                history={history}
                selfServiceConfiguration={mockSelfServiceConfiguration}
            />,
            {
                storeState: {
                    ...defaultState,
                    entities: {
                        ...defaultState.entities,
                        chatsApplicationAutomationSettings: {},
                    },
                } as unknown as RootState,
            },
        )
        expect(screen.getByText('SelfServicePreview')).toBeInTheDocument()
    })
})
