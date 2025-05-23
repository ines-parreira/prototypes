import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { LegacyChannelSlug } from '@gorgias/helpdesk-queries'

import useLanguagesMismatchWarnings from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ChannelToggle from '../ChannelToggle'

jest.mock('../../helper/ChannelWarning', () =>
    jest.fn(() => <div>ChannelWarning</div>),
)
jest.mock('common/segment', () => ({
    SegmentEvent: {
        AutomateChannelUpdateFromFlows: 'AutomateChannelUpdateFromFlows',
    },
    logEvent: jest.fn(),
}))

jest.mock(
    'pages/automate/workflows/hooks/useLanguagesMismatchWarnings',
    () => ({
        __esModule: true,
        default: jest.fn(() => ({
            getLanguagesMismatchWarning: () => undefined,
        })),
    }),
)

const defaultWorkflowConfiguration = {
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

const helpCenterChannel = {
    type: LegacyChannelSlug.HelpCenter,
    value: {
        id: 'HelpCenter-1',
        name: 'Default HelpCenter Integration',
        meta: {},
    },
}
const chatChannel = {
    type: LegacyChannelSlug.Chat,
    value: {
        id: 'Chat-1',
        name: 'Default Chat Integration',
        meta: {},
    },
}

const helpCenterProps = {
    channel: helpCenterChannel,
    isLoading: false,
    workflows: [{ id: 'workflow-1', enabled: true }],
    handleAutomationSettingUpdate: jest.fn(),
    onlySupportedChannels: [],
    configuration: defaultWorkflowConfiguration,
}
const chatProps = {
    channel: chatChannel,
    isLoading: false,
    workflows: [{ id: 'workflow-1', enabled: true }],
    handleAutomationSettingUpdate: jest.fn(),
    onlySupportedChannels: [],
    configuration: defaultWorkflowConfiguration,
}
const queryClient = mockQueryClient()
describe('ChannelToggle', () => {
    const renderWithQueryClient = (children: any) => {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    it('renders the component with channel warning for Help-Center', () => {
        render(
            renderWithQueryClient(
                <ChannelToggle {...(helpCenterProps as any)} />,
            ),
        )
        expect(
            screen.getByText('Default HelpCenter Integration'),
        ).toBeInTheDocument()
        expect(screen.getByText('ChannelWarning')).toBeInTheDocument()
    })
    it('renders the component with channel warning for Chat', () => {
        render(renderWithQueryClient(<ChannelToggle {...(chatProps as any)} />))
        expect(screen.getByText('Default Chat Integration')).toBeInTheDocument()
        expect(screen.getByText('ChannelWarning')).toBeInTheDocument()
    })

    it('does not render mismatch warning if getLanguagesMismatchWarning returns undefined', () => {
        ;(useLanguagesMismatchWarnings as jest.Mock).mockReturnValue({
            getLanguagesMismatchWarning: () => undefined,
        })

        render(renderWithQueryClient(<ChannelToggle {...(chatProps as any)} />))

        expect(screen.getByText('Default Chat Integration')).toBeInTheDocument()
        expect(screen.getByText('ChannelWarning')).toBeInTheDocument()
    })

    it('renders mismatch warning message when getLanguagesMismatchWarning returns an error', () => {
        const mockMessage = 'Languages do not match!'
        const mockWarning = {
            type: 'error',
            message: mockMessage,
        }

        ;(useLanguagesMismatchWarnings as jest.Mock).mockReturnValue({
            getLanguagesMismatchWarning: () => mockWarning,
        })

        const { getByText } = render(
            renderWithQueryClient(<ChannelToggle {...(chatProps as any)} />),
        )

        expect(getByText('Default Chat Integration')).toBeInTheDocument()
        expect(getByText('ChannelWarning')).toBeInTheDocument()
    })
})
