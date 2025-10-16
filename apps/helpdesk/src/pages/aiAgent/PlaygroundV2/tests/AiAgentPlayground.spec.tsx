import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { AiAgentPlayground } from '../AiAgentPlayground'
import {
    usePlaygroundContext,
    usePlaygroundEvent,
} from '../contexts/PlaygroundContext'
import { useAiAgentHttpIntegration } from '../hooks/useAiAgentHttpIntegration'
import { usePlaygroundPrerequisites } from '../hooks/usePlaygroundPrerequisites'
import { usePlaygroundResources } from '../hooks/usePlaygroundResources'
import { usePlaygroundTracking } from '../hooks/usePlaygroundTracking'
import { useShopNameResolution } from '../hooks/useShopNameResolution'

jest.mock('../contexts/PlaygroundContext', () => ({
    PlaygroundProvider: ({ children }: any) => <div>{children}</div>,
    usePlaygroundContext: jest.fn(),
    usePlaygroundEvent: jest.fn(),
}))

jest.mock('../hooks/useAiAgentHttpIntegration')
jest.mock('../hooks/usePlaygroundPrerequisites')
jest.mock('../hooks/usePlaygroundResources')
jest.mock('../hooks/usePlaygroundTracking')
jest.mock('../hooks/useShopNameResolution')

jest.mock(
    '../components/PlaygroundInputSection/PlaygroundInputSection',
    () => ({
        PlaygroundInputSection: () => <div>PlaygroundInputSection</div>,
    }),
)

jest.mock('../components/PlaygroundMessageList/PlaygroundMessageList', () => ({
    PlaygroundMessageList: () => <div>PlaygroundMessageList</div>,
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

const mockUsePlaygroundContext = jest.mocked(usePlaygroundContext)
const mockUsePlaygroundEvent = jest.mocked(usePlaygroundEvent)
const mockUseAiAgentHttpIntegration = jest.mocked(useAiAgentHttpIntegration)
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
        mockUseShopNameResolution.mockReturnValue({
            resolvedShopName: 'test-store',
        } as any)
        mockUsePlaygroundResources.mockReturnValue(
            defaultPlaygroundResources as any,
        )
        mockUsePlaygroundPrerequisites.mockReturnValue(
            defaultPlaygroundPrerequisites,
        )
        mockUseAiAgentHttpIntegration.mockReturnValue({
            httpIntegrationId: 456,
            baseUrl: 'https://test-base-url.com',
        } as any)
        mockUsePlaygroundTracking.mockReturnValue({
            onTestPageViewed: jest.fn(),
        } as any)
        mockUsePlaygroundContext.mockReturnValue({
            events: {
                on: jest.fn(),
                emit: jest.fn(),
            },
        } as any)
        mockUsePlaygroundEvent.mockImplementation(() => {})
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
                screen.getByText('PlaygroundMessageList'),
            ).toBeInTheDocument()
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
        it('should pass shouldDisplayResetButton prop to PlaygroundInputSection', () => {
            renderComponent({ shouldDisplayResetButton: false })

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
            const mockEmit = jest.fn()
            mockUsePlaygroundContext.mockReturnValue({
                events: {
                    on: jest.fn(),
                    emit: mockEmit,
                },
            } as any)

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

            await waitFor(() => {
                expect(mockEmit).toHaveBeenCalled()
            })
        })

        it('should call resetPlaygroundCallback when resetPlayground is true', async () => {
            const mockResetCallback = jest.fn()
            const mockEmit = jest.fn()
            mockUsePlaygroundContext.mockReturnValue({
                events: {
                    on: jest.fn(),
                    emit: mockEmit,
                },
            } as any)

            renderComponent({
                resetPlayground: true,
                resetPlaygroundCallback: mockResetCallback,
            })

            await waitFor(() => {
                expect(mockResetCallback).toHaveBeenCalled()
                expect(mockEmit).toHaveBeenCalled()
            })
        })
    })
})
