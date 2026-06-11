import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

import { ReturnOrderFlowPreview } from '../ReturnOrderFlowPreview'

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

describe('ReturnOrderFlowPreview', () => {
    const automatedResponseAction: {
        type: ReturnActionType.AutomatedResponse
        responseMessageContent: { html: string; text: string }
    } = {
        type: ReturnActionType.AutomatedResponse,
        responseMessageContent: { html: '<p>Test</p>', text: 'Test' },
    }

    const returnPortalAction: {
        type: ReturnActionType.LoopReturns
        returnPortalUrl: string
        integrationId: number
    } = {
        type: ReturnActionType.LoopReturns,
        returnPortalUrl: 'https://returns.example.com',
        integrationId: 1,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        captured.onChange = undefined
        captured.channels = undefined
        captured.channel = undefined
        captured.contextValue = undefined
    })

    it('should render without crashing', () => {
        render(
            <ReturnOrderFlowPreview returnAction={automatedResponseAction} />,
        )
        expect(screen.getByText('SelfServicePreview')).toBeInTheDocument()
    })

    it('should pass channels from context to SelfServicePreviewContainer', () => {
        render(
            <ReturnOrderFlowPreview returnAction={automatedResponseAction} />,
        )
        expect(captured.channels).toBe(mockChannels)
    })

    it('should pass channel from context to SelfServicePreviewContainer', () => {
        render(
            <ReturnOrderFlowPreview returnAction={automatedResponseAction} />,
        )
        expect(captured.channel).toBe(mockChannel)
    })

    it('should pass onChannelChange directly as onChange', () => {
        render(
            <ReturnOrderFlowPreview returnAction={automatedResponseAction} />,
        )
        expect(captured.onChange).toBe(mockOnChannelChange)
    })

    it('should set automatedResponseMessageContent when returnAction is AutomatedResponse', () => {
        render(
            <ReturnOrderFlowPreview returnAction={automatedResponseAction} />,
        )
        expect(captured.contextValue?.automatedResponseMessageContent).toEqual(
            automatedResponseAction.responseMessageContent,
        )
    })

    it('should set automatedResponseMessageContent to undefined when returnAction is not AutomatedResponse', () => {
        render(<ReturnOrderFlowPreview returnAction={returnPortalAction} />)
        expect(
            captured.contextValue?.automatedResponseMessageContent,
        ).toBeUndefined()
    })
})
