import type React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import { IntegrationType } from 'models/integration/constants'

import { AiAgentStatusCell } from './AiAgentStatusCell'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: ({
        children,
        href,
        leadingSlot,
    }: {
        children: React.ReactNode
        href: string
        leadingSlot: string
    }) => (
        <a data-testid="button" href={href} data-icon={leadingSlot}>
            {children}
        </a>
    ),
    Tag: ({
        children,
        color,
        leadingSlot,
    }: {
        children: React.ReactNode
        color: string
        leadingSlot?: string
    }) => (
        <div data-testid="tag" data-color={color} data-icon={leadingSlot}>
            {children}
        </div>
    ),
}))

const mockUseAiAgentAccess = jest.requireMock('hooks/aiAgent/useAiAgentAccess')
    .useAiAgentAccess as jest.MockedFunction<any>
const mockUseAppSelector = jest.requireMock('hooks/useAppSelector')
    .default as jest.MockedFunction<any>
const mockUseStoreConfiguration = jest.requireMock(
    'pages/aiAgent/hooks/useStoreConfiguration',
).useStoreConfiguration as jest.MockedFunction<any>

describe('AiAgentStatusCell', () => {
    const mockChat = Map({
        id: 123,
        name: 'Test Chat',
    })

    const mockStoreIntegration = Map({
        type: IntegrationType.Shopify,
        meta: Map({
            shop_name: 'test-shop',
        }),
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
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render loading state when store configuration is loading', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Loading...')
        expect(tag).toHaveAttribute('data-color', 'grey')
    })

    it('should render loading state when AI agent access is loading', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: true,
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Loading...')
        expect(tag).toHaveAttribute('data-color', 'grey')
    })

    it('should render "No Store" when store integration is undefined', () => {
        render(
            <AiAgentStatusCell chat={mockChat} storeIntegration={undefined} />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('No Store')
        expect(tag).toHaveAttribute('data-color', 'grey')
    })

    it('should render "Try AI agent" button when user has no subscription access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const button = screen.getByTestId('button')
        expect(button).toHaveTextContent('Try AI agent')
        expect(button).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-shop',
        )
        expect(button).toHaveAttribute('data-icon', 'ai-agent-feedback')
    })

    it('should render "Try AI agent" button when shop name is missing', () => {
        const storeWithoutShopName = Map({
            type: IntegrationType.Shopify,
            meta: Map({}),
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={storeWithoutShopName}
            />,
        )

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

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Enabled')
        expect(tag).toHaveAttribute('data-color', 'green')
        expect(tag).toHaveAttribute('data-icon', 'check')
    })

    it('should render "Disabled" tag when chat is not in monitored integrations', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                monitoredChatIntegrations: [456],
                chatChannelDeactivatedDatetime: null,
            },
            isLoading: false,
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Disabled')
        expect(tag).toHaveAttribute('data-color', 'red')
        expect(tag).toHaveAttribute('data-icon', 'close')
    })

    it('should render "Disabled" tag when chat channel is deactivated', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                monitoredChatIntegrations: [123],
                chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            },
            isLoading: false,
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Disabled')
        expect(tag).toHaveAttribute('data-color', 'red')
        expect(tag).toHaveAttribute('data-icon', 'close')
    })

    it('should render "Disabled" tag when store configuration is null', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: null,
            isLoading: false,
        })

        render(
            <AiAgentStatusCell
                chat={mockChat}
                storeIntegration={mockStoreIntegration}
            />,
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toHaveTextContent('Disabled')
        expect(tag).toHaveAttribute('data-color', 'red')
        expect(tag).toHaveAttribute('data-icon', 'close')
    })
})
