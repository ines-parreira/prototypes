import React from 'react'

import { render } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

import ChannelBlock from '../../helper/ChannelBlock'
import useOnlySupportedChannels from '../../helper/useOnlySupportedChannels'
import ChannelToggle from '../ChannelToggle'
import ChatChannels from '../ChatChannels'

// Mock the necessary hooks and components
jest.mock(
    'pages/automate/common/hooks/useApplicationsAutomationSettings',
    () => ({
        __esModule: true,
        default: jest.fn(),
        useApplicationsAutomationSettings: jest.fn(),
    }),
)
jest.mock('../../helper/useOnlySupportedChannels', () => jest.fn())
jest.mock('../ChannelToggle', () => jest.fn(() => <div>ChannelToggle</div>))
jest.mock('../../helper/ChannelBlock', () =>
    jest.fn(({ children }) => <div>{children}</div>),
)
const defaultSelfServiceChatChannel = {
    type: TicketChannel.Chat,
    value: {
        id: 'chat-1',
        name: 'Default Chat Integration',
        meta: {},
    },
}
const mockChatChannel = {
    ...defaultSelfServiceChatChannel,
    value: {
        ...defaultSelfServiceChatChannel.value,
        meta: {
            app_id: 'app-1',
        },
    },
} as unknown as SelfServiceChatChannel
const workflowConfiguration = {
    id: 'workflow-1',
    internal_id: 'internal-workflow-1',
    account_id: 1,
    is_draft: true,
    name: 'Default Workflow',
    initial_step_id: 'message-step-1',
    updated_datetime: '2024-01-01T00:00:00Z',
    steps: [],
    transitions: [],
    available_languages: ['en-US'],
} as WorkflowConfiguration
describe('ChatChannels', () => {
    beforeEach(() => {
        ;(useOnlySupportedChannels as jest.Mock).mockReturnValue([])
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                'app-1': {
                    workflows: {
                        entrypoints: [{ id: 'workflow-1', enabled: true }],
                    },
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
    })

    it('renders the ChatChannels component with ChannelBlock', () => {
        render(
            <ChatChannels
                configuration={workflowConfiguration}
                chatChannels={[mockChatChannel]}
            />,
        )

        expect(ChannelBlock).toHaveBeenCalledWith(
            expect.objectContaining({
                channelType: TicketChannel.Chat,
            }),
            expect.anything(),
        )
    })

    it('renders ChannelItem for each valid chat channel', () => {
        render(
            <ChatChannels
                configuration={workflowConfiguration}
                chatChannels={[mockChatChannel]}
            />,
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                configuration: workflowConfiguration,
                channel: mockChatChannel,
                isLoading: false,
                workflows: [{ id: 'workflow-1', enabled: true }],
            }),
            expect.anything(),
        )
    })

    it('passes correct props to ChannelToggle', () => {
        const handleChatApplicationAutomationSettingsUpdate = jest.fn()

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                'app-1': {
                    workflows: {
                        entrypoints: [{ id: 'workflow-1', enabled: true }],
                    },
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate,
        })

        render(
            <ChatChannels
                configuration={workflowConfiguration}
                chatChannels={[mockChatChannel]}
            />,
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                handleAutomationSettingUpdate: expect.any(Function),
                workflows: [{ id: 'workflow-1', enabled: true }],
                isLoading: false,
                onlySupportedChannels: [],
            }),
            expect.anything(),
        )
    })

    it('disables ChannelToggle when isLoading is true', () => {
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                'app-1': {
                    workflows: {
                        entrypoints: [{ id: 'workflow-1', enabled: true }],
                    },
                },
            },
            isUpdatePending: true,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <ChatChannels
                configuration={workflowConfiguration}
                chatChannels={[mockChatChannel]}
            />,
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            expect.anything(),
        )
    })

    it('handles multiple chat channels correctly', () => {
        const anotherChatChannel = {
            ...mockChatChannel,
            value: {
                ...mockChatChannel.value,
                meta: {
                    app_id: 'app-2',
                },
            },
        } as unknown as SelfServiceChatChannel

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                'app-1': {
                    workflows: {
                        entrypoints: [{ id: 'workflow-1', enabled: true }],
                    },
                },
                'app-2': {
                    workflows: {
                        entrypoints: [{ id: 'workflow-2', enabled: false }],
                    },
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <ChatChannels
                configuration={workflowConfiguration}
                chatChannels={[mockChatChannel, anotherChatChannel]}
            />,
        )

        expect(ChannelToggle).toHaveBeenCalledTimes(2)
        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: mockChatChannel,
                workflows: [{ id: 'workflow-1', enabled: true }],
            }),
            expect.anything(),
        )
        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: anotherChatChannel,
                workflows: [{ id: 'workflow-2', enabled: false }],
            }),
            expect.anything(),
        )
    })
})
