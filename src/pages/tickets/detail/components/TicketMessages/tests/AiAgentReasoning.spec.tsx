import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetMessageAiReasoning } from 'models/knowledgeService/queries'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'
import { RootState, StoreDispatch } from 'state/types'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { UIActions } from 'state/ui/ticketAIAgentFeedback/types'
import { assumeMock } from 'utils/testing'

import { AiAgentReasoning, parseReasoningResources } from '../AiAgentReasoning'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
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
    'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData',
    () => ({
        useGetResourcesReasoningMetadata: jest.fn(),
    }),
)

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
const mockUseGetMessageAiReasoning = assumeMock(useGetMessageAiReasoning)
const mockUseGetResourcesReasoningMetadata = assumeMock(
    useGetResourcesReasoningMetadata,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('AiAgentReasoning', () => {
    const mockDispatch = jest.fn()

    const createMockTicket = () => Map({ id: 123 })

    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()

        useAppDispatchMock.mockReturnValue(mockDispatch)
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
                return TicketAIAgentFeedbackTab.CustomerInformation
            }
            return undefined
        })

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
                        value: 'Sales {{ARTICLE::16::13608}} Support {{GUIDANCE::26665::1045245}} {{ACTION::01J7KWHHMDY3H5S174D89VG7S3}} {{MACRO::45::67890}} {{FILE_EXTERNAL_SNIPPET::78::12345}} {{EXTERNAL_SNIPPET::89::54321}} {{ORDER::99::98765::#98765}}',
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
                },
                {
                    title: 'Customer Service Guidelines',
                    content: 'Service guidelines content',
                    url: 'https://example.com/guidance',
                },
                {
                    title: 'Action Guide',
                    content: 'Action content',
                    url: 'https://example.com/action',
                },
                {
                    title: 'Support Macro',
                    content: 'Macro content',
                    url: 'https://example.com/macro',
                },
                {
                    title: 'File Snippet',
                    content: 'File snippet content',
                    url: 'https://example.com/file',
                },
                {
                    title: 'External Reference',
                    content: 'External content',
                    url: 'https://example.com/external',
                },
                {
                    title: 'Order #98765',
                    content: 'Order details',
                    url: '/app/orders/98765/details',
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
                    <AiAgentReasoning messageId={1} {...props} />
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
            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: true,
            })

            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.getByText('Loading reasoning...')).toBeInTheDocument()
            expect(document.querySelector('.material-icons')).toHaveTextContent(
                'auto_awesome',
            )
        })

        it('should transition to expanded state after loading timer', () => {
            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: true,
            })

            const { rerender } = renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.getByText('Loading reasoning...')).toBeInTheDocument()

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
                            <AiAgentReasoning messageId={1} />
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
            mockUseGetResourcesReasoningMetadata.mockReturnValue({
                data: [],
                isLoading: true,
            })

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
                            value: 'Test {{ARTICLE::16::13608}} content',
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
                return undefined
            })

            renderComponent()
            expandComponent()

            const feedbackButton = screen.getByText('Give Feedback')
            expect(feedbackButton).toBeInTheDocument()
        })
    })

    describe('parseReasoningResources function', () => {
        const expectedArticleResource = {
            resourceType: 'ARTICLE',
            resourceId: '13608',
            resourceSetId: '16',
        }

        const expectedGuidanceResource = {
            resourceType: 'GUIDANCE',
            resourceId: '1045245',
            resourceSetId: '26665',
        }

        const expectedActionResource = {
            resourceType: 'ACTION',
            resourceId: '01J7KWHHMDY3H5S174D89VG7S3',
        }

        const expectedMacroResource = {
            resourceType: 'MACRO',
            resourceId: '67890',
            resourceSetId: '45',
        }

        const expectedFileExternalSnippetResource = {
            resourceType: 'FILE_EXTERNAL_SNIPPET',
            resourceId: '12345',
            resourceSetId: '78',
        }

        const expectedExternalSnippetResource = {
            resourceType: 'EXTERNAL_SNIPPET',
            resourceId: '54321',
            resourceSetId: '89',
        }

        const expectedOrderResource = {
            resourceType: 'ORDER',
            resourceId: '98765',
            resourceSetId: '99',
            resourceTitle: '#98765',
        }

        it.each([
            [
                'ARTICLE',
                'Some text {{ARTICLE::16::13608}} more text',
                [expectedArticleResource],
            ],
            [
                'GUIDANCE',
                'Text with {{GUIDANCE::26665::1045245}} guidance',
                [expectedGuidanceResource],
            ],
            [
                'ACTION',
                'Action {{ACTION::01J7KWHHMDY3H5S174D89VG7S3}} here',
                [expectedActionResource],
            ],
            [
                'MACRO',
                'Macro {{MACRO::45::67890}} content',
                [expectedMacroResource],
            ],
            [
                'FILE_EXTERNAL_SNIPPET',
                'File {{FILE_EXTERNAL_SNIPPET::78::12345}} snippet',
                [expectedFileExternalSnippetResource],
            ],
            [
                'EXTERNAL_SNIPPET',
                'External {{EXTERNAL_SNIPPET::89::54321}} snippet',
                [expectedExternalSnippetResource],
            ],
            [
                'ORDER',
                'Order {{ORDER::99::98765::#98765}} data',
                [expectedOrderResource],
            ],
        ])(
            'should parse %s resources correctly',
            (resourceType, content, expected) => {
                const result = parseReasoningResources(content)
                expect(result).toEqual(expected)
            },
        )

        it('should parse all resource types in a single string', () => {
            const content = `
                Test {{ARTICLE::16::13608}} {{GUIDANCE::26665::1045245}} 
                {{ACTION::01J7KWHHMDY3H5S174D89VG7S3}} {{MACRO::45::67890}} 
                {{FILE_EXTERNAL_SNIPPET::78::12345}} {{EXTERNAL_SNIPPET::89::54321}} 
                {{ORDER::99::98765::#98765}}
            `
            const result = parseReasoningResources(content)

            expect(result).toHaveLength(7)
            expect(result[0]).toEqual(expectedArticleResource)
            expect(result[1]).toEqual(expectedGuidanceResource)
            expect(result[2]).toEqual(expectedActionResource)
            expect(result[3]).toEqual(expectedMacroResource)
            expect(result[4]).toEqual(expectedFileExternalSnippetResource)
            expect(result[5]).toEqual(expectedExternalSnippetResource)
            expect(result[6]).toEqual(expectedOrderResource)
        })

        it('should return empty array when no resources found', () => {
            const content = 'This is just plain text with no resources'
            const result = parseReasoningResources(content)

            expect(result).toEqual([])
        })

        it('should return empty array for empty string', () => {
            const content = ''
            const result = parseReasoningResources(content)

            expect(result).toEqual([])
        })

        it('should handle malformed resource patterns', () => {
            const content =
                'Text {{INVALID::FORMAT}} and {{UNKNOWN::TYPE::123}} more text'
            const result = parseReasoningResources(content)

            expect(result).toEqual([])
        })

        it('should handle duplicate resources', () => {
            const content =
                'Text {{ARTICLE::16::13608}} and {{ARTICLE::16::13608}} again'
            const result = parseReasoningResources(content)

            expect(result).toEqual([
                expectedArticleResource,
                expectedArticleResource,
            ])
        })
    })
})
