import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { AiAgentPlayground } from '../AiAgentPlayground'
import { usePlaygroundPrerequisites } from '../hooks/usePlaygroundPrerequisites'
import { usePlaygroundResources } from '../hooks/usePlaygroundResources'
import { usePlaygroundTracking } from '../hooks/usePlaygroundTracking'
import { useShopNameResolution } from '../hooks/useShopNameResolution'
import type { SupportedPlaygroundModes } from '../types'

const mockUseMessagesContext = jest.fn(() => ({
    messages: [],
}))

jest.mock('../contexts/MessagesContext', () => ({
    useMessagesContext: () => mockUseMessagesContext(),
}))

const mockUseSettingsContext = jest.fn(() => ({
    mode: 'inbound',
}))

jest.mock('../contexts/SettingsContext', () => ({
    useSettingsContext: () => mockUseSettingsContext(),
}))

jest.mock('../contexts/PlaygroundContext', () => ({
    PlaygroundProvider: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../contexts/CoreContext', () => ({
    useCoreContext: jest.fn(() => ({
        testSessionId: null,
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
        testSessionLogs: undefined,
        isPolling: false,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
        channel: 'email',
        channelAvailability: { available: true },
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
        setAreActionsEnabled: jest.fn(),
        areActionsEnabled: false,
        resetToDefaultChannel: jest.fn(),
        resetToDefaultActionsEnabled: jest.fn(),
    })),
    CoreProvider: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../contexts/AIJourneyContext', () => ({
    useAIJourneyContext: jest.fn(() => ({
        shopifyIntegration: undefined,
        journeys: [],
        shopName: 'test-store',
        isLoadingJourneys: false,
        aiJourneySettings: {
            journeyType: 'cart_abandoned',
            selectedProduct: null,
            totalFollowUp: 1,
            includeProductImage: true,
            includeDiscountCode: true,
            discountCodeValue: 10,
            discountCodeMessageIdx: 1,
            outboundMessageInstructions: '',
        },
        setAIJourneySettings: jest.fn(),
        resetAIJourneySettings: jest.fn(),
        saveAIJourneySettings: jest.fn(),
        isLoadingJourneyData: false,
        isSavingJourneyData: false,
        followUpMessagesSent: 0,
        setFollowUpMessagesSent: jest.fn(),
        currentJourney: undefined,
        journeyConfiguration: undefined,
        productList: [],
        isLoadingProducts: false,
    })),
    AIJourneyProvider: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../contexts/ConfigurationContext', () => ({
    useConfigurationContext: jest.fn(() => ({
        storeConfiguration: {
            storeName: 'test-store',
            guidanceHelpCenterId: 123,
            helpCenterId: 456,
            monitoredChatIntegrations: [789],
        },
        accountConfiguration: {
            gorgiasDomain: 'test-domain',
            accountId: 123,
            httpIntegration: { id: 456 },
        },
        snippetHelpCenterId: 789,
        httpIntegrationId: 456,
        baseUrl: 'https://test-base-url.com',
        gorgiasDomain: 'test-domain',
        accountId: 123,
        chatIntegrationId: 789,
        shopName: 'test-store',
    })),
    ConfigurationProvider: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../contexts/EventsContext', () => ({
    useEvents: jest.fn(() => ({
        on: jest.fn(() => jest.fn()),
        emit: jest.fn(),
    })),
    useSubscribeToEvent: jest.fn(),
}))

jest.mock('../hooks/usePlaygroundPrerequisites')
jest.mock('../hooks/usePlaygroundResources')
jest.mock('../hooks/usePlaygroundTracking')
jest.mock('../hooks/useShopNameResolution')

jest.mock('../hooks/useAiJourneyMessages', () => ({
    useAiJourneyMessages: jest.fn(() => ({
        triggerMessage: jest.fn(),
        isTriggeringMessage: false,
    })),
}))

jest.mock(
    '../components/PlaygroundInputSection/PlaygroundInputSection',
    () => ({
        PlaygroundInputSection: () => <div>PlaygroundInputSection</div>,
    }),
)

jest.mock('../components/PlaygroundSettings/PlaygroundSettings', () => ({
    PlaygroundSettings: ({ onClose, withFooter, withModesSwitcher }: any) => (
        <div data-testid="playground-settings">
            <button onClick={onClose} data-testid="settings-close-button">
                Close Settings
            </button>
            <span data-testid="with-footer">{String(withFooter)}</span>
            <span data-testid="with-modes-switcher">
                {String(withModesSwitcher)}
            </span>
        </div>
    ),
}))

jest.mock(
    '../components/PlaygroundMissingKnowledgeAlert/PlaygroundMissingKnowledgeAlert',
    () => ({
        PlaygroundMissingKnowledgeAlert: ({ shopName }: any) => (
            <div>Missing knowledge alert for {shopName}</div>
        ),
    }),
)

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        get: jest.fn((key: string) => {
            if (key === 'domain') return 'test-domain'
            return null
        }),
    })),
}))

const mockWarpToCollapsibleColumn = jest.fn((children) => (
    <div data-testid="collapsible-column">{children}</div>
))
const mockSetCollapsibleColumnChildren = jest.fn()

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(() => ({
        warpToCollapsibleColumn: mockWarpToCollapsibleColumn,
        setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
    })),
}))

const mockUsePlaygroundPrerequisites = jest.mocked(usePlaygroundPrerequisites)
const mockUsePlaygroundResources = jest.mocked(usePlaygroundResources)
const mockUsePlaygroundTracking = jest.mocked(usePlaygroundTracking)
const mockUseShopNameResolution = jest.mocked(useShopNameResolution)

const mockStore = configureMockStore([thunk])

const defaultPlaygroundPrerequisites = {
    hasPrerequisites: true,
    isCheckingPrerequisites: false,
    missingKnowledgeSource: false,
}

const defaultPlaygroundResources = {
    storeConfiguration: getStoreConfigurationFixture({
        storeName: 'test-store',
        guidanceHelpCenterId: 123,
        helpCenterId: 456,
        monitoredChatIntegrations: [789],
    }),
    accountConfiguration: {
        gorgiasDomain: 'test-domain',
        accountId: 123,
        httpIntegration: { id: 456 },
        customFieldIds: [],
    },
    snippetHelpCenterId: 789,
    isLoading: false,
    error: undefined,
    storeConfigurationNotInitialized: false,
}

const mockQueryClient = {
    defaultQueryOptions: jest.fn(() => ({})),
    mount: jest.fn(),
    unmount: jest.fn(),
    isFetching: jest.fn(() => 0),
    isMutating: jest.fn(() => 0),
    getQueryData: jest.fn(),
    ensureQueryData: jest.fn(),
    getQueriesData: jest.fn(() => []),
    setQueryData: jest.fn(),
    setQueriesData: jest.fn(),
    getQueryState: jest.fn(),
    removeQueries: jest.fn(),
    resetQueries: jest.fn(),
    cancelQueries: jest.fn(),
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    fetchQuery: jest.fn(),
    prefetchQuery: jest.fn(),
    fetchInfiniteQuery: jest.fn(),
    prefetchInfiniteQuery: jest.fn(),
    resumePausedMutations: jest.fn(),
    getQueryCache: jest.fn(),
    getMutationCache: jest.fn(),
    getDefaultOptions: jest.fn(() => ({})),
    setDefaultOptions: jest.fn(),
    clear: jest.fn(),
} as any

describe('AiAgentPlayground', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockWarpToCollapsibleColumn.mockClear()
        mockSetCollapsibleColumnChildren.mockClear()
        mockUseShopNameResolution.mockReturnValue({
            resolvedShopName: 'test-store',
        } as any)
        mockUsePlaygroundResources.mockReturnValue(
            defaultPlaygroundResources as any,
        )
        mockUsePlaygroundPrerequisites.mockReturnValue(
            defaultPlaygroundPrerequisites,
        )
        mockUsePlaygroundTracking.mockReturnValue({
            onTestPageViewed: jest.fn(),
        } as any)
        mockUseSettingsContext.mockReturnValue({
            mode: 'inbound',
        })
    })

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={mockQueryClient}>
                    <AiAgentPlayground {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    describe('Loading states', () => {
        it('should show loading spinner when resources are loading', () => {
            mockUsePlaygroundResources.mockReturnValue({
                ...defaultPlaygroundResources,
                isLoading: true,
            } as any)

            renderComponent()

            expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('should show loading spinner when checking prerequisites', () => {
            mockUsePlaygroundPrerequisites.mockReturnValue({
                ...defaultPlaygroundPrerequisites,
                isCheckingPrerequisites: true,
            })

            renderComponent()

            expect(screen.getByRole('status')).toBeInTheDocument()
        })
    })

    describe('Missing knowledge alert', () => {
        it('should show missing knowledge alert when no account configuration', () => {
            mockUsePlaygroundResources.mockReturnValue({
                ...defaultPlaygroundResources,
                accountConfiguration: undefined,
            } as any)

            renderComponent()

            expect(
                screen.getByText(/Missing knowledge alert for test-store/),
            ).toBeInTheDocument()
        })

        it('should show missing knowledge alert when knowledge source is missing', () => {
            mockUsePlaygroundPrerequisites.mockReturnValue({
                ...defaultPlaygroundPrerequisites,
                missingKnowledgeSource: true,
            })

            renderComponent()

            expect(
                screen.getByText(/Missing knowledge alert for test-store/),
            ).toBeInTheDocument()
        })
    })

    describe('Playground rendering', () => {
        it('should render playground when all prerequisites are met', () => {
            renderComponent()

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should not render when store configuration is not initialized', () => {
            mockUsePlaygroundResources.mockReturnValue({
                ...defaultPlaygroundResources,
                storeConfigurationNotInitialized: true,
            } as any)

            const { container } = renderComponent()

            expect(
                screen.queryByText('PlaygroundMessageList'),
            ).not.toBeInTheDocument()
            expect(container).toBeEmptyDOMElement()
        })

        it('should not render when store configuration is missing', () => {
            mockUsePlaygroundResources.mockReturnValue({
                ...defaultPlaygroundResources,
                storeConfiguration: undefined,
            })

            const { container } = renderComponent()

            expect(
                screen.queryByText('PlaygroundMessageList'),
            ).not.toBeInTheDocument()
            expect(container).toBeEmptyDOMElement()
        })

        it('should not render when prerequisites are not met', () => {
            mockUsePlaygroundPrerequisites.mockReturnValue({
                ...defaultPlaygroundPrerequisites,
                hasPrerequisites: false,
            })

            const { container } = renderComponent()

            expect(
                screen.queryByText('PlaygroundMessageList'),
            ).not.toBeInTheDocument()
            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('Props handling', () => {
        it('should pass withResetButton prop to PlaygroundInputSection', () => {
            renderComponent({ withResetButton: false })

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should use shop name from props when provided', () => {
            renderComponent({ shopName: 'custom-shop' })

            mockUseShopNameResolution.mockReturnValue({
                resolvedShopName: 'custom-shop',
            } as any)

            expect(mockUseShopNameResolution).toHaveBeenCalledWith(
                'custom-shop',
            )
        })

        it('should handle arePlaygroundActionsAllowed prop', () => {
            renderComponent({ arePlaygroundActionsAllowed: true })

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })
    })

    describe('Tracking', () => {
        it('should call onTestPageViewed on mount', () => {
            const mockOnTestPageViewed = jest.fn()
            mockUsePlaygroundTracking.mockReturnValue({
                onTestPageViewed: mockOnTestPageViewed,
            } as any)

            renderComponent()

            expect(mockOnTestPageViewed).toHaveBeenCalledTimes(1)
        })
    })

    describe('Reset event emitter', () => {
        it('should emit reset event when arePlaygroundActionsAllowed changes', async () => {
            const { rerender } = renderComponent({
                arePlaygroundActionsAllowed: true,
            })

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground
                            arePlaygroundActionsAllowed={false}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            // Just checking it doesn't crash - events are mocked
            await waitFor(() => {
                expect(
                    screen.getByText('PlaygroundInputSection'),
                ).toBeInTheDocument()
            })
        })

        it('should call resetPlaygroundCallback when resetPlayground is true', async () => {
            const mockResetCallback = jest.fn()

            renderComponent({
                resetPlayground: true,
                resetPlaygroundCallback: mockResetCallback,
            })

            await waitFor(() => {
                expect(mockResetCallback).toHaveBeenCalled()
            })
        })
    })

    describe('Settings on side panel', () => {
        it('should render settings in collapsible column when withSettingsOnSidePanel is true', () => {
            renderComponent({ withSettingsOnSidePanel: true })

            expect(screen.getByTestId('collapsible-column')).toBeInTheDocument()
            expect(
                screen.getByTestId('playground-settings'),
            ).toBeInTheDocument()
            expect(mockWarpToCollapsibleColumn).toHaveBeenCalled()
        })

        it('should clear collapsible column children when withSettingsOnSidePanel is true', () => {
            renderComponent({ withSettingsOnSidePanel: true })

            expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(null)
        })
    })

    describe('Inplace Settings functionality', () => {
        it('should toggle between settings and playground views', () => {
            renderComponent({ inplaceSettingsOpen: true })

            expect(
                screen.getByTestId('playground-settings'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('PlaygroundMessageList'),
            ).not.toBeInTheDocument()
        })

        it('should pass correct props based on supportedModes', () => {
            renderComponent({
                inplaceSettingsOpen: true,
                supportedModes: ['inbound'],
            })

            expect(screen.getByTestId('with-footer')).toHaveTextContent('false')
            expect(screen.getByTestId('with-modes-switcher')).toHaveTextContent(
                'false',
            )
        })

        it('should enable modes switcher with multiple supported modes', () => {
            renderComponent({
                inplaceSettingsOpen: true,
                supportedModes: ['inbound', 'outbound'],
            })

            expect(screen.getByTestId('with-modes-switcher')).toHaveTextContent(
                'true',
            )
        })

        it('should call onInplaceSettingsOpenChange when closed', async () => {
            const mockOnClose = jest.fn()
            renderComponent({
                inplaceSettingsOpen: true,
                onInplaceSettingsOpenChange: mockOnClose,
            })

            screen.getByTestId('settings-close-button').click()

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalledWith(false)
            })
        })
    })

    describe('Conditional input section rendering', () => {
        beforeEach(() => {
            mockUseMessagesContext.mockReturnValue({
                messages: [],
            })
        })

        it('should render input section in inbound mode with no messages', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'inbound',
            })

            renderComponent()

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should not render input section in outbound mode with no messages', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'outbound',
            })

            renderComponent()

            expect(
                screen.queryByText('PlaygroundInputSection'),
            ).not.toBeInTheDocument()
        })

        it('should render input section in outbound mode with messages', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'outbound',
            })
            mockUseMessagesContext.mockReturnValue({
                messages: [
                    {
                        id: '1',
                        type: 'MESSAGE',
                        content: 'Test message',
                        sender: 'user',
                    },
                ] as any,
            })

            renderComponent()

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })
    })

    describe('Prop stabilization', () => {
        it('should stabilize draftKnowledge prop when values remain the same', () => {
            const draftKnowledge1 = {
                sourceId: 123,
                sourceSetId: 456,
            }
            const draftKnowledge2 = {
                sourceId: 123,
                sourceSetId: 456,
            }

            let capturedProps: any = null
            const PlaygroundProviderMock = jest
                .fn()
                .mockImplementation(({ children, ...props }) => {
                    capturedProps = props
                    return <div>{children}</div>
                })

            jest.spyOn(
                require('../contexts/PlaygroundContext'),
                'PlaygroundProvider',
            ).mockImplementation(PlaygroundProviderMock)

            const { rerender } = renderComponent({
                draftKnowledge: draftKnowledge1,
            })

            const firstCapturedDraftKnowledge = capturedProps?.draftKnowledge

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground draftKnowledge={draftKnowledge2} />
                    </QueryClientProvider>
                </Provider>,
            )

            const secondCapturedDraftKnowledge = capturedProps?.draftKnowledge

            expect(firstCapturedDraftKnowledge).toBe(
                secondCapturedDraftKnowledge,
            )
        })

        it('should return undefined when draftKnowledge has undefined sourceId', () => {
            const draftKnowledge = {
                sourceId: undefined,
                sourceSetId: 456,
            }

            renderComponent({ draftKnowledge })

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should return undefined when draftKnowledge has undefined sourceSetId', () => {
            const draftKnowledge = {
                sourceId: 123,
                sourceSetId: undefined,
            }

            renderComponent({ draftKnowledge })

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should return undefined when draftKnowledge is undefined', () => {
            renderComponent({ draftKnowledge: undefined })

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should update when draftKnowledge values actually change', () => {
            const draftKnowledge1 = {
                sourceId: 123,
                sourceSetId: 456,
            }
            const draftKnowledge2 = {
                sourceId: 789,
                sourceSetId: 456,
            }

            let capturedProps: any = null
            const PlaygroundProviderMock = jest
                .fn()
                .mockImplementation(({ children, ...props }) => {
                    capturedProps = props
                    return <div>{children}</div>
                })

            jest.spyOn(
                require('../contexts/PlaygroundContext'),
                'PlaygroundProvider',
            ).mockImplementation(PlaygroundProviderMock)

            const { rerender } = renderComponent({
                draftKnowledge: draftKnowledge1,
            })

            const firstCapturedDraftKnowledge = capturedProps?.draftKnowledge

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground draftKnowledge={draftKnowledge2} />
                    </QueryClientProvider>
                </Provider>,
            )

            const secondCapturedDraftKnowledge = capturedProps?.draftKnowledge

            expect(firstCapturedDraftKnowledge).not.toBe(
                secondCapturedDraftKnowledge,
            )
            expect(secondCapturedDraftKnowledge).toEqual({
                sourceId: 789,
                sourceSetId: 456,
            })
        })

        it('should stabilize supportedModes prop when array values remain the same', () => {
            const supportedModes1: SupportedPlaygroundModes = [
                'inbound',
                'outbound',
            ]
            const supportedModes2: SupportedPlaygroundModes = [
                'inbound',
                'outbound',
            ]

            let capturedProps: any = null
            const PlaygroundProviderMock = jest
                .fn()
                .mockImplementation(({ children, ...props }) => {
                    capturedProps = props
                    return <div>{children}</div>
                })

            jest.spyOn(
                require('../contexts/PlaygroundContext'),
                'PlaygroundProvider',
            ).mockImplementation(PlaygroundProviderMock)

            const { rerender } = renderComponent({
                supportedModes: supportedModes1,
            })

            const firstCapturedSupportedModes = capturedProps?.supportedModes

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground supportedModes={supportedModes2} />
                    </QueryClientProvider>
                </Provider>,
            )

            const secondCapturedSupportedModes = capturedProps?.supportedModes

            expect(firstCapturedSupportedModes).toBe(
                secondCapturedSupportedModes,
            )
        })

        it('should update when supportedModes array values actually change', () => {
            const supportedModes1: SupportedPlaygroundModes = ['inbound']
            const supportedModes2: SupportedPlaygroundModes = [
                'inbound',
                'outbound',
            ]

            let capturedProps: any = null
            const PlaygroundProviderMock = jest
                .fn()
                .mockImplementation(({ children, ...props }) => {
                    capturedProps = props
                    return <div>{children}</div>
                })

            jest.spyOn(
                require('../contexts/PlaygroundContext'),
                'PlaygroundProvider',
            ).mockImplementation(PlaygroundProviderMock)

            const { rerender } = renderComponent({
                supportedModes: supportedModes1,
            })

            const firstCapturedSupportedModes = capturedProps?.supportedModes

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground supportedModes={supportedModes2} />
                    </QueryClientProvider>
                </Provider>,
            )

            const secondCapturedSupportedModes = capturedProps?.supportedModes

            expect(firstCapturedSupportedModes).not.toBe(
                secondCapturedSupportedModes,
            )
            expect(secondCapturedSupportedModes).toEqual([
                'inbound',
                'outbound',
            ])
        })

        it('should handle undefined supportedModes', () => {
            renderComponent({ supportedModes: undefined })

            expect(
                screen.getByText('PlaygroundInputSection'),
            ).toBeInTheDocument()
        })

        it('should stabilize empty supportedModes array', () => {
            const supportedModes1: any[] = []
            const supportedModes2: any[] = []

            let capturedProps: any = null
            const PlaygroundProviderMock = jest
                .fn()
                .mockImplementation(({ children, ...props }) => {
                    capturedProps = props
                    return <div>{children}</div>
                })

            jest.spyOn(
                require('../contexts/PlaygroundContext'),
                'PlaygroundProvider',
            ).mockImplementation(PlaygroundProviderMock)

            const { rerender } = renderComponent({
                supportedModes: supportedModes1,
            })

            const firstCapturedSupportedModes = capturedProps?.supportedModes

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground supportedModes={supportedModes2} />
                    </QueryClientProvider>
                </Provider>,
            )

            const secondCapturedSupportedModes = capturedProps?.supportedModes

            expect(firstCapturedSupportedModes).toBe(
                secondCapturedSupportedModes,
            )
        })

        it('should not cause re-render when both draftKnowledge and supportedModes remain the same', () => {
            const props1 = {
                draftKnowledge: {
                    sourceId: 123,
                    sourceSetId: 456,
                },
                supportedModes: [
                    'inbound',
                    'outbound',
                ] as SupportedPlaygroundModes,
            }

            const props2 = {
                draftKnowledge: {
                    sourceId: 123,
                    sourceSetId: 456,
                },
                supportedModes: [
                    'inbound',
                    'outbound',
                ] as SupportedPlaygroundModes,
            }

            let capturedProps: any = null
            const PlaygroundProviderMock = jest
                .fn()
                .mockImplementation(({ children, ...props }) => {
                    capturedProps = props
                    return <div>{children}</div>
                })

            jest.spyOn(
                require('../contexts/PlaygroundContext'),
                'PlaygroundProvider',
            ).mockImplementation(PlaygroundProviderMock)

            const { rerender } = renderComponent(props1)

            const firstCapturedDraftKnowledge = capturedProps?.draftKnowledge
            const firstCapturedSupportedModes = capturedProps?.supportedModes

            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={mockQueryClient}>
                        <AiAgentPlayground {...props2} />
                    </QueryClientProvider>
                </Provider>,
            )

            const secondCapturedDraftKnowledge = capturedProps?.draftKnowledge
            const secondCapturedSupportedModes = capturedProps?.supportedModes

            expect(firstCapturedDraftKnowledge).toBe(
                secondCapturedDraftKnowledge,
            )
            expect(firstCapturedSupportedModes).toBe(
                secondCapturedSupportedModes,
            )
        })
    })
})
