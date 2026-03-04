import { logEvent, SegmentEvent } from '@repo/logging'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGuidanceTemplates } from 'pages/aiAgent/hooks/useGuidanceTemplates'

import { OPEN_CREATE_GUIDANCE_ARTICLE_MODAL } from '../constants'
import { AddGuidanceTemplateModal } from './AddGuidanceTemplateModal'
import { dispatchDocumentEvent } from './utils'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentGuidanceCardClicked: 'ai_agent_guidance_card_clicked',
    },
}))

jest.mock('pages/aiAgent/hooks/useGuidanceTemplates')
jest.mock(
    'pages/aiAgent/components/GuidanceTemplateCard/GuidanceTemplateCard',
    () => ({
        GuidanceTemplateCard: ({ onClick, guidanceTemplate }: any) => (
            <div
                onClick={onClick}
                data-testid={`template-${guidanceTemplate.id}`}
            >
                {guidanceTemplate.name}
            </div>
        ),
    }),
)

const mockUseGuidanceTemplates = useGuidanceTemplates as jest.MockedFunction<
    typeof useGuidanceTemplates
>
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('AddGuidanceTemplateModal', () => {
    const mockOnTemplateSelect = jest.fn()

    const mockTemplates = [
        {
            id: '1',
            name: 'Return Policy Template',
            description: 'Handle returns',
            content: 'Return policy content',
            tag: 'return',
            style: { color: '#000', background: '#fff' },
        },
        {
            id: '2',
            name: 'Shipping Policy Template',
            description: 'Handle shipping',
            content: 'Shipping policy content',
            tag: 'shipping',
            style: { color: '#000', background: '#fff' },
        },
        {
            id: '3',
            name: 'Refund Policy Template',
            description: 'Handle refunds',
            content: 'Refund policy content',
            tag: 'refund',
            style: { color: '#000', background: '#fff' },
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGuidanceTemplates.mockReturnValue({
            guidanceTemplates: mockTemplates,
        })
    })

    const renderComponent = () => {
        return render(
            <AddGuidanceTemplateModal
                onTemplateSelect={mockOnTemplateSelect}
            />,
        )
    }

    describe('modal visibility', () => {
        it('opens modal when OPEN_CREATE_GUIDANCE_ARTICLE_MODAL event is dispatched', async () => {
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Create Guidance' }),
            ).not.toBeInTheDocument()

            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create Guidance' }),
                ).toBeInTheDocument()
            })
        })

        it('closes modal when OPEN_CREATE_GUIDANCE_ARTICLE_MODAL event is dispatched again', async () => {
            renderComponent()

            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create Guidance' }),
                ).toBeInTheDocument()
            })

            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create Guidance' }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('template selection', () => {
        beforeEach(async () => {
            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create Guidance' }),
                ).toBeInTheDocument()
            })
        })

        it('calls onTemplateSelect with selected template and closes modal when template is clicked', async () => {
            const user = userEvent.setup()

            await act(() => user.click(screen.getByTestId('template-1')))

            await waitFor(() => {
                expect(mockOnTemplateSelect).toHaveBeenCalledWith(
                    mockTemplates[0],
                )
                expect(mockOnTemplateSelect).toHaveBeenCalledTimes(1)
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create Guidance' }),
                ).not.toBeInTheDocument()
            })
        })

        it('logs template selection event when template is clicked', async () => {
            const user = userEvent.setup()

            await act(() => user.click(screen.getByTestId('template-2')))

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentGuidanceCardClicked,
                    {
                        source: 'empty',
                        type: 'template',
                        name: 'Shipping Policy Template',
                    },
                )
            })
        })

        it('calls onTemplateSelect with undefined and closes modal when custom guidance is clicked', async () => {
            const user = userEvent.setup()

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /Custom Guidance/ }),
                ),
            )

            await waitFor(() => {
                expect(mockOnTemplateSelect).toHaveBeenCalledWith(undefined)
                expect(mockOnTemplateSelect).toHaveBeenCalledTimes(1)
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create Guidance' }),
                ).not.toBeInTheDocument()
            })
        })

        it('logs custom guidance event when custom guidance is clicked', async () => {
            const user = userEvent.setup()

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /Custom Guidance/ }),
                ),
            )

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentGuidanceCardClicked,
                    {
                        source: 'empty',
                        type: 'custom',
                    },
                )
            })
        })
    })

    describe('templates display', () => {
        it('displays custom guidance card', async () => {
            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /Custom Guidance/ }),
                ).toBeInTheDocument()
            })
        })

        it('displays all templates', async () => {
            const manyTemplates = Array.from({ length: 12 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Template ${i + 1}`,
                description: `Description ${i + 1}`,
                content: `Content ${i + 1}`,
                tag: `tag-${i + 1}`,
                style: { color: '#000', background: '#fff' },
            }))

            mockUseGuidanceTemplates.mockReturnValue({
                guidanceTemplates: manyTemplates,
            })

            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(screen.getByText('Template 1')).toBeInTheDocument()
                expect(screen.getByText('Template 12')).toBeInTheDocument()
            })
        })

        it('displays all templates when fewer than 8 exist', async () => {
            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByText('Return Policy Template'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Shipping Policy Template'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Refund Policy Template'),
                ).toBeInTheDocument()
            })
        })

        it('displays descriptive text about templates', async () => {
            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Use our pre-built templates as a starting point or build your own guidance from scratch.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('displays help center link in footer', async () => {
            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.getByText('Not sure where to start?'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(/Explore our Help Center/),
                ).toBeInTheDocument()
            })
        })
    })

    describe('edge cases', () => {
        it('does not render template list when no templates are available', async () => {
            mockUseGuidanceTemplates.mockReturnValue({
                guidanceTemplates: [],
            })

            renderComponent()
            dispatchDocumentEvent(OPEN_CREATE_GUIDANCE_ARTICLE_MODAL)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create Guidance' }),
                ).not.toBeInTheDocument()
            })
        })
    })
})
