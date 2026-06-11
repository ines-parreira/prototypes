import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

import { ReportOrderIssueFlowPreview } from '../ReportOrderIssueFlowPreview'

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

describe('ReportOrderIssueFlowPreview', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        captured.onChange = undefined
        captured.channels = undefined
        captured.channel = undefined
        captured.contextValue = undefined
    })

    it('should render without crashing', () => {
        render(<ReportOrderIssueFlowPreview hasHoveredScenario={false} />)
        expect(screen.getByText('SelfServicePreview')).toBeInTheDocument()
    })

    it('should pass channels from context to SelfServicePreviewContainer', () => {
        render(<ReportOrderIssueFlowPreview hasHoveredScenario={false} />)
        expect(captured.channels).toBe(mockChannels)
    })

    it('should pass channel from context to SelfServicePreviewContainer', () => {
        render(<ReportOrderIssueFlowPreview hasHoveredScenario={false} />)
        expect(captured.channel).toBe(mockChannel)
    })

    it('should pass onChannelChange directly as onChange', () => {
        render(<ReportOrderIssueFlowPreview hasHoveredScenario={false} />)
        expect(captured.onChange).toBe(mockOnChannelChange)
    })

    it('should pass hasHoveredScenario to context as hasHoveredReportOrderIssueScenario', () => {
        render(<ReportOrderIssueFlowPreview hasHoveredScenario={true} />)
        expect(captured.contextValue?.hasHoveredReportOrderIssueScenario).toBe(
            true,
        )
    })
})
