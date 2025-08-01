import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetMessageAiReasoning } from 'models/knowledgeService/queries'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { knowledgeResourceShouldBeLink } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { RootState, StoreDispatch } from 'state/types'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { UIActions } from 'state/ui/ticketAIAgentFeedback/types'

import { AiAgentReasoning, parseReasoningResources } from '../AiAgentReasoning'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('common/navigation/hooks/useNavBar/useNavBar')
jest.mock('core/flags')
jest.mock('split-ticket-view-toggle')
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon',
    () => ({
        __esModule: true,
        default: ({ type, badgeIconClassname }: any) => (
            <span
                data-testid={`knowledge-source-icon-${type}`}
                className={badgeIconClassname}
            >
                {type}
            </span>
        ),
    }),
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover',
    () => ({
        __esModule: true,
        default: ({
            children,
            knowledgeResourceType,
            title,
            content,
            url,
        }: any) => {
            const mockRef = { current: null }
            return (
                <div
                    data-testid={`knowledge-source-popover-${knowledgeResourceType}`}
                    data-title={title}
                    data-content={content}
                    data-url={url}
                >
                    {children(mockRef, {
                        onMouseOver: jest.fn(),
                        onMouseOut: jest.fn(),
                    })}
                </div>
            )
        },
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceRenderer',
    () => ({
        __esModule: true,
        default: ({
            resourceType,
            iconClassName,
            title,
            url,
            onClick,
        }: any) => (
            <div
                data-testid={`knowledge-source-popover-${resourceType}`}
                data-title={title}
                data-url={url}
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
                <span
                    data-testid={`knowledge-source-icon-${resourceType}`}
                    className={iconClassName}
                >
                    {resourceType}
                </span>
            </div>
        ),
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata',
    () => ({
        useGetResourcesReasoningMetadata: jest.fn(),
    }),
)

jest.mock('pages/tickets/detail/components/AIAgentFeedbackBar/utils', () => ({
    knowledgeResourceShouldBeLink: jest.fn(() => true),
}))

jest.mock('utils/html', () => ({
    sanitizeHtmlDefault: jest.fn((content: string) => content),
}))

// Mock ReactMarkdown to properly handle custom components
jest.mock('react-markdown', () => {
    return function MockReactMarkdown({
        children,
        components,
    }: {
        children: string
        components?: any
        [key: string]: any
    }) {
        // Simulate the processing that would happen in real ReactMarkdown
        let processedContent = children

        // Find all <<<...>>> patterns and replace with <kbd> elements
        const resourceMatches = processedContent.match(/<<<(.*?)>>>/g) || []
        resourceMatches.forEach((match, index) => {
            processedContent = processedContent.replace(
                match,
                `<kbd id="${index}"></kbd>`,
            )
        })

        // Parse the processed content and render custom components
        if (components?.kbd && processedContent.includes('<kbd')) {
            const parts = processedContent.split(/<kbd id="(\d+)"><\/kbd>/)
            const elements = []

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i]

                // Check if this part is a kbd id (numeric string from regex capture group)
                if (i % 2 === 1 && part.match(/^\d+$/)) {
                    const id = part
                    elements.push(components.kbd({ id, key: `kbd-${id}` }))
                } else if (part) {
                    // Only add non-empty text parts
                    elements.push(<span key={`text-${i}`}>{part}</span>)
                }
            }

            return <div data-testid="react-markdown">{elements}</div>
        }

        return (
            <div
                data-testid="react-markdown"
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
        )
    }
})

jest.mock('models/knowledgeService/queries', () => ({
    useGetMessageAiReasoning: jest.fn(),
    ReasoningResponseType: {
        OUTCOME: 'OUTCOME',
        RESPONSE: 'RESPONSE',
        TASK: 'TASK',
    },
}))

const useAppDispatchMock = assumeMock(useAppDispatch)
const useAppSelectorMock = assumeMock(useAppSelector)
const useNavBarMock = assumeMock(useNavBar)
const useFlagMock = assumeMock(useFlag)
const useSplitTicketViewMock = assumeMock(useSplitTicketView)
const useKnowledgeSourceSideBarMock = assumeMock(useKnowledgeSourceSideBar)
const mockUseGetMessageAiReasoning = assumeMock(useGetMessageAiReasoning)
const mockUseGetResourcesReasoningMetadata = assumeMock(
    useGetResourcesReasoningMetadata,
)
const mockKnowledgeResourceShouldBeLink = jest.mocked(
    knowledgeResourceShouldBeLink,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('AiAgentReasoning', () => {
    const mockDispatch = jest.fn()

    const createMockTicket = () => Map({ id: 123 })

    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()

        mockKnowledgeResourceShouldBeLink.mockReturnValue(true)

        useAppDispatchMock.mockReturnValue(mockDispatch)
        useAppSelectorMock.mockImplementation((selector: any) => {
            if (
                selector.name === 'getTicketState' ||
                selector.toString().includes('getTicketState')
            ) {
                return createMockTicket()
            }
            if (
                selector.name === 'getActiveTab' ||
                selector.toString().includes('getActiveTab')
            ) {
                return TicketAIAgentFeedbackTab.CustomerInformation
            }
            if (
                selector.name === 'getCurrentAccountState' ||
                selector.toString().includes('getCurrentAccountState')
            ) {
                return fromJS(account)
            }
            if (selector.toString().includes('state.currentUser'))
                return fromJS(user)
            return undefined
        })

        useNavBarMock.mockReturnValue({
            navBarDisplay: 'open',
            setNavBarDisplay: jest.fn(),
        } as any)

        useFlagMock.mockReturnValue(true)

        useSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
            setIsEnabled: jest.fn(),
        } as any)

        useKnowledgeSourceSideBarMock.mockReturnValue({
            openPreview: jest.fn(),
            selectedResource: null,
            mode: null,
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        } as any)

        mockUseGetMessageAiReasoning.mockReturnValue({
            data: {
                reasoning: [
                    {
                        responseType: 'OUTCOME',
                        value: "Acknowledged the customer's confusion about CustomerInterestStage.READY_TO_BUY",
                    },
                    {
                        responseType: 'RESPONSE',
                        value: 'AIAgentDecisionOutcome.WAIT_FOR_CUSTOMER_RESPONSE',
                    },
                    {
                        responseType: 'TASK',
                        value: 'Sales <<<ARTICLE::16::13608>>> Support <<<GUIDANCE::26665::1045245>>> <<<ACTION::01J7KWHHMDY3H5S174D89VG7S3>>> <<<FILE_EXTERNAL_SNIPPET::78::12345>>> <<<EXTERNAL_SNIPPET::89::54321>>> <<<ORDER::98765>>>',
                    },
                ],
                resources: [
                    {
                        resourceType: 'ARTICLE',
                        resourceId: '13608',
                        resourceSetId: '16',
                        resourceTitle: 'Test Article',
                        resourceLocale: 'en',
                        taskIds: [],
                    },
                    {
                        resourceType: 'GUIDANCE',
                        resourceId: '1045245',
                        resourceSetId: '26665',
                        resourceTitle: 'Test Guidance',
                        resourceLocale: 'en',
                        taskIds: [],
                    },
                    {
                        resourceType: 'ACTION',
                        resourceId: '01J7KWHHMDY3H5S174D89VG7S3',
                        resourceTitle: 'Test Action',
                        resourceLocale: 'en',
                        taskIds: [],
                    },

                    {
                        resourceType: 'FILE_EXTERNAL_SNIPPET',
                        resourceId: '12345',
                        resourceSetId: '78',
                        resourceTitle: 'Test File Snippet',
                        resourceLocale: 'en',
                        taskIds: [],
                    },
                    {
                        resourceType: 'EXTERNAL_SNIPPET',
                        resourceId: '54321',
                        resourceSetId: '89',
                        resourceTitle: 'Test External Snippet',
                        resourceLocale: 'en',
                        taskIds: [],
                    },
                    {
                        resourceType: 'ORDER',
                        resourceId: '98765',
                        resourceTitle: '#98765',
                        resourceLocale: 'en',
                        taskIds: [],
                    },
                ],
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            refetch: jest.fn(),
        } as any)

        mockUseGetResourcesReasoningMetadata.mockReturnValue({
            data: [
                {
                    title: 'Cheirosa 68 Beija Flor™ Perfume Mist - Product Guide',
                    content: 'Product guide content',
                    url: 'https://artemisathletix.gorgias.help/en-us/articles/13608-cheirosa-68-beija-flor-perfume-mist-guide',
                    isDeleted: false,
                },
                {
                    title: 'Customer Service Guidelines',
                    content: 'Service guidelines content',
                    url: 'https://example.com/guidance',
                    isDeleted: false,
                },
                {
                    title: 'Action Guide',
                    content: 'Action content',
                    url: 'https://example.com/action',
                    isDeleted: false,
                },

                {
                    title: 'File Snippet',
                    content: 'File snippet content',
                    url: 'https://example.com/file',
                    isDeleted: false,
                },
                {
                    title: 'External Reference',
                    content: 'External content',
                    url: 'https://example.com/external',
                    isDeleted: false,
                },
                {
                    title: 'Order #98765',
                    content: 'Order details',
                    url: '/app/orders/98765/details',
                    isDeleted: false,
                },
            ],
            isLoading: false,
        })
    })

    const renderComponent = (props: any = {}) => {
        const store = mockStore({})
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <KnowledgeSourceSideBarProvider>
                        <AiAgentReasoning messageId={1} {...props} />
                    </KnowledgeSourceSideBarProvider>
                </Provider>
            </QueryClientProvider>,
        )
    }

    const expandComponent = () => {
        const showReasoningButton = screen.getByText('Show reasoning')
        fireEvent.click(showReasoningButton)

        act(() => {
            jest.advanceTimersByTime(3000)
        })
    }

    describe('Initial state', () => {
        it('should render in collapsed state by default', () => {
            renderComponent()

            expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            expect(screen.queryByText('Hide reasoning')).not.toBeInTheDocument()
        })

        it('should show collapse icon when collapsed', () => {
            renderComponent()

            const icon = document.querySelector('.material-icons')
            expect(icon).toHaveTextContent('keyboard_arrow_down')
        })

        it('should be clickable when in collapsed state', () => {
            renderComponent()

            const titleElement = screen
                .getByText('Show reasoning')
                .closest('div')
            expect(titleElement).toHaveClass('clickable')
        })
    })

    describe('Loading state', () => {
        it('should show loading state when clicked to expand', () => {
            mockUseGetResourcesReasoningMetadata.mockReturnValue(null)
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: undefined,
                isLoading: true,
                refetch: jest.fn(),
            } as any)

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.getByText('Loading reasoning...')).toBeInTheDocument()
            expect(document.querySelector('.material-icons')).toHaveTextContent(
                'auto_awesome',
            )
        })

        it('should transition to expanded state after loading timer', () => {
            mockUseGetResourcesReasoningMetadata.mockReturnValue(null)
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: undefined,
                isLoading: true,
                refetch: jest.fn(),
            } as any)

            const { rerender } = renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.getByText('Loading reasoning...')).toBeInTheDocument()

            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: "Acknowledged the customer's confusion about CustomerInterestStage.READY_TO_BUY",
                        },
                        {
                            responseType: 'RESPONSE',
                            value: 'AIAgentDecisionOutcome.WAIT_FOR_CUSTOMER_RESPONSE',
                        },
                        {
                            responseType: 'TASK',
                            value: 'Sales <<<ARTICLE::16::13608>>> Support',
                            targetId: 'task1',
                        },
                    ],
                    resources: [
                        {
                            resourceType: 'ARTICLE',
                            resourceId: '13608',
                            resourceSetId: '16',
                            resourceTitle: 'Test Article',
                            resourceLocale: 'en',
                            taskIds: ['task1'],
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'Test Shop',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                refetch: jest.fn(),
            } as any)

            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [
                    {
                        title: 'Test Article',
                        content: 'Test content',
                        url: 'https://example.com/article',
                    },
                ],
                isLoading: false,
            })

            act(() => {
                rerender(
                    <QueryClientProvider
                        client={
                            new QueryClient({
                                defaultOptions: { queries: { retry: false } },
                            })
                        }
                    >
                        <Provider store={mockStore({})}>
                            <KnowledgeSourceSideBarProvider>
                                <AiAgentReasoning messageId={1} />
                            </KnowledgeSourceSideBarProvider>
                        </Provider>
                    </QueryClientProvider>,
                )
            })

            expect(screen.getByText('Hide reasoning')).toBeInTheDocument()
            expect(
                screen.queryByText('Loading reasoning...'),
            ).not.toBeInTheDocument()
        })

        it('should not be clickable during loading', () => {
            mockUseGetResourcesReasoningMetadata.mockReturnValue(null)
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: undefined,
                isLoading: true,
                refetch: jest.fn(),
            } as any)

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            const titleElement = screen
                .getByText('Loading reasoning...')
                .closest('div')
            expect(titleElement).not.toHaveClass('clickable')
        })
    })

    describe('Expanded state', () => {
        it('should show Hide reasoning when expanded', () => {
            renderComponent()
            expandComponent()

            expect(screen.getByText('Hide reasoning')).toBeInTheDocument()
        })

        it('should show expand up icon when expanded', () => {
            renderComponent()
            expandComponent()

            const icon = document.querySelector('.material-icons')
            expect(icon).toHaveTextContent('keyboard_arrow_up')
        })

        it('should render reasoning content with knowledge source icons', () => {
            renderComponent()
            expandComponent()

            expect(
                screen.getByText(/Acknowledged the customer's confusion/),
            ).toBeInTheDocument()
            expect(screen.getByText(/Sales/)).toBeInTheDocument()
            expect(screen.getByText(/Support/)).toBeInTheDocument()

            expect(
                screen.getAllByTestId(/knowledge-source-icon-/).length,
            ).toBeGreaterThan(0)
        })

        it('should show Give Feedback button when expanded', () => {
            renderComponent()
            expandComponent()

            const feedbackButton = screen.getByText('Give Feedback')
            expect(feedbackButton).toBeInTheDocument()
            expect(feedbackButton).toBeEnabled()
        })

        it('should collapse when clicked again', () => {
            renderComponent()
            expandComponent()

            const hideReasoningButton = screen.getByText('Hide reasoning')
            fireEvent.click(hideReasoningButton)

            expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            expect(screen.queryByText('Hide reasoning')).not.toBeInTheDocument()
        })
    })

    describe('Give Feedback functionality', () => {
        it('should dispatch changeActiveTab when Give Feedback is clicked', () => {
            renderComponent()
            expandComponent()

            const feedbackButton = screen.getByText('Give Feedback')
            fireEvent.click(feedbackButton)

            expect(mockDispatch).toHaveBeenCalledWith({
                type: UIActions.ChangeActiveTab,
                payload: { activeTab: TicketAIAgentFeedbackTab.AIAgent },
            })
        })
    })

    describe('Knowledge source rendering', () => {
        it('should render knowledge source popovers with correct data', () => {
            renderComponent()
            expandComponent()

            const popovers = screen.getAllByTestId(/knowledge-source-popover-/)
            expect(popovers.length).toBeGreaterThan(0)

            const firstPopover = popovers[0]
            expect(firstPopover).toHaveAttribute('data-title')
            expect(firstPopover).toHaveAttribute('data-url')
        })

        it('should render different knowledge source icon types correctly', () => {
            renderComponent()
            expandComponent()

            const icons = screen.getAllByTestId(/knowledge-source-icon-/)
            expect(icons.length).toBeGreaterThan(0)

            const iconTypes = icons.map((icon) => icon.textContent)
            expect(iconTypes.some((type) => type && type.length > 0)).toBe(true)
        })
    })

    describe('Knowledge source click handling', () => {
        beforeEach(() => {
            // Mock window.open
            Object.defineProperty(window, 'open', {
                value: jest.fn(),
                writable: true,
            })
        })

        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should open link in new tab when isLink is true and resourceUrl exists', () => {
            const mockWindowOpen = jest.fn()
            window.open = mockWindowOpen

            // Mock the flag to make resources behave as links
            useFlagMock.mockImplementation((flag) => {
                if (
                    flag ===
                    FeatureFlagKey.EnableKnowledgeManagementFromTicketView
                ) {
                    return false // This will make knowledgeResourceShouldBeLink return true
                }
                return false
            })

            renderComponent()
            expandComponent()

            // Find and click a knowledge source
            const knowledgeSourcePopovers = screen.getAllByTestId(
                /knowledge-source-popover-/,
            )
            expect(knowledgeSourcePopovers.length).toBeGreaterThan(0)

            fireEvent.click(knowledgeSourcePopovers[0])

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://artemisathletix.gorgias.help/en-us/articles/13608-cheirosa-68-beija-flor-perfume-mist-guide',
                '_blank',
            )
        })

        it('should call openPreview when enableKnowledgeManagementFromTicketView is true and isLink is false', () => {
            const mockOpenPreview = jest.fn()

            // Mock the hook to return our mock function
            useKnowledgeSourceSideBarMock.mockReturnValue({
                openPreview: mockOpenPreview,
                isClosing: false,
                selectedResource: null,
                mode: null,
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            // Mock the flag to enable knowledge management
            useFlagMock.mockImplementation((flag) => {
                if (
                    flag ===
                    FeatureFlagKey.EnableKnowledgeManagementFromTicketView
                ) {
                    return true
                }
                return false
            })

            mockKnowledgeResourceShouldBeLink.mockReturnValue(false)

            renderComponent()
            expandComponent()

            // Find and click a knowledge source
            const knowledgeSourcePopovers = screen.getAllByTestId(
                /knowledge-source-popover-/,
            )
            expect(knowledgeSourcePopovers.length).toBeGreaterThan(0)

            fireEvent.click(knowledgeSourcePopovers[0])

            expect(mockOpenPreview).toHaveBeenCalledWith({
                id: '13608',
                url: 'https://artemisathletix.gorgias.help/en-us/articles/13608-cheirosa-68-beija-flor-perfume-mist-guide',
                title: 'Cheirosa 68 Beija Flor™ Perfume Mist - Product Guide',
                content: 'Product guide content',
                knowledgeResourceType: 'ARTICLE',
                helpCenterId: '16',
            })
        })

        it('should not call window.open when resourceUrl is empty', () => {
            const mockWindowOpen = jest.fn()
            window.open = mockWindowOpen

            // Mock resource data with empty URL
            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [
                    {
                        title: 'Sales Documentation',
                        content: 'This is sales documentation content.',
                        url: '', // Empty URL
                        isDeleted: false,
                    },
                ],
                isLoading: false,
            })

            useFlagMock.mockImplementation((flag) => {
                if (
                    flag ===
                    FeatureFlagKey.EnableKnowledgeManagementFromTicketView
                ) {
                    return false
                }
                return false
            })

            renderComponent()
            expandComponent()

            // Find and click a knowledge source
            const knowledgeSourcePopovers = screen.getAllByTestId(
                /knowledge-source-popover-/,
            )
            if (knowledgeSourcePopovers.length > 0) {
                fireEvent.click(knowledgeSourcePopovers[0])
                expect(mockWindowOpen).not.toHaveBeenCalled()
            }
        })

        it('should not have click handler when resource is deleted', () => {
            const mockWindowOpen = jest.fn()
            window.open = mockWindowOpen

            // Mock resource data with deleted resource
            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [
                    {
                        title: 'Sales Documentation',
                        content: 'This is sales documentation content.',
                        url: 'https://example.com/article1',
                        isDeleted: true, // Resource is deleted
                    },
                ],
                isLoading: false,
            })

            renderComponent()
            expandComponent()

            // Find knowledge source - it should not be clickable
            const knowledgeSourcePopovers = screen.queryAllByTestId(
                /knowledge-source-popover-/,
            )
            // Deleted resources should not render any knowledge sources
            expect(knowledgeSourcePopovers.length).toBe(0)
            expect(mockWindowOpen).not.toHaveBeenCalled()
        })
    })

    describe('Props handling', () => {
        it('should handle messageId of 0', () => {
            renderComponent({ messageId: 0 })

            expect(screen.getByText('Show reasoning')).toBeInTheDocument()
        })
    })

    describe('Content rendering', () => {
        it('should render mock reasoning content correctly', () => {
            renderComponent()
            expandComponent()

            expect(
                screen.getByText(/Acknowledged the customer's confusion/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/CustomerInterestStage\.READY_TO_BUY/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /AIAgentDecisionOutcome\.WAIT_FOR_CUSTOMER_RESPONSE/,
                ),
            ).toBeInTheDocument()
        })

        it('should render reasoning content without resource placeholders', () => {
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: 'Simple reasoning without resources',
                        },
                        {
                            responseType: 'RESPONSE',
                            value: 'Simple response',
                        },
                        {
                            responseType: 'TASK',
                            value: 'Task details without any resource references',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'Test Shop',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                refetch: jest.fn(),
            } as any)

            renderComponent()
            expandComponent()

            expect(
                screen.getByText(/Simple reasoning without resources/),
            ).toBeInTheDocument()
            expect(screen.getByText(/Simple response/)).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Task details without any resource references/,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Error state', () => {
        it('should show error state when reasoning data is incomplete', () => {
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: 'Some outcome',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'Test Shop',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                refetch: jest.fn(),
            } as any)

            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: false,
            })

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(
                screen.getByText("Couldn't load reasoning. Please try again."),
            ).toBeInTheDocument()
            expect(screen.getByText('Try again')).toBeInTheDocument()
        })

        it('should show error state when no reasoning data is available', () => {
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: 'Some outcome',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'Test Shop',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                refetch: jest.fn(),
            } as any)

            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: false,
            })

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(
                screen.getByText("Couldn't load reasoning. Please try again."),
            ).toBeInTheDocument()
        })

        it('should handle Try again button click in error state', () => {
            const mockRefetch = jest.fn()
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: 'Some outcome',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'Test Shop',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                refetch: mockRefetch,
            } as any)

            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: false,
            })

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            const tryAgainButton = screen.getByText('Try again')
            fireEvent.click(tryAgainButton)

            expect(mockRefetch).toHaveBeenCalled()
        })

        it('should not render body and footer in error state', () => {
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: 'Some outcome',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'Test Shop',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                refetch: jest.fn(),
            } as any)

            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: false,
            })

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.queryByText('Give Feedback')).not.toBeInTheDocument()
        })
    })

    describe('Deleted resources handling', () => {
        it('should handle deleted resources correctly', () => {
            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [
                    {
                        title: 'Active Resource',
                        content: 'Active content',
                        url: 'https://example.com/active',
                    },
                    {
                        isDeleted: true,
                        title: 'Deleted Resource',
                        content: 'Deleted content',
                        url: 'https://example.com/deleted',
                    },
                ],
                isLoading: false,
            })

            renderComponent()
            expandComponent()

            expect(screen.getByText(/Sales/)).toBeInTheDocument()
        })
    })

    describe('Store configuration handling', () => {
        it('should handle missing storeConfiguration', () => {
            mockUseGetMessageAiReasoning.mockReturnValue({
                data: {
                    reasoning: [
                        {
                            responseType: 'OUTCOME',
                            value: 'Test reasoning',
                        },
                        {
                            responseType: 'RESPONSE',
                            value: 'Test response',
                        },
                        {
                            responseType: 'TASK',
                            value: 'Test <<<ARTICLE::16::13608>>> content',
                        },
                    ],
                    resources: [
                        {
                            resourceType: 'ARTICLE',
                            resourceId: '13608',
                            resourceSetId: '16',
                            resourceTitle: 'Test Article',
                            resourceLocale: 'en',
                            taskIds: [],
                        },
                    ],
                },
                isLoading: false,
                refetch: jest.fn(),
            } as any)

            renderComponent()
            expandComponent()

            expect(screen.getByText(/Test reasoning/)).toBeInTheDocument()
        })
    })

    describe('Give Feedback button states', () => {
        it('should show active styling for Give Feedback button when AIAgent tab is active', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (
                    selector.name === 'getTicketState' ||
                    selector.toString().includes('getTicketState')
                ) {
                    return createMockTicket()
                }
                if (
                    selector.name === 'getActiveTab' ||
                    selector.toString().includes('getActiveTab')
                ) {
                    return TicketAIAgentFeedbackTab.AIAgent
                }
                if (
                    selector.name === 'getCurrentAccountState' ||
                    selector.toString().includes('getCurrentAccountState')
                ) {
                    return fromJS(account)
                }
                if (selector.toString().includes('state.currentUser'))
                    return fromJS(user)
                return undefined
            })

            renderComponent()
            expandComponent()

            const feedbackButton = screen.getByText('Give Feedback')
            expect(feedbackButton).toBeInTheDocument()
        })
    })

    describe('parseReasoningResources function', () => {
        const mockResources = [
            {
                resourceType: 'ARTICLE' as const,
                resourceId: '13608',
                resourceSetId: '16',
                resourceTitle: 'Test Article',
                resourceLocale: 'en',
                taskIds: [],
            },
            {
                resourceType: 'GUIDANCE' as const,
                resourceId: '1045245',
                resourceSetId: '26665',
                resourceTitle: 'Test Guidance',
                resourceLocale: 'en',
                taskIds: [],
            },
            {
                resourceType: 'ACTION' as const,
                resourceId: '01J7KWHHMDY3H5S174D89VG7S3',
                resourceSetId: '',
                resourceTitle: 'Test Action',
                resourceLocale: 'en',
                taskIds: [],
            },

            {
                resourceType: 'FILE_EXTERNAL_SNIPPET' as const,
                resourceId: '12345',
                resourceSetId: '78',
                resourceTitle: 'Test File Snippet',
                resourceLocale: 'en',
                taskIds: [],
            },
            {
                resourceType: 'EXTERNAL_SNIPPET' as const,
                resourceId: '54321',
                resourceSetId: '89',
                resourceTitle: 'Test External Snippet',
                resourceLocale: 'en',
                taskIds: [],
            },
            {
                resourceType: 'ORDER' as const,
                resourceId: '98765',
                resourceSetId: '',
                resourceTitle: '#98765',
                resourceLocale: 'en',
                taskIds: [],
            },
        ]

        const expectedArticleResource = {
            resourceType: 'ARTICLE',
            resourceId: '13608',
            resourceSetId: '16',
            resourceTitle: 'Test Article',
        }

        const expectedGuidanceResource = {
            resourceType: 'GUIDANCE',
            resourceId: '1045245',
            resourceSetId: '26665',
            resourceTitle: 'Test Guidance',
        }

        const expectedActionResource = {
            resourceType: 'ACTION',
            resourceId: '01J7KWHHMDY3H5S174D89VG7S3',
            resourceTitle: 'Test Action',
        }

        const expectedFileExternalSnippetResource = {
            resourceType: 'FILE_EXTERNAL_SNIPPET',
            resourceId: '12345',
            resourceSetId: '78',
            resourceTitle: 'Test File Snippet',
        }

        const expectedExternalSnippetResource = {
            resourceType: 'EXTERNAL_SNIPPET',
            resourceId: '54321',
            resourceSetId: '89',
            resourceTitle: 'Test External Snippet',
        }

        const expectedOrderResource = {
            resourceType: 'ORDER',
            resourceId: '98765',
            resourceTitle: '#98765',
        }

        it.each([
            [
                'ARTICLE',
                'Some text <<<ARTICLE::16::13608>>> more text',
                [expectedArticleResource],
            ],
            [
                'GUIDANCE',
                'Text with <<<GUIDANCE::26665::1045245>>> guidance',
                [expectedGuidanceResource],
            ],
            [
                'ACTION',
                'Action <<<ACTION::01J7KWHHMDY3H5S174D89VG7S3>>> here',
                [expectedActionResource],
            ],

            [
                'FILE_EXTERNAL_SNIPPET',
                'File <<<FILE_EXTERNAL_SNIPPET::78::12345>>> snippet',
                [expectedFileExternalSnippetResource],
            ],
            [
                'EXTERNAL_SNIPPET',
                'External <<<EXTERNAL_SNIPPET::89::54321>>> snippet',
                [expectedExternalSnippetResource],
            ],
            ['ORDER', 'Order <<<ORDER::98765>>> data', [expectedOrderResource]],
        ])(
            'should parse %s resources correctly',
            (resourceType, content, expected) => {
                const result = parseReasoningResources(content, mockResources)
                expect(result).toEqual(expected)
            },
        )

        it('should parse all resource types in a single string', () => {
            const content = `
                Test <<<ARTICLE::16::13608>>> <<<GUIDANCE::26665::1045245>>> 
                <<<ACTION::01J7KWHHMDY3H5S174D89VG7S3>>> 
                <<<FILE_EXTERNAL_SNIPPET::78::12345>>> <<<EXTERNAL_SNIPPET::89::54321>>> 
                <<<ORDER::98765>>>
            `
            const result = parseReasoningResources(content, mockResources)

            expect(result).toHaveLength(6)
            expect(result[0]).toEqual(expectedArticleResource)
            expect(result[1]).toEqual(expectedGuidanceResource)
            expect(result[2]).toEqual(expectedActionResource)
            expect(result[3]).toEqual(expectedFileExternalSnippetResource)
            expect(result[4]).toEqual(expectedExternalSnippetResource)
            expect(result[5]).toEqual(expectedOrderResource)
        })

        it('should return empty array when no resources found', () => {
            const content = 'This is just plain text with no resources'
            const result = parseReasoningResources(content, mockResources)

            expect(result).toEqual([])
        })

        it('should return empty array for empty string', () => {
            const content = ''
            const result = parseReasoningResources(content, mockResources)

            expect(result).toEqual([])
        })

        it('should handle malformed resource patterns', () => {
            const content =
                'Text <<<INVALID::FORMAT>>> and <<<UNKNOWN::TYPE::123>>> more text'
            const result = parseReasoningResources(content, mockResources)

            expect(result).toEqual([])
        })

        it('should handle duplicate resources', () => {
            const content =
                'Text <<<ARTICLE::16::13608>>> and <<<ARTICLE::16::13608>>> again'
            const result = parseReasoningResources(content, mockResources)

            expect(result).toEqual([
                expectedArticleResource,
                expectedArticleResource,
            ])
        })
    })
})
