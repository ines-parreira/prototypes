import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import type { ReportIssueCaseReason } from 'models/selfServiceConfiguration/types'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

import { ReportOrderIssueFlowScenarioPreview } from '../ReportOrderIssueFlowScenarioPreview'

const mockOnChannelChange = jest.fn()

const mockChannel: SelfServiceChannel = {
    type: TicketChannel.Chat,
    value: {
        id: 1,
        name: 'Test Chat',
        type: IntegrationType.GorgiasChat,
        meta: { app_id: 'app-1' },
    } as GorgiasChatIntegration,
}

const mockChannels: SelfServiceChannel[] = [mockChannel]

const mockReasons: ReportIssueCaseReason[] = [
    {
        reasonKey: 'wrong_item',
        action: {
            showHelpfulPrompt: false,
            type: 'automated_response',
            responseMessageContent: {
                html: '<p>Wrong item</p>',
                text: 'Wrong item',
            },
        },
    },
    {
        reasonKey: 'damaged_item',
        action: {
            showHelpfulPrompt: false,
            type: 'automated_response',
            responseMessageContent: { html: '<p>Damaged</p>', text: 'Damaged' },
        },
    },
]

const captured: {
    onChange?: (...args: any[]) => void
    channels?: SelfServiceChannel[]
    channel?: SelfServiceChannel
    contextValue?: any
} = {}

jest.mock('pages/automate/connectedChannels/ConnectedChannelsContext', () => ({
    useConnectedChannelsContext: () => ({
        channels: mockChannels,
        channel: mockChannel,
        onChannelChange: mockOnChannelChange,
    }),
}))

jest.mock(
    'pages/automate/common/components/preview/SelfServicePreviewContainer',
    () => ({
        __esModule: true,
        SelfServicePreviewContainer: ({
            channels,
            channel,
            onChange,
            children,
        }: any) => {
            captured.onChange = onChange
            captured.channels = channels
            captured.channel = channel
            return <div>{children(channel)}</div>
        },
    }),
)

jest.mock(
    'pages/automate/common/components/preview/SelfServicePreviewContext',
    () => {
        const context = {
            Provider: ({ value, children }: any) => {
                captured.contextValue = value
                return children
            },
        }
        return { __esModule: true, SelfServicePreviewContext: context }
    },
)

jest.mock(
    'pages/automate/common/components/preview/SelfServicePreview',
    () => ({
        __esModule: true,
        SelfServicePreview: () => <div>SelfServicePreview</div>,
    }),
)

describe('ReportOrderIssueFlowScenarioPreview', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        captured.onChange = undefined
        captured.channels = undefined
        captured.channel = undefined
        captured.contextValue = undefined
    })

    it('should render without crashing', () => {
        render(
            <ReportOrderIssueFlowScenarioPreview
                reasons={mockReasons}
                expandedReasonKey={null}
                hoveredReasonKey={null}
            />,
        )
        expect(screen.getByText('SelfServicePreview')).toBeInTheDocument()
    })

    it('should pass channels from context to SelfServicePreviewContainer', () => {
        render(
            <ReportOrderIssueFlowScenarioPreview
                reasons={mockReasons}
                expandedReasonKey={null}
                hoveredReasonKey={null}
            />,
        )
        expect(captured.channels).toBe(mockChannels)
    })

    it('should pass onChannelChange directly as onChange', () => {
        render(
            <ReportOrderIssueFlowScenarioPreview
                reasons={mockReasons}
                expandedReasonKey={null}
                hoveredReasonKey={null}
            />,
        )
        expect(captured.onChange).toBe(mockOnChannelChange)
    })

    it('should pass reason keys to context', () => {
        render(
            <ReportOrderIssueFlowScenarioPreview
                reasons={mockReasons}
                expandedReasonKey={null}
                hoveredReasonKey={null}
            />,
        )
        expect(captured.contextValue?.reportOrderIssueReasons).toEqual([
            'wrong_item',
            'damaged_item',
        ])
    })

    it('should set expandedReason in context when expandedReasonKey matches', () => {
        render(
            <ReportOrderIssueFlowScenarioPreview
                reasons={mockReasons}
                expandedReasonKey="wrong_item"
                hoveredReasonKey={null}
            />,
        )
        expect(captured.contextValue?.reportOrderIssueReason).toEqual(
            mockReasons[0],
        )
    })

    it('should set expandedReason to undefined when expandedReasonKey does not match', () => {
        render(
            <ReportOrderIssueFlowScenarioPreview
                reasons={mockReasons}
                expandedReasonKey={null}
                hoveredReasonKey={null}
            />,
        )
        expect(captured.contextValue?.reportOrderIssueReason).toBeUndefined()
    })
})
