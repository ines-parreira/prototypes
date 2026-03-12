import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { Skeleton } from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { TicketOutcome } from 'models/aiAgentPlayground/types'
import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useEnrichFeedbackData } from '../../../../tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useEnrichFeedbackData'
import { useSettingsContext } from '../../contexts/SettingsContext'
import { useFeedbackPolling } from '../../hooks/useFeedbackPolling'
import KnowledgeSourcesWrapper from './KnowledgeSourcesWrapper'

// Mock the hooks and components
jest.mock('../../hooks/useFeedbackPolling')
jest.mock(
    '../../../../tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useEnrichFeedbackData',
)
jest.mock('@gorgias/axiom')
jest.mock('../../contexts/EventsContext', () => ({
    useSubscribeToEvent: jest.fn(),
}))
jest.mock('../../contexts/SettingsContext', () => ({
    useSettingsContext: jest.fn(),
}))

const mockUseFeedbackPolling = jest.mocked(useFeedbackPolling)
const mockUseEnrichFeedbackData = jest.mocked(useEnrichFeedbackData)
const mockUseSettingsContext = jest.mocked(useSettingsContext)
const SkeletonMock = assumeMock(Skeleton)

const mockStore = configureMockStore()
const queryClient = mockQueryClient()

const mockStoreConfiguration = {
    shopType: 'shopify',
    storeName: 'Test Store',
} as StoreConfiguration

const renderComponent = (props: {
    executionId: string
    storeConfiguration: StoreConfiguration
    outcome?: TicketOutcome
}) => {
    return render(
        <Provider store={mockStore(storeWithActiveSubscriptionWithConvert)}>
            <QueryClientProvider client={queryClient}>
                <KnowledgeSourcesWrapper {...props} />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('KnowledgeSourcesWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Mock Skeleton component to render a test-id for easy testing
        SkeletonMock.mockImplementation(() => <div data-testid="skeleton" />)

        // Mock SettingsContext to return inbound mode by default
        mockUseSettingsContext.mockReturnValue({
            mode: 'inbound',
            chatAvailability: 'online',
            selectedCustomer: null,
            resetSettings: jest.fn(),
            setSettings: jest.fn(),
        } as any)
    })

    it('should display knowledge sources when data is loaded', () => {
        const mockEnrichedData = {
            knowledgeResources: [
                {
                    executionId: 'test-execution-id',
                    resource: {
                        id: 'resource-1',
                        resourceType: 'article',
                        resourceTitle: 'Return Policy',
                        resourceId: 'set-1',
                    },
                    metadata: {
                        content:
                            'Our return policy allows returns within 30 days',
                        url: 'https://example.com/return-policy',
                        title: 'Return Policy',
                        isDeleted: false,
                    },
                },
                {
                    executionId: 'test-execution-id',
                    resource: {
                        id: 'resource-2',
                        resourceType: 'faq',
                        resourceTitle: 'Shipping Information',
                        resourceId: 'set-2',
                    },
                    metadata: {
                        content: 'We ship worldwide',
                        url: 'https://example.com/shipping',
                        title: 'Shipping Information',
                        isDeleted: false,
                    },
                },
            ],
            suggestedResources: [],
            freeForm: null,
        }

        mockUseFeedbackPolling.mockReturnValue({
            feedback: {
                accountId: 123,
                objectId: '123',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'test-execution-id',
                        feedback: [],
                        resources: [],
                        storeConfiguration: mockStoreConfiguration as any,
                    },
                ],
            },
            isPolling: false,
            stopPolling: jest.fn(),
            startPolling: jest.fn(),
        })

        mockUseEnrichFeedbackData.mockReturnValue({
            enrichedData: mockEnrichedData,
            isLoading: false,
        } as any)

        renderComponent({
            executionId: 'test-execution-id',
            storeConfiguration: mockStoreConfiguration,
            outcome: TicketOutcome.CLOSE,
        })

        expect(
            screen.getByText('AI Agent sent a response and Closed the ticket.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent used the following sources:'),
        ).toBeInTheDocument()

        expect(screen.getByText('Return Policy')).toBeInTheDocument()
        expect(screen.getByText('Shipping Information')).toBeInTheDocument()
    })

    it('should render nothing when no knowledge sources are available', () => {
        mockUseFeedbackPolling.mockReturnValue({
            feedback: {
                accountId: 123,
                objectId: '123',
                objectType: 'TICKET',
                executions: [],
            },
            isPolling: false,
            stopPolling: jest.fn(),
            startPolling: jest.fn(),
        })

        mockUseEnrichFeedbackData.mockReturnValue({
            enrichedData: {
                knowledgeResources: [],
                suggestedResources: [],
                freeForm: null,
            },
            isLoading: false,
        } as any)

        const { container } = renderComponent({
            executionId: 'test-execution-id',
            storeConfiguration: mockStoreConfiguration,
        })

        expect(container.firstChild).toBeNull()
    })

    it('should handle deleted knowledge sources', () => {
        const mockEnrichedData = {
            knowledgeResources: [
                {
                    executionId: 'test-execution-id',
                    resource: {
                        id: 'resource-1',
                        resourceType: 'article',
                        resourceTitle: 'Deleted Article',
                        resourceId: 'set-1',
                    },
                    metadata: {
                        content: 'This article has been deleted',
                        url: 'https://example.com/deleted',
                        title: 'Deleted Article',
                        isDeleted: true,
                    },
                },
            ],
        }

        mockUseFeedbackPolling.mockReturnValue({
            feedback: {
                accountId: 123,
                objectId: '123',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'test-execution-id',
                        feedback: [],
                        resources: [
                            {
                                id: 'resource-1',
                                feedback: null,
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                                resourceTitle: 'Deleted Article',
                                resourceId: 'set-1',
                                resourceLocale: 'en',
                                resourceVersion: null,
                                resourceSetId: 'set-1',
                            },
                        ],
                        storeConfiguration: mockStoreConfiguration as any,
                    },
                ],
            },
            isPolling: false,
            stopPolling: jest.fn(),
            startPolling: jest.fn(),
        })

        mockUseEnrichFeedbackData.mockReturnValue({
            enrichedData: mockEnrichedData,
            isLoading: false,
        } as any)

        renderComponent({
            executionId: 'test-execution-id',
            storeConfiguration: mockStoreConfiguration,
        })

        expect(screen.getByText('Deleted Article')).toBeInTheDocument()

        const deletedLink = screen.getByText('Deleted Article').closest('a')
        expect(deletedLink).toHaveClass('deleted')
    })

    it('should render knowledge source links with correct attributes', () => {
        const mockEnrichedData = {
            knowledgeResources: [
                {
                    resource: {
                        id: 'resource-1',
                        resourceType: 'article',
                        resourceTitle: 'Test Article',
                        resourceId: 'set-1',
                    },
                    metadata: {
                        content: 'Test content',
                        url: 'https://example.com/test',
                        title: 'Test Article',
                        isDeleted: false,
                    },
                },
            ],
        }

        mockUseFeedbackPolling.mockReturnValue({
            feedback: {
                accountId: 123,
                objectId: '123',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'test-execution-id',
                        feedback: [],
                        resources: [],
                        storeConfiguration: mockStoreConfiguration as any,
                    },
                ],
            },
            isPolling: false,
            stopPolling: jest.fn(),
            startPolling: jest.fn(),
        })

        mockUseEnrichFeedbackData.mockReturnValue({
            enrichedData: mockEnrichedData,
            isLoading: false,
        } as any)

        renderComponent({
            executionId: 'test-execution-id',
            storeConfiguration: mockStoreConfiguration,
        })

        expect(screen.getByText('Test Article')).toBeInTheDocument()

        const link = screen.getByText('Test Article').closest('a')
        expect(link).toHaveAttribute('href', 'https://example.com/test')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer noopener')
        expect(link).toHaveClass('sourceLink', 'hasLink')
    })

    it('should render open in new tab icon', () => {
        const mockEnrichedData = {
            knowledgeResources: [
                {
                    resource: {
                        id: 'resource-1',
                        resourceType: 'article',
                        resourceTitle: 'Test Article',
                        resourceId: 'set-1',
                    },
                    metadata: {
                        content: 'Test content',
                        url: 'https://example.com/test',
                        title: 'Test Article',
                        isDeleted: false,
                    },
                },
            ],
        }

        mockUseFeedbackPolling.mockReturnValue({
            feedback: {
                accountId: 123,
                objectId: '123',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'test-execution-id',
                        feedback: [],
                        resources: [],
                        storeConfiguration: mockStoreConfiguration as any,
                    },
                ],
            },
            isPolling: false,
            stopPolling: jest.fn(),
            startPolling: jest.fn(),
        })

        mockUseEnrichFeedbackData.mockReturnValue({
            enrichedData: mockEnrichedData,
            isLoading: false,
        } as any)

        renderComponent({
            executionId: 'test-execution-id',
            storeConfiguration: mockStoreConfiguration,
        })

        expect(screen.getByText('Test Article')).toBeInTheDocument()

        const openInNewTabIcon = screen.getByText('open_in_new')
        expect(openInNewTabIcon).toBeInTheDocument()
        expect(openInNewTabIcon).toHaveClass(
            'openInNewTabIcon',
            'material-icons',
        )
    })

    describe('polling behavior integration', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('should start polling when component mounts with executionId', () => {
            const startPollingMock = jest.fn()

            mockUseFeedbackPolling.mockReturnValue({
                feedback: undefined,
                isPolling: false,
                stopPolling: jest.fn(),
                startPolling: startPollingMock,
            })

            mockUseEnrichFeedbackData.mockReturnValue({
                enrichedData: {
                    knowledgeResources: [],
                    suggestedResources: [],
                    freeForm: null,
                },
                isLoading: false,
            } as any)

            renderComponent({
                executionId: 'test-execution-id',
                storeConfiguration: mockStoreConfiguration,
            })

            // The component should start polling automatically when executionId is provided
            expect(startPollingMock).toHaveBeenCalledTimes(1)
        })

        it('should handle 2-minute timeout correctly in integration', () => {
            const startPollingMock = jest.fn()
            const stopPollingMock = jest.fn()

            mockUseFeedbackPolling.mockReturnValue({
                feedback: undefined,
                isPolling: true,
                stopPolling: stopPollingMock,
                startPolling: startPollingMock,
            })

            mockUseEnrichFeedbackData.mockReturnValue({
                enrichedData: {
                    knowledgeResources: [],
                    suggestedResources: [],
                    freeForm: null,
                },
                isLoading: true,
            } as any)

            renderComponent({
                executionId: 'test-execution-id',
                storeConfiguration: mockStoreConfiguration,
            })

            // Should show loading skeleton while polling
            expect(screen.getByTestId('skeleton')).toBeInTheDocument()
        })

        it('should stop polling when feedback data is received', () => {
            const startPollingMock = jest.fn()
            const stopPollingMock = jest.fn()

            const mockFeedbackData = {
                accountId: 123,
                objectId: '123',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'test-execution-id',
                        feedback: [],
                        resources: [],
                    },
                ],
            }

            const mockEnrichedData = {
                knowledgeResources: [
                    {
                        resource: {
                            id: 'resource-1',
                            resourceType: 'article',
                            resourceTitle: 'Test Article',
                            resourceId: '1',
                        },
                        metadata: {
                            content: 'Test content',
                            url: 'https://example.com/test',
                            isDeleted: false,
                        },
                    },
                ],
                suggestedResources: [],
                freeForm: null,
            }

            // First, mock the state when polling is active but no data yet
            mockUseFeedbackPolling.mockReturnValueOnce({
                feedback: undefined,
                isPolling: true, // Initially polling
                stopPolling: stopPollingMock,
                startPolling: startPollingMock,
            })

            mockUseEnrichFeedbackData.mockReturnValueOnce({
                enrichedData: {
                    knowledgeResources: [],
                    suggestedResources: [],
                    freeForm: null,
                },
                isLoading: true,
            } as any)

            const { rerender } = renderComponent({
                executionId: 'test-execution-id',
                storeConfiguration: mockStoreConfiguration,
            })

            // Should show loading skeleton while polling
            expect(screen.getByTestId('skeleton')).toBeInTheDocument()
            expect(startPollingMock).toHaveBeenCalledTimes(1)

            // Now mock the state after data is received
            mockUseFeedbackPolling.mockReturnValue({
                feedback: mockFeedbackData as any,
                isPolling: false, // Polling stopped because data was received
                stopPolling: stopPollingMock,
                startPolling: startPollingMock,
            })

            mockUseEnrichFeedbackData.mockReturnValue({
                enrichedData: mockEnrichedData,
                isLoading: false,
            } as any)

            // Trigger re-render to simulate state change
            rerender(
                <Provider
                    store={mockStore(storeWithActiveSubscriptionWithConvert)}
                >
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeSourcesWrapper
                            executionId="test-execution-id"
                            storeConfiguration={mockStoreConfiguration}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            // Should display the knowledge sources when data is received
            expect(screen.getByText('Test Article')).toBeInTheDocument()

            // Should no longer show loading skeleton (indicates polling has stopped)
            expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
        })
    })

    describe('outbound mode', () => {
        it('should render nothing when mode is outbound', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'outbound',
                chatAvailability: 'online',
                selectedCustomer: null,
                resetSettings: jest.fn(),
                setSettings: jest.fn(),
            } as any)

            const mockEnrichedData = {
                knowledgeResources: [
                    {
                        executionId: 'test-execution-id',
                        resource: {
                            id: 'resource-1',
                            resourceType: 'article',
                            resourceTitle: 'Test Article',
                            resourceId: 'set-1',
                        },
                        metadata: {
                            content: 'Test content',
                            url: 'https://example.com/test',
                            title: 'Test Article',
                            isDeleted: false,
                        },
                    },
                ],
                suggestedResources: [],
                freeForm: null,
            }

            mockUseFeedbackPolling.mockReturnValue({
                feedback: {
                    accountId: 123,
                    objectId: '123',
                    objectType: 'TICKET',
                    executions: [
                        {
                            executionId: 'test-execution-id',
                            feedback: [],
                            resources: [],
                            storeConfiguration: mockStoreConfiguration as any,
                        },
                    ],
                },
                isPolling: false,
                stopPolling: jest.fn(),
                startPolling: jest.fn(),
            })

            mockUseEnrichFeedbackData.mockReturnValue({
                enrichedData: mockEnrichedData,
                isLoading: false,
            } as any)

            const { container } = renderComponent({
                executionId: 'test-execution-id',
                storeConfiguration: mockStoreConfiguration,
            })

            expect(container.firstChild).toBeNull()
        })
    })
})
