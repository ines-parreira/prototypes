import type React from 'react'

import { render, userEvent } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import type { AxiosError } from 'axios'
import { useLocation } from 'react-router-dom'

import { isGorgiasApiError } from 'models/api/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { AiAgentStoreConfigurationContextType } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { hasShopifyRequiredPermissions } from 'pages/aiAgent/utils/shopify-integration.utils'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentConfigurationView } from './AiAgentConfigurationView'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('models/api/types', () => ({
    isGorgiasApiError: jest.fn(),
}))
jest.mock('models/helpCenter/queries')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/aiAgent/utils/shopify-integration.utils', () => ({
    hasShopifyRequiredPermissions: jest.fn(),
}))
jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({
        children,
        title,
    }: {
        children: React.ReactNode
        title: string
    }) => (
        <div data-testid="ai-agent-layout" data-title={title}>
            {children}
        </div>
    ),
}))
jest.mock('pages/aiAgent/components/StoreConfigForm/StoreConfigForm', () => ({
    StoreConfigForm: () => (
        <div data-testid="store-config-form">Store Config Form</div>
    ),
}))
jest.mock('pages/aiAgent/providers/AiAgentFormChangesProvider', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))
const mockUseGetHelpCenterList = jest.mocked(useGetHelpCenterList)
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)
const mockUseShopifyIntegrationAndScope = jest.mocked(
    useShopifyIntegrationAndScope,
)
const mockHasShopifyRequiredPermissions = jest.mocked(
    hasShopifyRequiredPermissions,
)
const mockIsGorgiasApiError = jest.mocked(isGorgiasApiError)
const defaultProps = {
    shopName: 'test-shop',
    shopType: 'shopify',
    accountDomain: 'test-account.gorgias.com',
}
const mockIntegration: ShopifyIntegration = {
    id: 123,
    name: 'Test Shop',
    type: IntegrationType.Shopify,
    meta: {
        oauth: {
            scope: 'read_products,write_products,read_orders',
            status: 'success',
            error: '',
        },
        shop_name: 'test-shop',
        webhooks: [],
    },
    created_datetime: '2024-01-01T00:00:00Z',
    deactivated_datetime: null,
    decoration: null,
    deleted_datetime: null,
    description: null,
    locked_datetime: null,
    updated_datetime: '2024-01-01T00:00:00Z',
    uri: '/api/integrations/123/',
    user: { id: 1 },
    managed: false,
}
const mockHelpCenterData = {
    data: [
        { id: 1, name: 'Help Center 1', shop_name: 'test-shop' },
        { id: 2, name: 'Help Center 2', shop_name: null },
    ],
}

const LocationPath = () => {
    const location = useLocation()

    return <div>{location.pathname}</div>
}

describe('AiAgentConfigurationView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDispatch.mockClear()
        const mockContextValue: AiAgentStoreConfigurationContextType = {
            isLoading: false,
            storeConfiguration: undefined,
            createStoreConfiguration: jest.fn(),
            updateStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        }
        mockUseAiAgentStoreConfigurationContext.mockReturnValue(
            mockContextValue,
        )
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integrationId: mockIntegration.id,
            integration: mockIntegration,
            needScopeUpdate: false,
        })
        mockHasShopifyRequiredPermissions.mockReturnValue(true)
        mockIsGorgiasApiError.mockReturnValue(false)
    })
    describe('when loading data', () => {
        it('should display loading spinner while fetching help centers', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: false,
                storeConfiguration: undefined,
                createStoreConfiguration: jest.fn(),
                updateStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(screen.getByLabelText('loading')).toBeInTheDocument()
        })
        it('should display loading spinner while store config is loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: true,
                storeConfiguration: undefined,
                createStoreConfiguration: jest.fn(),
                updateStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })
            mockUseGetHelpCenterList.mockReturnValue({
                data: mockHelpCenterData,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(screen.getByLabelText('loading')).toBeInTheDocument()
        })
    })
    describe('when integration is missing', () => {
        it('should redirect to automation page when integration is not found', () => {
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: null,
                integrationId: null,
                needScopeUpdate: false,
            })
            mockUseGetHelpCenterList.mockReturnValue({
                data: mockHelpCenterData,
            } as any)
            render(
                <>
                    <AiAgentConfigurationView {...defaultProps} />
                    <LocationPath />
                </>,
                {
                    path: '/app/automation',
                    initialEntries: [
                        '/app/automation/shopify/test-shop/ai-agent/settings',
                    ],
                },
            )
            expect(screen.getByText('/app/automation')).toBeInTheDocument()
        })
    })
    describe('when query encounters an error', () => {
        it('should display error banner with retry button for non-403 errors', () => {
            const mockRefetch = jest.fn()
            const mockError: AxiosError = {
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Internal server error occurred',
                        },
                    },
                },
            } as AxiosError
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
                isError: true,
                error: mockError,
                refetch: mockRefetch,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(
                screen.getByText(/Failed to load resources/i),
            ).toBeInTheDocument()
            expect(document.body).toHaveTextContent(
                'There was an error while trying to fetch help centers. Please try again later.',
            )
            expect(
                screen.getByRole('button', { name: /retry/i }),
            ).toBeInTheDocument()
        })
        it('should display error banner without retry button for 403 errors', () => {
            const mockRefetch = jest.fn()
            const mockError: AxiosError = {
                response: {
                    status: 403,
                    data: {
                        error: {
                            msg: 'You do not have permission to access this resource',
                        },
                    },
                },
            } as AxiosError
            mockIsGorgiasApiError.mockReturnValue(true)
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
                isError: true,
                error: mockError,
                refetch: mockRefetch,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(
                screen.getByText(/Failed to load resources/i),
            ).toBeInTheDocument()
            expect(document.body).toHaveTextContent(
                'You do not have permission to access this resource',
            )
            expect(
                screen.queryByRole('button', { name: /retry/i }),
            ).not.toBeInTheDocument()
        })
        it('should call refetch when retry button is clicked', async () => {
            const mockRefetch = jest.fn()
            const mockError: AxiosError = {
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Server error',
                        },
                    },
                },
            } as AxiosError
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
                isError: true,
                error: mockError,
                refetch: mockRefetch,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            const retryButton = screen.getByRole('button', { name: /retry/i })
            await act(async () => {
                await userEvent.click(retryButton)
            })
            expect(mockRefetch).toHaveBeenCalledTimes(1)
        })
        it('should display fallback error message for non-Gorgias API errors', () => {
            const mockRefetch = jest.fn()
            const mockError = new Error('Network error') as AxiosError
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
                isError: true,
                error: mockError,
                refetch: mockRefetch,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(
                screen.getByText(
                    'There was an error while trying to fetch help centers. Please try again later.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /retry/i }),
            ).toBeInTheDocument()
        })
    })
    describe('when data is successfully loaded', () => {
        it('should render the store config form with help centers data', () => {
            mockUseGetHelpCenterList.mockReturnValue({
                data: mockHelpCenterData,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(screen.getByTestId('store-config-form')).toBeInTheDocument()
        })
        it('should display correct title based on section prop', () => {
            mockUseGetHelpCenterList.mockReturnValue({
                data: mockHelpCenterData,
            } as any)
            const { rerender } = render(
                <AiAgentConfigurationView {...defaultProps} section="chat" />,
                {
                    path: '/app/automation',
                    initialEntries: [
                        '/app/automation/shopify/test-shop/ai-agent/settings',
                    ],
                },
            )
            expect(screen.getByTestId('ai-agent-layout')).toHaveAttribute(
                'data-title',
                'Chat',
            )
            rerender(
                <AiAgentConfigurationView {...defaultProps} section="email" />,
            )
            expect(screen.getByTestId('ai-agent-layout')).toHaveAttribute(
                'data-title',
                'Email',
            )
            rerender(
                <AiAgentConfigurationView {...defaultProps} section="sms" />,
            )
            expect(screen.getByTestId('ai-agent-layout')).toHaveAttribute(
                'data-title',
                'SMS',
            )
        })
        it('should filter help centers by shop name and null shop names', () => {
            const mockHelpCenterDataWithMultipleShops = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Help Center 1',
                            shop_name: 'test-shop',
                        },
                        { id: 2, name: 'Help Center 2', shop_name: null },
                        {
                            id: 3,
                            name: 'Help Center 3',
                            shop_name: 'other-shop',
                        },
                    ],
                },
            }
            mockUseGetHelpCenterList.mockReturnValue({
                data: mockHelpCenterDataWithMultipleShops,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(screen.getByTestId('store-config-form')).toBeInTheDocument()
        })
    })
    describe('when Shopify permissions are missing', () => {
        it('should display warning banner about missing Shopify permissions', () => {
            const integrationWithoutPermissions = {
                ...mockIntegration,
                scopes: [],
            }
            mockUseShopifyIntegrationAndScope.mockReturnValue({
                integration: integrationWithoutPermissions,
                integrationId: integrationWithoutPermissions.id,
                needScopeUpdate: false,
            })
            mockHasShopifyRequiredPermissions.mockReturnValue(false)
            mockUseGetHelpCenterList.mockReturnValue({
                data: mockHelpCenterData,
            } as any)
            render(<AiAgentConfigurationView {...defaultProps} />, {
                path: '/app/automation',
                initialEntries: [
                    '/app/automation/shopify/test-shop/ai-agent/settings',
                ],
            })
            expect(
                screen.getByText(/Update your Shopify permissions/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /to allow AI Agent access to order fulfillment knowledge/i,
                ),
            ).toBeInTheDocument()
        })
    })
})
