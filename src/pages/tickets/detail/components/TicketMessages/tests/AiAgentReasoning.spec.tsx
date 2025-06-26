import { act, fireEvent, render, screen } from '@testing-library/react'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
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
        useGetResourcesReasoningMetadata: jest.fn(() => ({
            data: [],
        })),
    }),
)

const useAppDispatchMock = assumeMock(useAppDispatch)
const useAppSelectorMock = assumeMock(useAppSelector)

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
    })

    const renderComponent = (props: any = {}) => {
        const store = mockStore({})
        return render(
            <Provider store={store}>
                <AiAgentReasoning messageId={1} {...props} />
            </Provider>,
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
            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.getByText('Loading reasoning...')).toBeInTheDocument()
            expect(document.querySelector('.material-icons')).toHaveTextContent(
                'auto_awesome',
            )
        })

        it('should transition to expanded state after loading timer', () => {
            renderComponent()

            const showReasoningButton = screen.getByText('Show reasoning')
            fireEvent.click(showReasoningButton)

            expect(screen.getByText('Loading reasoning...')).toBeInTheDocument()

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            expect(screen.getByText('Hide reasoning')).toBeInTheDocument()
            expect(
                screen.queryByText('Loading reasoning...'),
            ).not.toBeInTheDocument()
        })

        it('should not be clickable during loading', () => {
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
                screen.getByTestId('knowledge-source-icon-article'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-guidance'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-action'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-macro'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-external_snippet'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-link'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-order'),
            ).toBeInTheDocument()
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

            const articlePopover = screen.getByTestId(
                'knowledge-source-popover-ARTICLE',
            )
            expect(articlePopover).toHaveAttribute(
                'data-title',
                'Cheirosa 68 Beija Flor™ Perfume Mist - Product Guide',
            )
            expect(articlePopover).toHaveAttribute(
                'data-url',
                'https://artemisathletix.gorgias.help/en-us/articles/13608-cheirosa-68-beija-flor-perfume-mist-guide',
            )

            const guidancePopover = screen.getByTestId(
                'knowledge-source-popover-GUIDANCE',
            )
            expect(guidancePopover).toHaveAttribute(
                'data-title',
                'Sales Guidance: Perfume Mist Recommendations',
            )
            expect(guidancePopover).toHaveAttribute(
                'data-url',
                '/app/aiagent/artemisathletix/guidance/1045245/edit',
            )

            const actionPopover = screen.getByTestId(
                'knowledge-source-popover-ACTION',
            )
            expect(actionPopover).toHaveAttribute(
                'data-title',
                'Suggest Complementary Products',
            )
            expect(actionPopover).toHaveAttribute(
                'data-url',
                '/app/aiagent/artemisathletix/actions/01J7KWHHMDY3H5S174D89VG7S3/edit',
            )

            const macroPopover = screen.getByTestId(
                'knowledge-source-popover-MACRO',
            )
            expect(macroPopover).toHaveAttribute(
                'data-title',
                'Customer Confusion Response Macro',
            )
            expect(macroPopover).toHaveAttribute(
                'data-url',
                '/app/macros/67890/edit',
            )

            const fileExternalSnippetPopover = screen.getByTestId(
                'knowledge-source-popover-FILE_EXTERNAL_SNIPPET',
            )
            expect(fileExternalSnippetPopover).toHaveAttribute(
                'data-title',
                'Product Specification Document',
            )
            expect(fileExternalSnippetPopover).toHaveAttribute(
                'data-url',
                '/app/files/external/12345/view',
            )

            const externalSnippetPopover = screen.getByTestId(
                'knowledge-source-popover-EXTERNAL_SNIPPET',
            )
            expect(externalSnippetPopover).toHaveAttribute(
                'data-title',
                'Fragrance Pairing Guide - External Link',
            )
            expect(externalSnippetPopover).toHaveAttribute(
                'data-url',
                'https://example-beauty-site.com/fragrance-pairing-guide',
            )

            const orderPopover = screen.getByTestId(
                'knowledge-source-popover-ORDER',
            )
            expect(orderPopover).toHaveAttribute(
                'data-title',
                'Order #98765 - Previous Purchase Data',
            )
            expect(orderPopover).toHaveAttribute(
                'data-url',
                '/app/orders/98765/details',
            )
        })

        it('should render different knowledge source icon types correctly', () => {
            renderComponent()
            expandComponent()

            expect(
                screen.getByTestId('knowledge-source-icon-article'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-guidance'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-action'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-macro'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-external_snippet'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-link'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('knowledge-source-icon-order'),
            ).toBeInTheDocument()
        })
    })

    describe('Props handling', () => {
        it('should handle undefined messageId prop', () => {
            renderComponent({ messageId: undefined })

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
