import type { ReactNode } from 'react'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionLinkedIntents } from './KnowledgeEditorSidePanelSectionLinkedIntents'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: ReactNode
        children: ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const mockUpdateGuidanceArticle = jest.fn()
const mockNotifyError = jest.fn()

type MockGuidanceStoreState = {
    guidanceArticle: {
        id: number
        locale: string
    }
    config: {
        guidanceHelpCenter: {
            id: number
        }
        onUpdateFn?: jest.Mock
    }
    dispatch: jest.Mock
    state: {
        guidance: {
            id: number
            locale: string
            title: string
            content: string
            templateKey: string | null
            isCurrent: boolean
            publishedVersionId: number | null
            draftVersionId: number | null
            intents?: string[] | null
        }
        historicalVersion: {
            versionId: number
            version: number
            title: string
            content: string
            publishedDatetime: string | null
        } | null
        isUpdating: boolean
        isAutoSaving: boolean
    }
}

const mockIntentGroups = [
    {
        name: 'Order',
        children: [
            {
                name: 'status',
                intent: 'order::status',
                is_available: true,
            },
            {
                name: 'cancel',
                intent: 'order::cancel',
                is_available: true,
            },
            {
                name: 'missing item',
                intent: 'order::missing-item',
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
                name: 'delay',
                intent: 'shipping::delay',
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

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        getLast28DaysDateRange: jest.fn(() => ({
            start_datetime: '2025-01-01T00:00:00.000Z',
            end_datetime: '2025-01-28T00:00:00.000Z',
        })),
    }),
)

const mockUseResourceMetrics = useResourceMetrics as jest.Mock

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationIntents: (...args: unknown[]) =>
        mockUseGetArticleTranslationIntents(...(args as [])),
}))

jest.mock('hooks/useNotify', () => ({
    useNotify: () => ({
        error: mockNotifyError,
    }),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => 'UTC'),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
    }),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'test-shop' }),
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
    config: { guidanceHelpCenter: { id: 456 }, onUpdateFn: jest.fn() },
    dispatch: jest.fn(),
    state: {
        guidance: {
            id: 123,
            locale: 'en',
            title: 'Guidance title',
            content: 'Guidance content',
            templateKey: null,
            isCurrent: true,
            publishedVersionId: 789,
            draftVersionId: 789,
            intents: [],
        },
        historicalVersion: null,
        isUpdating: false,
        isAutoSaving: false,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

const createUpdateResponse = (intents: string[]) => ({
    title: mockGuidanceStoreState.state.guidance.title,
    content: mockGuidanceStoreState.state.guidance.content,
    locale: mockGuidanceStoreState.state.guidance.locale,
    visibility_status: 'PUBLIC' as const,
    created_datetime: '2025-01-01T00:00:00.000Z',
    updated_datetime: '2025-01-02T00:00:00.000Z',
    draft_version_id: 789,
    published_version_id: 789,
    is_current: true,
    intents,
})

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
        mockGuidanceStoreState.dispatch.mockImplementation((action) => {
            if (
                action.type === 'MARK_AS_SAVED' &&
                action.payload?.guidance !== undefined
            ) {
                mockGuidanceStoreState.state.guidance = action.payload.guidance
                return
            }

            if (action.type === 'SET_UPDATING') {
                mockGuidanceStoreState.state.isUpdating = action.payload
            }
        })

        mockUseGetArticleTranslationIntents.mockReturnValue({
            data: { intents: mockIntentGroups },
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })
        mockUseResourceMetrics.mockReturnValue({
            data: {
                intents: [],
            },
            isLoading: false,
            isError: false,
        })
        mockUpdateGuidanceArticle.mockImplementation(
            async ({ intents }: { intents?: string[] | null }) =>
                createUpdateResponse(intents ?? []),
        )
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

    it('renders intents from guidance data', () => {
        mockGuidanceStoreState.state.guidance.intents = ['order::status']

        renderComponent()

        expect(screen.getByText('order/status')).toBeInTheDocument()
        expect(screen.queryByText('No intents linked')).not.toBeInTheDocument()
    })

    it('shows only the first 3 intents and toggles the rest with see more/less', async () => {
        const user = userEvent.setup()
        mockGuidanceStoreState.state.guidance.intents = [
            'order::status',
            'order::cancel',
            'order::missing-item',
            'shipping::delay',
        ]

        renderComponent()

        const linkedIntentsSection = getLinkedIntentsSectionRegion()

        expect(
            within(linkedIntentsSection).getByText('order/status'),
        ).toBeInTheDocument()
        expect(
            within(linkedIntentsSection).getByText('order/cancel'),
        ).toBeInTheDocument()
        expect(
            within(linkedIntentsSection).getByText('order/missing-item'),
        ).toBeInTheDocument()
        expect(
            within(linkedIntentsSection).queryByText('shipping/delay'),
        ).not.toBeInTheDocument()

        await user.click(
            within(linkedIntentsSection).getByRole('button', {
                name: /view all/i,
            }),
        )

        expect(
            within(linkedIntentsSection).getByText('shipping/delay'),
        ).toBeInTheDocument()
        expect(
            within(linkedIntentsSection).getByRole('button', {
                name: /view less/i,
            }),
        ).toBeInTheDocument()

        await user.click(
            within(linkedIntentsSection).getByRole('button', {
                name: /view less/i,
            }),
        )

        expect(
            within(linkedIntentsSection).queryByText('shipping/delay'),
        ).not.toBeInTheDocument()
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

    it('saves selected intents through API and displays them in section', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /link intents/i,
            }),
        )

        const modal = screen.getByRole('dialog')
        await user.click(
            within(modal).getAllByRole('checkbox', { name: 'order/status' })[0],
        )
        await user.click(within(modal).getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    intents: ['order::status'],
                    isCurrent: false,
                },
                {
                    articleId: 123,
                    locale: 'en',
                },
            )
        })
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(screen.getByText('order/status')).toBeInTheDocument()
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
            within(modal).getAllByRole('checkbox', { name: 'order/cancel' })[0],
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
            within(modal).getAllByRole('checkbox', { name: 'order/cancel' })[0],
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
            within(modal).getAllByRole('checkbox', { name: 'order/status' })[0],
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
            within(modal).getAllByRole('checkbox', { name: 'order/status' })[0],
        ).not.toBeChecked()
    })

    it('renders a disabled link intents button and tooltip when viewing a historical version', async () => {
        const user = userEvent.setup()
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

        const linkIntentsButton = within(
            getLinkedIntentsSectionRegion(),
        ).getByRole('button', { name: /link intents/i })
        expect(linkIntentsButton).toBeDisabled()

        await user.hover(linkIntentsButton.parentElement as HTMLElement)

        expect(
            await screen.findByText(
                'You are viewing a past version. Switch to the latest version to link intents.',
            ),
        ).toBeInTheDocument()
    })

    it('enables the link intents button when guidance was never published', () => {
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
        expect(linkIntentsButton).toBeEnabled()
    })

    it('renders a disabled link intents button and tooltip when viewing a published version with a draft', async () => {
        const user = userEvent.setup()
        mockGuidanceStoreState = {
            ...mockGuidanceStoreState,
            state: {
                ...mockGuidanceStoreState.state,
                guidance: {
                    ...mockGuidanceStoreState.state.guidance,
                    isCurrent: true,
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
                'A draft of this guidance exists. Switch to the draft to link intents.',
            ),
        ).toBeInTheDocument()
    })

    it('enables the link intents button when viewing a draft with a published version', () => {
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
        expect(linkIntentsButton).toBeEnabled()
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
            within(modal).getAllByRole('checkbox', { name: 'order/status' })[0],
        )
        await user.click(within(modal).getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(screen.getByText('order/status')).toBeInTheDocument()
        })

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
        expect(screen.getByText(/order\/status/)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(
            screen.queryByRole('heading', {
                name: 'Unlink intents from this guidance?',
            }),
        ).not.toBeInTheDocument()
        expect(screen.getByText(/order\/status/)).toBeInTheDocument()

        await user.click(
            within(getLinkedIntentsSectionRegion()).getByRole('button', {
                name: /close/i,
            }),
        )
        await user.click(screen.getByRole('button', { name: 'Unlink' }))

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenLastCalledWith(
                {
                    intents: [],
                    isCurrent: false,
                },
                {
                    articleId: 123,
                    locale: 'en',
                },
            )
        })
        expect(screen.queryByText('order/status')).not.toBeInTheDocument()
    })
})
