import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionLinkedIntents } from './KnowledgeEditorSidePanelSectionLinkedIntents'

type MockGuidanceStoreState = {
    guidanceArticle: {
        id: number
        locale: string
    }
    config: {
        guidanceHelpCenter: {
            id: number
        }
    }
    state: {
        guidance: {
            isCurrent: boolean
            publishedVersionId: number | null
            draftVersionId: number | null
        }
        historicalVersion: {
            versionId: number
            version: number
            title: string
            content: string
            publishedDatetime: string | null
        } | null
    }
}

const mockIntentGroups = [
    {
        name: 'Order',
        children: [
            {
                name: 'Order/status',
                intent: 'order-status',
                is_available: true,
            },
            {
                name: 'Order/cancel',
                intent: 'order-cancel',
                is_available: true,
            },
            {
                name: 'Order/missing item',
                intent: 'order-missing-item',
                is_available: false,
                used_by_article: {
                    id: 99,
                    title: 'Other guidance',
                    version: 3,
                },
            },
        ],
    },
    {
        name: 'Shipping',
        children: [
            {
                name: 'Shipping/delay',
                intent: 'shipping-delay',
                is_available: true,
            },
        ],
    },
]

const mockUseGetArticleTranslationIntents = jest.fn(
    () =>
        ({
            data: { intents: mockIntentGroups },
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        }) as {
            data: { intents: typeof mockIntentGroups } | undefined
            isLoading: boolean
            isError: boolean
            refetch: jest.Mock
        },
)

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationIntents: (...args: unknown[]) =>
        mockUseGetArticleTranslationIntents(...(args as [])),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    guidanceArticle: { id: 123, locale: 'en' },
    config: { guidanceHelpCenter: { id: 456 } },
    state: {
        guidance: {
            isCurrent: true,
            publishedVersionId: 789,
            draftVersionId: 789,
        },
        historicalVersion: null,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

const renderComponent = () =>
    render(
        <KnowledgeEditorSidePanel initialExpandedSections={['linked-intents']}>
            <KnowledgeEditorSidePanelSectionLinkedIntents sectionId="linked-intents" />
        </KnowledgeEditorSidePanel>,
    )

const getLinkedIntentsSectionRegion = () =>
    screen.getByRole('region', { name: /linked intents/i })

describe('KnowledgeEditorSidePanelSectionLinkedIntents', () => {
    beforeEach(() => {
        mockGuidanceStoreState = createMockGuidanceStoreState()
        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: { intents: mockIntentGroups },
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders empty state in side panel', () => {
        renderComponent()

        expect(screen.getByText('Linked intents')).toBeInTheDocument()
        expect(screen.getByText('No intents linked')).toBeInTheDocument()
        expect(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        ).toBeInTheDocument()
    })

    it('opens modal from section action', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('heading', { name: 'Link intents' }),
        ).toBeInTheDocument()
    })

    it('saves selected intents and displays them in section', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )

        const modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getAllByRole('checkbox', { name: 'Order/status' })[0],
        )
        await user.click(within(modal).getByRole('button', { name: 'Save' }))

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(screen.getByText(/Order\/status/)).toBeInTheDocument()
    })

    it('discards modal draft selection when canceling', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )
        let modal = screen.getByRole('dialog')

        await user.click(
            within(modal).getAllByRole('checkbox', { name: 'Order/cancel' })[0],
        )
        await user.click(within(modal).getByRole('button', { name: 'Cancel' }))

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(screen.getByText('No intents linked')).toBeInTheDocument()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )
        modal = screen.getByRole('dialog')

        expect(
            within(modal).getAllByRole('checkbox', { name: 'Order/cancel' })[0],
        ).not.toBeChecked()
    })

    it('discards draft selection when closing from modal top-right action', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )

        let modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getAllByRole('checkbox', { name: 'Order/status' })[0],
        )

        const dismissButton =
            within(modal).queryByRole('button', { name: 'Dismiss' }) ??
            within(modal).getByRole('button', { name: 'close' })
        await user.click(dismissButton)

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )
        modal = screen.getByRole('dialog')

        expect(
            within(modal).getAllByRole('checkbox', { name: 'Order/status' })[0],
        ).not.toBeChecked()
    })

    it('does not render the link intents button while viewing a historical version', () => {
        mockGuidanceStoreState = {
            ...mockGuidanceStoreState,
            state: {
                ...mockGuidanceStoreState.state,
                historicalVersion: {
                    versionId: 5,
                    version: 5,
                    title: 'Historical title',
                    content: 'Historical content',
                    publishedDatetime: '2025-06-17T00:00:00.000Z',
                },
            },
        }

        renderComponent()

        expect(
            within(getLinkedIntentsSectionRegion()).queryByRole('button', {
                name: /link intents/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('renders a disabled link intents button and tooltip when guidance was never published', async () => {
        const user = userEvent.setup()
        mockGuidanceStoreState = {
            ...mockGuidanceStoreState,
            state: {
                ...mockGuidanceStoreState.state,
                guidance: {
                    ...mockGuidanceStoreState.state.guidance,
                    publishedVersionId: null,
                    draftVersionId: null,
                },
            },
        }

        renderComponent()

        const linkIntentsButton = within(
            getLinkedIntentsSectionRegion(),
        ).getByRole('button', { name: /link intents/i })
        expect(linkIntentsButton).toBeDisabled()

        await user.hover(linkIntentsButton.parentElement as HTMLElement)

        expect(
            await screen.findByText(
                'Intents can only be linked when guidance is published and enabled for AI Agent.',
            ),
        ).toBeInTheDocument()
    })

    it('renders a disabled link intents button and draft tooltip when viewing a draft with a published version', async () => {
        const user = userEvent.setup()
        mockGuidanceStoreState = {
            ...mockGuidanceStoreState,
            state: {
                ...mockGuidanceStoreState.state,
                guidance: {
                    ...mockGuidanceStoreState.state.guidance,
                    isCurrent: false,
                    publishedVersionId: 100,
                    draftVersionId: 101,
                },
            },
        }

        renderComponent()

        const linkIntentsButton = within(
            getLinkedIntentsSectionRegion(),
        ).getByRole('button', { name: /link intents/i })
        expect(linkIntentsButton).toBeDisabled()

        await user.hover(linkIntentsButton.parentElement as HTMLElement)

        expect(
            await screen.findByText(
                "These intents are currently linked to the published version of this guidance. You'll be able to add more once this draft is published.",
            ),
        ).toBeInTheDocument()
    })

    it('asks for confirmation before unlinking an intent from the sidebar', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )

        const modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getAllByRole('checkbox', { name: 'Order/status' })[0],
        )
        await user.click(within(modal).getByRole('button', { name: 'Save' }))

        expect(screen.getByText(/Order\/status/)).toBeInTheDocument()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /close/i,
            }),
        )

        expect(
            screen.getByRole('heading', {
                name: 'Unlink intents from this guidance?',
            }),
        ).toBeInTheDocument()
        expect(screen.getByText(/Order\/status/)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(
            screen.queryByRole('heading', {
                name: 'Unlink intents from this guidance?',
            }),
        ).not.toBeInTheDocument()
        expect(screen.getByText(/Order\/status/)).toBeInTheDocument()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /close/i,
            }),
        )
        await user.click(screen.getByRole('button', { name: 'Unlink' }))

        expect(screen.queryByText(/Order\/status/)).not.toBeInTheDocument()
    })
})
