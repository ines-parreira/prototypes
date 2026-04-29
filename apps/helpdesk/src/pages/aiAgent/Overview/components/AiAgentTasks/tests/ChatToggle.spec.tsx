import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { StoreConfiguration } from 'models/aiAgent/types'

import { decideChatWarning } from '../../PostOnboardingTasksSection/utils'
import { ChatToggle } from '../ChatToggle'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            deployChat: '/mock/deploy-chat-route',
        },
    }),
}))
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => []),
}))
jest.mock(
    '../../../hooks/pendingTasks/useFetchChatIntegrationsStatusData',
    () => ({
        useFetchChatIntegrationsStatusData: jest.fn().mockReturnValue({
            data: [],
            isLoading: false,
            isFetched: true,
        }),
    }),
)
jest.mock('../../PostOnboardingTasksSection/utils')
const decideChatWarningMock = assumeMock(decideChatWarning)
describe('ChatToggle', () => {
    const defaultStoreConfig = {
        monitoredChatIntegrations: [],
        chatChannelDeactivatedDatetime: 'some-date',
        previewModeActivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
    } as unknown as StoreConfiguration
    const defaultProps = {
        isChatChannelEnabled: false,
        isLoading: false,
        setIsChatChannelEnabled: jest.fn(),
        storeConfiguration: defaultStoreConfig,
        shopName: 'test-shop',
        shopType: 'shopify',
        onChatToggle: jest.fn(),
    }
    beforeEach(() => {
        jest.clearAllMocks()
        decideChatWarningMock.mockReturnValue({
            visible: false,
        })
    })
    it('renders the ChatToggle component correctly', () => {
        render(<ChatToggle {...defaultProps} />, {})
        expect(screen.getByText('Chat')).toBeInTheDocument()
        const toggleButton = screen.getByRole('switch')
        expect(toggleButton).toBeInTheDocument()
        expect(toggleButton).not.toBeChecked()
    })
    it('calls onChatToggle when toggle is clicked', async () => {
        const setIsChatChannelEnabled = jest.fn()
        const onChatToggle = jest.fn()
        render(
            <ChatToggle
                {...defaultProps}
                setIsChatChannelEnabled={setIsChatChannelEnabled}
                onChatToggle={onChatToggle}
            />,
            {},
        )
        const toggleButton = screen.getByRole('switch')
        await userEvent.click(toggleButton)
        expect(setIsChatChannelEnabled).toHaveBeenCalledWith(true)
        expect(onChatToggle).toHaveBeenCalledWith({
            ...defaultStoreConfig,
            chatChannelDeactivatedDatetime: null,
        })
    })
    it('shows warning when chat is disabled due to missing integrations', () => {
        decideChatWarningMock.mockReturnValue({
            visible: true,
            label: 'Connect a chat',
            to: '/mock/deploy-chat-route',
        })
        render(<ChatToggle {...defaultProps} />, {})
        expect(screen.getByText('Connect a chat')).toBeInTheDocument()
    })
    it('does not call onChatToggle when storeConfiguration is undefined', async () => {
        const setIsChatChannelEnabled = jest.fn()
        const onChatToggle = jest.fn()
        render(
            <ChatToggle
                {...defaultProps}
                storeConfiguration={undefined}
                setIsChatChannelEnabled={setIsChatChannelEnabled}
                onChatToggle={onChatToggle}
            />,
            {},
        )
        const toggleButton = screen.getByRole('switch')
        await userEvent.click(toggleButton)
        expect(setIsChatChannelEnabled).not.toHaveBeenCalled()
        expect(onChatToggle).not.toHaveBeenCalled()
    })
})
