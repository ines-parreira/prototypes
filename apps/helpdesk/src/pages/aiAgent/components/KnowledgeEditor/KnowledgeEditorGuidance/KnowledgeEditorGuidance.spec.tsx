import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import type { GuidanceTemplate } from 'pages/aiAgent/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidance } from './KnowledgeEditorGuidance'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({
        isOpen,
        onOpenChange,
        children,
    }: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="side-panel" data-is-open={isOpen}>
                <button
                    data-testid="close-panel-button"
                    onClick={() => onOpenChange(false)}
                >
                    Close
                </button>
                {children}
            </div>
        ) : null,
}))

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()
jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(() => ({
        error: mockNotifyError,
        success: mockNotifySuccess,
    })),
}))

const mockGuidanceTemplate: GuidanceTemplate = {
    id: 'test-template',
    name: 'Test Article',
    content: 'Test Content',
    tag: 'test-tag',
    style: {
        color: '#000000',
        background: '#FFFFFF',
    },
}

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({
        id: 1,
        name: 'FAQ Help Center',
        default_locale: 'en-US',
    })),
}))

const guidanceArticle = getGuidanceArticleFixture(1)
const guidanceArticle2 = getGuidanceArticleFixture(2)

const mockUseGuidanceArticle = jest.fn()
jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: (params: any) => mockUseGuidanceArticle(params),
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

const updateGuidanceArticle = jest.fn()
const createGuidanceArticle = jest.fn()
const duplicate = jest.fn()

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        updateGuidanceArticle,
        createGuidanceArticle,
        deleteGuidanceArticle: jest.fn(),
        duplicateGuidanceArticle: jest.fn(),
        duplicate,
        isGuidanceArticleUpdating: false,
        isGuidanceArticleDeleting: false,
        discardGuidanceDraft: jest.fn(),
        isDiscardingDraft: false,
    })),
}))

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="playground-panel">
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

jest.mock('domains/reporting/models/queryFactories/knowledge/resourceMetrics')
const mockedFetchResourceMetrics = jest.mocked(useResourceMetrics)

const mockUseStoreIntegrations = jest.mocked(useStoreIntegrations)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => jest.fn())

const queryClient = mockQueryClient()
const defaultState = {
    currentUser: fromJS({
        timezone: 'America/New_York',
    }),
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}
const store = mockStore(defaultState)

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
)

describe('KnowledgeEditorGuidance', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })
        updateGuidanceArticle.mockResolvedValue(guidanceArticle)
        createGuidanceArticle.mockResolvedValue(guidanceArticle)

        mockUseStoreIntegrations.mockReturnValue([])

        mockedFetchResourceMetrics.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                tickets: {
                    value: 156,
                    onClick: undefined,
                },
                handoverTickets: {
                    value: 12,
                    onClick: undefined,
                },
                csat: {
                    value: 4.53,
                    onClick: undefined,
                },
                intents: [
                    'Order/Status',
                    'Shipping/Inquiry',
                    'Product/Question',
                ],
            },
        })
    })

    it('renders in edit mode and allows publishing when viewing draft', async () => {
        // Set up a draft article (isCurrent: false) to enable publish button
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: {
                ...guidanceArticle,
                isCurrent: false,
            },
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="edit"
                    isOpen
                    onDelete={jest.fn()}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // In edit mode with draft, Publish button should be present
        const publishButton = screen.getByRole('button', { name: 'Publish' })
        expect(publishButton).toBeInTheDocument()
        expect(publishButton).not.toBeDisabled()

        await act(async () => {
            fireEvent.click(publishButton)
        })

        // Publish sets isCurrent: true
        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            { isCurrent: true },
            { articleId: guidanceArticle.id, locale: guidanceArticle.locale },
        )
    })

    it('toggles fullscreen mode in edit mode', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="edit"
                    isOpen
                    onDelete={jest.fn()}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'fullscreen' }))

        expect(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        )

        expect(
            screen.getByRole('button', { name: 'fullscreen' }),
        ).toBeInTheDocument()
    })

    it('fetches the content if guidanceArticleId is changed', () => {
        const { rerender } = render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="read"
                    isOpen
                    onDelete={jest.fn()}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        expect(screen.getByText(guidanceArticle.content)).toBeInTheDocument()
        expect(screen.getByText(guidanceArticle.title)).toBeInTheDocument()

        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: guidanceArticle2,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        rerender(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={2}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="read"
                    isOpen
                    onDelete={jest.fn()}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        expect(screen.getByText(guidanceArticle2.content)).toBeInTheDocument()
        expect(screen.getByText(guidanceArticle2.title)).toBeInTheDocument()
        expect(
            screen.queryByText(guidanceArticle.content),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(guidanceArticle.title),
        ).not.toBeInTheDocument()
    })

    it('renders in create mode when no guidanceArticleId provided', () => {
        // In create mode, no guidance article should be loaded
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        const { getByLabelText } = render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    onDelete={jest.fn()}
                    guidanceMode="create"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        expect(nameInput).toHaveValue('')
        // In create mode, Publish button is disabled (article not yet created)
        const publishButton = screen.getByRole('button', { name: 'Publish' })
        expect(publishButton).toBeDisabled()
        // Delete draft button is available
        expect(
            screen.getByRole('button', { name: 'delete draft' }),
        ).toBeInTheDocument()
    })

    it('renders create mode with template values pre-filled', () => {
        // In create mode with template, no article loaded
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    onDelete={jest.fn()}
                    guidanceMode="create"
                    guidanceTemplate={mockGuidanceTemplate}
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // Template name should be pre-filled
        const nameInput = screen.getByLabelText(/Guidance name/i)
        expect(nameInput).toHaveValue(mockGuidanceTemplate.name)

        // Template content should be visible in editor
        expect(
            screen.getByText(mockGuidanceTemplate.content),
        ).toBeInTheDocument()
    })

    it('shows AI agent status toggle is checked by default in create mode', () => {
        // In create mode, no article loaded
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onDelete={jest.fn()}
                    guidanceMode="create"
                    guidanceTemplate={mockGuidanceTemplate}
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // AI Agent status checkbox should be checked by default (visible to AI)
        expect(
            screen.getByRole('checkbox', { name: 'ai-agent-status' }),
        ).toBeChecked()
    })

    it('does not auto-save in create mode when form is invalid', () => {
        // In create mode, no article loaded
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onCreate={jest.fn()}
                    guidanceMode="create"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // Title is empty, content is empty - auto-save should not be triggered
        expect(createGuidanceArticle).not.toHaveBeenCalled()
    })

    it('calls onUpdate callback after successful article publish', async () => {
        const onUpdate = jest.fn()
        const updatedArticle = {
            ...guidanceArticle,
            title: 'Updated Title',
            isCurrent: true,
        }

        updateGuidanceArticle.mockResolvedValue(updatedArticle)

        // Set up a draft article (isCurrent: false) to enable publish button
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: {
                ...guidanceArticle,
                isCurrent: false,
            },
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onUpdate={onUpdate}
                    guidanceMode="edit"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        })

        await waitFor(() => {
            expect(onUpdate).toHaveBeenCalledTimes(1)
        })
    })

    it('shows delete and duplicate buttons in read mode', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onDelete={jest.fn()}
                    guidanceMode="read"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // Delete and duplicate buttons should be present in read mode
        expect(
            screen.getByRole('button', { name: 'delete' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument()
    })

    it('renders create mode with empty state', () => {
        // In create mode, no article loaded
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    guidanceMode="create"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // Title field should be empty
        const nameInput = screen.getByLabelText(/Guidance name/i)
        expect(nameInput).toHaveValue('')

        // Publish and Test buttons should be disabled in create mode
        expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'test' })).toBeDisabled()
    })

    it('disables Publish button when form is invalid in edit mode', () => {
        // Override the mock to return a draft article with empty content
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: {
                ...guidanceArticle,
                title: '',
                content: '',
                isCurrent: false,
            },
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    guidanceMode="edit"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        const publishButton = screen.getByRole('button', { name: 'Publish' })
        expect(publishButton).toBeDisabled()
    })

    it('closes editor when Discard is clicked with no changes in create mode', () => {
        // In create mode, no article loaded
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
        })

        const onClose = jest.fn()

        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={onClose}
                    guidanceMode="create"
                    isOpen={true}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        const deleteDraftButton = screen.getByRole('button', {
            name: 'delete draft',
        })
        act(() => {
            fireEvent.click(deleteDraftButton)
        })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('toggles ai agent status', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="edit"
                    isOpen
                    onDelete={jest.fn()}
                    guidanceArticles={[]}
                />
            </Provider>,
        )

        // Side panel is expanded by default (isDetailsView: true)
        // The AI agent status checkbox should be visible
        expect(
            screen.getByRole('checkbox', { name: 'ai-agent-status' }),
        ).toBeChecked()

        await act(async () => {
            fireEvent.click(
                screen.getByRole('checkbox', { name: 'ai-agent-status' }),
            )
        })

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            {
                visibility: 'UNLISTED',
                isCurrent: false,
            },
            { articleId: 1, locale: 'en-US' },
        )
    })

    describe('Split View - Playground Panel', () => {
        it('should toggle playground panel when test button is clicked', async () => {
            const { queryByTestId } = render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(queryByTestId('playground-panel')).not.toBeInTheDocument()

            const testButton = screen.getByRole('button', { name: /test/i })
            await act(async () => {
                fireEvent.click(testButton)
            })

            await waitFor(() => {
                expect(queryByTestId('playground-panel')).toBeInTheDocument()
            })

            await act(async () => {
                fireEvent.click(testButton)
            })

            await waitFor(() => {
                expect(
                    queryByTestId('playground-panel'),
                ).not.toBeInTheDocument()
            })
        })

        it('should render both editor and playground when test button is clicked', async () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(screen.getByText(guidanceArticle.title)).toBeInTheDocument()
            expect(
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()

            const testButton = screen.getByRole('button', { name: /test/i })
            await act(async () => {
                fireEvent.click(testButton)
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('playground-panel'),
                ).toBeInTheDocument()
            })

            expect(screen.getByText(guidanceArticle.title)).toBeInTheDocument()
        })

        it('should maintain editor content when playground is toggled', async () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            const articleTitle = screen.getByText(guidanceArticle.title)
            expect(articleTitle).toBeInTheDocument()

            const testButton = screen.getByRole('button', { name: /test/i })
            await act(async () => {
                fireEvent.click(testButton)
            })

            expect(articleTitle).toBeInTheDocument()

            await act(async () => {
                fireEvent.click(testButton)
            })

            expect(articleTitle).toBeInTheDocument()
        })

        it('should display playground alongside fullscreen mode', async () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            const fullscreenButton = screen.getByRole('button', {
                name: /fullscreen/i,
            })
            await act(async () => {
                fireEvent.click(fullscreenButton)
            })

            expect(
                screen.getByRole('button', { name: /leave fullscreen/i }),
            ).toBeInTheDocument()

            const testButton = screen.getByRole('button', { name: /test/i })
            await act(async () => {
                fireEvent.click(testButton)
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('playground-panel'),
                ).toBeInTheDocument()
            })

            expect(screen.getByText(guidanceArticle.title)).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /leave fullscreen/i }),
            ).toBeInTheDocument()
        })
    })

    describe('SidePanel onOpenChange', () => {
        it('calls onClose when SidePanel onOpenChange is triggered with false', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={onClose}
                        onClickPrevious={jest.fn()}
                        onClickNext={jest.fn()}
                        guidanceMode="read"
                        isOpen
                        onDelete={jest.fn()}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            const closeButton = screen.getByTestId('close-panel-button')
            await act(() => user.click(closeButton))

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('does not call onClose when SidePanel onOpenChange is triggered with true', () => {
            const onClose = jest.fn()

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={onClose}
                        onClickPrevious={jest.fn()}
                        onClickNext={jest.fn()}
                        guidanceMode="read"
                        isOpen
                        onDelete={jest.fn()}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(onClose).not.toHaveBeenCalled()
        })
    })

    describe('Impact Metrics', () => {
        it('calls useResourceMetrics with correct parameters', () => {
            render(
                <Wrapper>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        onClickPrevious={jest.fn()}
                        onClickNext={jest.fn()}
                        guidanceMode="read"
                        isOpen
                        onDelete={jest.fn()}
                        guidanceArticles={[]}
                    />
                </Wrapper>,
            )

            expect(mockedFetchResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 1,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
            })
        })

        it('displays impact section with loading state when data is not available', async () => {
            const useFlag = require('@repo/feature-flags').useFlag
            useFlag.mockReturnValue(true)

            mockedFetchResourceMetrics.mockReturnValue({
                isLoading: true,
                isError: false,
                data: undefined,
            })

            render(
                <Wrapper>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        onClickPrevious={jest.fn()}
                        onClickNext={jest.fn()}
                        guidanceMode="read"
                        isOpen
                        onDelete={jest.fn()}
                        guidanceArticles={[]}
                    />
                </Wrapper>,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(guidanceArticle.title),
                ).toBeInTheDocument()
            })

            expect(mockedFetchResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 1,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: true,
            })
        })
    })

    describe('isOpen behavior', () => {
        it('returns null when isOpen is false', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={false}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(container.firstChild).toBeNull()
        })

        it('renders content when isOpen is true', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(screen.getByTestId('side-panel')).toBeInTheDocument()
        })
    })

    describe('loading states', () => {
        it('shows loading spinner when guidance article is loading', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: true,
                refetch: jest.fn(),
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="edit"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(screen.getByRole('status')).toBeInTheDocument()
            expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument()
        })

        it('does not show loading spinner in create mode even without article', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        onClose={jest.fn()}
                        guidanceMode="create"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(screen.queryByRole('status')).not.toBeInTheDocument()
            expect(screen.getByTestId('side-panel')).toBeInTheDocument()
        })
    })

    describe('useGuidanceArticle hook parameters', () => {
        it('passes correct parameters when editing an article', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={42}
                        onClose={jest.fn()}
                        guidanceMode="edit"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(mockUseGuidanceArticle).toHaveBeenCalledWith({
                guidanceHelpCenterId: 1,
                guidanceArticleId: 42,
                locale: 'en-US',
                versionStatus: 'latest_draft',
                enabled: true,
            })
        })

        it('disables article fetching in create mode', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        onClose={jest.fn()}
                        guidanceMode="create"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(mockUseGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables article fetching when no guidanceArticleId is provided', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        onClose={jest.fn()}
                        guidanceMode="edit"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(mockUseGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    guidanceArticleId: 0,
                    enabled: false,
                }),
            )
        })
    })

    describe('config prop passing', () => {
        it('passes navigation callback props to config correctly in read mode', async () => {
            const user = userEvent.setup()
            const onClickPrevious = jest.fn()
            const onClickNext = jest.fn()

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        onClickPrevious={onClickPrevious}
                        onClickNext={onClickNext}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            const previousButton = screen.getByRole('button', {
                name: 'previous',
            })
            const nextButton = screen.getByRole('button', {
                name: 'next',
            })

            await act(() => user.click(previousButton))
            expect(onClickPrevious).toHaveBeenCalledTimes(1)

            await act(() => user.click(nextButton))
            expect(onClickNext).toHaveBeenCalledTimes(1)
        })

        it('hides navigation buttons when callbacks are not provided', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(
                screen.queryByRole('button', { name: 'previous' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'next' }),
            ).not.toBeInTheDocument()
        })

        it('hides navigation buttons in edit mode even when callbacks are provided', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        onClickPrevious={jest.fn()}
                        onClickNext={jest.fn()}
                        guidanceMode="edit"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            expect(
                screen.queryByRole('button', { name: 'previous' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'next' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('closeHandlerRef behavior', () => {
        it('prevents closing during autosave', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: {
                    ...guidanceArticle,
                    isCurrent: false,
                },
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
            })

            render(
                <Provider store={mockStore(defaultState)}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={onClose}
                        guidanceMode="edit"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            const nameInput = screen.getByLabelText(/Guidance name/i)
            await act(() => user.clear(nameInput))
            await act(() => user.type(nameInput, 'Modified Title'))

            await waitFor(() => {
                expect(nameInput).toHaveValue('Modified Title')
            })

            await waitFor(() => {
                expect(screen.getByText(/Saving/i)).toBeInTheDocument()
            })

            const closeButton = screen.getByTestId('close-panel-button')
            await act(() => user.click(closeButton))

            expect(onClose).not.toHaveBeenCalled()
            expect(
                screen.queryByRole('heading', { name: /Unsaved changes/i }),
            ).not.toBeInTheDocument()
        })

        it('allows closing after autosave completes with no pending changes', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: {
                    ...guidanceArticle,
                    isCurrent: false,
                },
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
            })

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={onClose}
                        guidanceMode="edit"
                        isOpen={true}
                        guidanceArticles={[]}
                    />
                </Provider>,
            )

            const nameInput = screen.getByLabelText(/Guidance name/i)
            await act(() => user.clear(nameInput))
            await act(() => user.type(nameInput, 'Modified Title'))

            await waitFor(() => {
                expect(nameInput).toHaveValue('Modified Title')
            })

            await waitFor(
                () => {
                    expect(
                        screen.queryByText(/Saving/i),
                    ).not.toBeInTheDocument()
                },
                { timeout: 3000 },
            )

            const closeButton = screen.getByTestId('close-panel-button')
            await act(() => user.click(closeButton))

            expect(onClose).toHaveBeenCalled()
            expect(
                screen.queryByRole('heading', { name: /Unsaved changes/i }),
            ).not.toBeInTheDocument()
        })
    })
})
