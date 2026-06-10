import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { Map } from 'immutable'

import { AiAgentStatusCell } from './AiAgentStatusCell'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

const mockUseAiAgentAccess = jest.requireMock('hooks/aiAgent/useAiAgentAccess')
    .useAiAgentAccess as jest.MockedFunction<any>
const mockUseAppSelector = jest.requireMock('hooks/useAppSelector')
    .default as jest.MockedFunction<any>
const mockUseStoreConfiguration = jest.requireMock(
    'pages/aiAgent/hooks/useStoreConfiguration',
).useStoreConfiguration as jest.MockedFunction<any>
const mockUseStoreIntegration = jest.requireMock(
    'pages/integrations/integration/hooks/useStoreIntegration',
).useStoreIntegration as jest.MockedFunction<any>

describe('AiAgentStatusCell', () => {
    const mockChat = Map({
        id: 123,
        name: 'Test Chat',
    })

    const mockCurrentAccount = Map({
        domain: 'test-account',
    })

    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(mockCurrentAccount)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: false,
        })
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: {
                id: 456,
                name: 'test-shop',
                type: 'shopify',
            },
            isConnected: true,
            isConnectedToShopify: true,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render loading state when store configuration is loading', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render loading state when AI agent access is loading', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: true,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render "No store connected" tag when store integration is undefined', () => {
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('No store connected')).toBeInTheDocument()
    })

    it('should render "No store connected" tag when store is not connected', () => {
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: {
                id: 456,
                name: 'test-shop',
                type: 'shopify',
            },
            isConnected: false,
            isConnectedToShopify: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('No store connected')).toBeInTheDocument()
    })

    it('should render "Try AI agent" button when user has no subscription access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: {
                id: 456,
                name: 'test-shop',
                type: 'shopify',
            },
            isConnected: true,
            isConnectedToShopify: true,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        const link = screen.getByRole('link', { name: /Try AI agent/ })
        expect(link).toHaveAttribute('href', '/app/ai-agent/shopify/test-shop')
        expect(
            screen.getByRole('img', { name: 'ai-agent-feedback' }),
        ).toBeInTheDocument()
    })

    it('should render "Try AI agent" button when shop name is missing', () => {
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: {
                id: 456,
                type: 'shopify',
            },
            isConnected: true,
            isConnectedToShopify: true,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(
            screen.getByRole('link', { name: /Try AI agent/ }),
        ).toBeInTheDocument()
    })

    it('should render "Enabled" tag when AI agent is enabled', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                monitoredChatIntegrations: [123],
                chatChannelDeactivatedDatetime: null,
            },
            isLoading: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('Enabled')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'check' })).toBeInTheDocument()
    })

    it('should render "Disabled" tag when chat is not in monitored integrations', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                monitoredChatIntegrations: [456],
                chatChannelDeactivatedDatetime: null,
            },
            isLoading: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('Disabled')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'close' })).toBeInTheDocument()
    })

    it('should render "Disabled" tag when chat channel is deactivated', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                monitoredChatIntegrations: [123],
                chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            },
            isLoading: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('Disabled')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'close' })).toBeInTheDocument()
    })

    it('should render "Disabled" tag when store configuration is null', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        expect(screen.getByText('Disabled')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'close' })).toBeInTheDocument()
    })
})
