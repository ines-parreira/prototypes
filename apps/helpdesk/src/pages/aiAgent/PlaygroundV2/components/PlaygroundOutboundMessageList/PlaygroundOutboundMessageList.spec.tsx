import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useAiJourneyMessages } from 'pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages'

import { PlaygroundOutboundMessageList } from './PlaygroundOutboundMessageList'

jest.mock('pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext', () => ({
    useConfigurationContext: jest.fn(),
}))

jest.mock('pages/aiAgent/PlaygroundV2/contexts/CoreContext', () => ({
    useCoreContext: jest.fn(),
}))

jest.mock('pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext', () => ({
    useAIJourneyContext: jest.fn(),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages', () => ({
    useAiJourneyMessages: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/SmsChannelMessagesContainer/SmsChannelMessagesContainer',
    () => ({
        SmsChannelMessagesContainer: ({
            children,
            storeName,
        }: {
            children: React.ReactNode
            storeName?: string
        }) => (
            <div data-testid="sms-container">
                {storeName && <div data-testid="store-name">{storeName}</div>}
                {children}
            </div>
        ),
    }),
)

jest.mock('assets/img/battery.svg', () => ({
    __esModule: true,
    default: 'battery-icon.svg',
}))
jest.mock('assets/img/wifi.svg', () => ({
    __esModule: true,
    default: 'wifi-icon.svg',
}))

jest.mock('./PlaygroundOutboundMessageList.less', () => ({
    messageListContainer: 'messageListContainer',
}))

const mockUseConfigurationContext = useConfigurationContext as jest.Mock
const mockUseCoreContext = useCoreContext as jest.Mock
const mockUseAIJourneyContext = useAIJourneyContext as jest.Mock
const mockUseAiJourneyMessages = useAiJourneyMessages as jest.Mock

describe('PlaygroundOutboundMessageList', () => {
    const mockTriggerMessage = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseConfigurationContext.mockReturnValue({
            shopName: 'Test Shop',
        })

        mockUseCoreContext.mockReturnValue({
            isPolling: false,
        })

        mockUseAIJourneyContext.mockReturnValue({
            followUpMessagesSent: 0,
            aiJourneySettings: {
                totalFollowUp: 3,
            },
        })

        mockUseAiJourneyMessages.mockReturnValue({
            triggerMessage: mockTriggerMessage,
            isTriggeringMessage: false,
        })
    })

    it('should render children correctly', () => {
        render(
            <PlaygroundOutboundMessageList>
                <div>Test message content</div>
            </PlaygroundOutboundMessageList>,
        )

        expect(screen.getByText('Test message content')).toBeInTheDocument()
    })

    it('should render SmsChannelMessagesContainer with shopName', () => {
        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        expect(screen.getByTestId('sms-container')).toBeInTheDocument()
        expect(screen.getByTestId('store-name')).toHaveTextContent('Test Shop')
    })

    it('should render follow-up button', () => {
        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })
        expect(button).toBeInTheDocument()
    })

    it('should call triggerMessage when follow-up button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })

        await act(() => user.click(button))

        expect(mockTriggerMessage).toHaveBeenCalledTimes(1)
    })

    it('should disable button when isPolling is true', () => {
        mockUseCoreContext.mockReturnValue({
            isPolling: true,
        })

        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })
        expect(button).toBeDisabled()
    })

    it('should disable button when follow-up limit is reached', () => {
        mockUseAIJourneyContext.mockReturnValue({
            followUpMessagesSent: 3,
            aiJourneySettings: {
                totalFollowUp: 3,
            },
        })

        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })
        expect(button).toBeDisabled()
    })

    it('should enable button when follow-up limit is not reached', () => {
        mockUseAIJourneyContext.mockReturnValue({
            followUpMessagesSent: 2,
            aiJourneySettings: {
                totalFollowUp: 3,
            },
        })

        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })
        expect(button).not.toBeDisabled()
    })

    it('should show loading state when isTriggeringMessage is true', () => {
        mockUseAiJourneyMessages.mockReturnValue({
            triggerMessage: mockTriggerMessage,
            isTriggeringMessage: true,
        })

        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })
        expect(button).toBeInTheDocument()
    })

    it('should not show loading state when isTriggeringMessage is false', () => {
        render(
            <PlaygroundOutboundMessageList>
                <div>Content</div>
            </PlaygroundOutboundMessageList>,
        )

        const button = screen.getByRole('button', {
            name: /view follow-up message/i,
        })
        expect(button).toBeInTheDocument()
    })

    describe('tooltip behavior', () => {
        it('should not render tooltip when follow-up limit is not reached', () => {
            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 1,
                aiJourneySettings: {
                    totalFollowUp: 3,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            expect(
                screen.queryByText(/configured follow up limit reached/i),
            ).not.toBeInTheDocument()
        })

        it('should render tooltip when follow-up limit is reached', async () => {
            const user = userEvent.setup()

            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 3,
                aiJourneySettings: {
                    totalFollowUp: 3,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            const button = screen.getByRole('button', {
                name: /view follow-up message/i,
            })

            await act(() => user.hover(button))

            expect(
                await screen.findByText(/configured follow up limit reached/i),
            ).toBeInTheDocument()
        })

        it('should toggle tooltip on click when limit is reached', async () => {
            const user = userEvent.setup()

            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 3,
                aiJourneySettings: {
                    totalFollowUp: 3,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            const button = screen.getByRole('button', {
                name: /view follow-up message/i,
            })

            await act(() => user.click(button))

            const tooltip = await screen.findByText(
                /configured follow up limit reached/i,
            )
            expect(tooltip).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle followUpMessagesSent equal to totalFollowUp', () => {
            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 5,
                aiJourneySettings: {
                    totalFollowUp: 5,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            const button = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(button).toBeDisabled()
        })

        it('should handle followUpMessagesSent exceeding totalFollowUp', () => {
            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 6,
                aiJourneySettings: {
                    totalFollowUp: 5,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            const button = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(button).toBeDisabled()
        })

        it('should handle zero follow-up messages sent', () => {
            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 0,
                aiJourneySettings: {
                    totalFollowUp: 3,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            const button = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(button).not.toBeDisabled()
        })

        it('should handle multiple children', () => {
            render(
                <PlaygroundOutboundMessageList>
                    <div>First message</div>
                    <div>Second message</div>
                    <div>Third message</div>
                </PlaygroundOutboundMessageList>,
            )

            expect(screen.getByText('First message')).toBeInTheDocument()
            expect(screen.getByText('Second message')).toBeInTheDocument()
            expect(screen.getByText('Third message')).toBeInTheDocument()
        })

        it('should disable button when both isPolling is true and follow-up limit is reached', () => {
            mockUseCoreContext.mockReturnValue({
                isPolling: true,
            })

            mockUseAIJourneyContext.mockReturnValue({
                followUpMessagesSent: 3,
                aiJourneySettings: {
                    totalFollowUp: 3,
                },
            })

            render(
                <PlaygroundOutboundMessageList>
                    <div>Content</div>
                </PlaygroundOutboundMessageList>,
            )

            const button = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(button).toBeDisabled()
        })
    })
})
