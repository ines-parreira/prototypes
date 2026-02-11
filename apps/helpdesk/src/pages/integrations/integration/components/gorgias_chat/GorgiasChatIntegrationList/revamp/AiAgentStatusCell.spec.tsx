import type React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import { AiAgentStatusCell } from './AiAgentStatusCell'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: ({
        children,
        href,
        leadingSlot,
        onClick,
    }: {
        children: React.ReactNode
        href?: string
        leadingSlot?: string
        onClick?: (e: React.MouseEvent) => void
    }) => {
        if (href) {
            return (
                <a
                    data-testid="button"
                    href={href}
                    data-icon={leadingSlot}
                    onClick={onClick}
                >
                    {children}
                </a>
            )
        }
        return (
            <button
                data-testid="button"
                data-icon={leadingSlot}
                onClick={onClick}
            >
                {children}
            </button>
        )
    },
    Tag: ({
        children,
        color,
        leadingSlot,
    }: {
        children: React.ReactNode
        color: string
        leadingSlot?: React.ReactNode
    }) => (
        <div data-testid="tag" data-color={color}>
            {leadingSlot}
            {children}
        </div>
    ),
    Icon: ({ name }: { name: string }) => (
        <span data-testid="icon" data-icon={name} />
    ),
}))

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

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Loading...')
        expect(tag).toHaveAttribute('data-color', 'grey')
    })

    it('should render loading state when AI agent access is loading', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: true,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Loading...')
        expect(tag).toHaveAttribute('data-color', 'grey')
    })

    it('should render "No store connected" tag when store integration is undefined', () => {
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('No store connected')
        expect(tag).toHaveAttribute('data-color', 'grey')
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

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('No store connected')
        expect(tag).toHaveAttribute('data-color', 'grey')
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

        const button = screen.getByTestId('button')
        expect(button).toHaveTextContent('Try AI agent')
        expect(button).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-shop',
        )
        expect(button).toHaveAttribute('data-icon', 'ai-agent-feedback')
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

        expect(screen.getByTestId('button')).toHaveTextContent('Try AI agent')
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

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Enabled')
        expect(tag).toHaveAttribute('data-color', 'green')

        const icon = screen.getByTestId('icon')
        expect(icon).toHaveAttribute('data-icon', 'check')
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

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Disabled')
        expect(tag).toHaveAttribute('data-color', 'red')

        const icon = screen.getByTestId('icon')
        expect(icon).toHaveAttribute('data-icon', 'close')
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

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Disabled')
        expect(tag).toHaveAttribute('data-color', 'red')

        const icon = screen.getByTestId('icon')
        expect(icon).toHaveAttribute('data-icon', 'close')
    })

    it('should render "Disabled" tag when store configuration is null', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: false,
        })

        render(<AiAgentStatusCell chat={mockChat} />)

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Disabled')
        expect(tag).toHaveAttribute('data-color', 'red')

        const icon = screen.getByTestId('icon')
        expect(icon).toHaveAttribute('data-icon', 'close')
    })
})
