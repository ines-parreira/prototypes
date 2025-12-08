import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import type { GuidanceTemplate } from 'pages/aiAgent/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
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
jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(() => ({
        error: mockNotifyError,
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

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        updateGuidanceArticle,
        createGuidanceArticle,
        deleteGuidanceArticle: jest.fn(),
        duplicateGuidanceArticle: jest.fn(),
        isGuidanceArticleUpdating: false,
    })),
}))

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="playground-panel">
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

describe('KnowledgeEditorGuidance', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle,
            isGuidanceArticleLoading: false,
        })
        updateGuidanceArticle.mockResolvedValue(guidanceArticle)
        createGuidanceArticle.mockResolvedValue(guidanceArticle)
    })

    it('renders in edit mode and allows editing', () => {
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
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
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        act(() => {
            fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
            fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        })

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            mapGuidanceFormFieldsToGuidanceArticle(
                {
                    name: 'Updated Name',
                    content: guidanceArticle.content,
                    isVisible: true,
                },
                guidanceArticle.locale,
            ),
            { articleId: guidanceArticle.id, locale: guidanceArticle.locale },
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
            <Provider store={mockStore({})}>
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
                />
            </Provider>,
        )

        expect(screen.getByText(guidanceArticle.content)).toBeInTheDocument()
        expect(screen.getByText(guidanceArticle.title)).toBeInTheDocument()

        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: guidanceArticle2,
            isGuidanceArticleLoading: false,
        })

        rerender(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={2}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="edit"
                    isOpen
                    onDelete={jest.fn()}
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
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    onDelete={jest.fn()}
                    guidanceMode="create"
                    isOpen={true}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        expect(nameInput).toHaveValue('')
        expect(
            screen.getByRole('button', { name: 'Create' }),
        ).toBeInTheDocument()
    })

    it('transitions from create mode to edit mode after article creation', async () => {
        const newArticle = {
            ...guidanceArticle,
            id: 999,
            translation: {
                title: 'New Article',
                content: 'New Content',
                visibility: 'PUBLIC',
            },
        }

        createGuidanceArticle.mockResolvedValue(newArticle)
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: getGuidanceArticleFixture(999, {
                title: 'New Article',
                content: 'New Content',
            }),
            isGuidanceArticleLoading: false,
        })

        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
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
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        await act(async () => {
            fireEvent.change(nameInput, { target: { value: 'New Article' } })
            fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        })

        expect(createGuidanceArticle).toHaveBeenCalled()

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: 'Create' }),
            ).not.toBeInTheDocument()
        })
    })

    it('tracks AI Agent enabled state in create mode', () => {
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onDelete={jest.fn()}
                    guidanceMode="create"
                    guidanceTemplate={mockGuidanceTemplate}
                    isOpen={true}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        fireEvent.change(nameInput, { target: { value: 'Test Article' } })

        const createButton = screen.getByRole('button', { name: 'Create' })
        act(() => {
            fireEvent.click(createButton)
        })

        expect(createGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({
                title: mockGuidanceTemplate.name,
                content: mockGuidanceTemplate.content,
                visibility: 'PUBLIC',
                locale: 'en-US',
            }),
        )
    })

    it('calls onCreate callback after successful article creation', async () => {
        const onCreate = jest.fn()
        const newArticle = {
            ...guidanceArticle,
            id: 999,
            translation: {
                title: 'New Article',
                content: 'New Content',
                visibility: 'PUBLIC',
            },
        }

        createGuidanceArticle.mockRejectedValue(
            new Error('Failed to create article'),
        )

        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    onCreate={onCreate}
                    guidanceMode="create"
                    guidanceTemplate={mockGuidanceTemplate}
                    isOpen={true}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        await act(async () => {
            fireEvent.change(nameInput, { target: { value: 'New Article' } })
            fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        })

        await waitFor(() => {
            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while creating guidance.',
            )
            expect(onCreate).not.toHaveBeenCalled()
        })

        createGuidanceArticle.mockResolvedValue(newArticle)
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        })

        await waitFor(() => {
            expect(onCreate).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onUpdate callback after successful article update', async () => {
        const onUpdate = jest.fn()
        const updatedArticle = {
            ...guidanceArticle,
            title: 'Updated Title',
        }

        updateGuidanceArticle.mockResolvedValue(updatedArticle)

        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onUpdate={onUpdate}
                    guidanceMode="edit"
                    isOpen={true}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        await act(async () => {
            fireEvent.change(nameInput, { target: { value: 'Updated Title' } })
            fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        })

        await waitFor(() => {
            expect(onUpdate).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onDelete callback after successful article deletion', async () => {
        const onDelete = jest.fn()
        const deleteGuidanceArticle = jest
            .fn()
            .mockRejectedValue(new Error('Failed to delete guidance'))

        jest.mocked(
            require('pages/aiAgent/hooks/useGuidanceArticleMutation')
                .useGuidanceArticleMutation,
        ).mockReturnValue({
            updateGuidanceArticle,
            createGuidanceArticle,
            deleteGuidanceArticle,
            duplicateGuidanceArticle: jest.fn(),
            isGuidanceArticleUpdating: false,
        })

        const { getByRole } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onDelete={onDelete}
                    guidanceMode="read"
                    isOpen={true}
                />
            </Provider>,
        )

        await act(async () => {
            fireEvent.click(getByRole('button', { name: 'delete' }))
        })

        await waitFor(() => {
            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while deleting guidance.',
            )
            expect(onDelete).not.toHaveBeenCalled()
        })

        mockNotifyError.mockClear()

        deleteGuidanceArticle.mockResolvedValue(undefined)

        await act(async () => {
            fireEvent.click(getByRole('button', { name: 'delete' }))
        })

        await waitFor(() => {
            expect(mockNotifyError).not.toHaveBeenCalled()
            expect(deleteGuidanceArticle).toHaveBeenCalledWith(1)
            expect(onDelete).toHaveBeenCalledTimes(1)
        })
    })

    it('does not call onCreate when callback is not provided', async () => {
        const newArticle = {
            ...guidanceArticle,
            id: 999,
            translation: {
                title: 'New Article',
                content: 'New Content',
                visibility: 'PUBLIC',
            },
        }

        createGuidanceArticle.mockResolvedValue(newArticle)

        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    guidanceMode="create"
                    guidanceTemplate={mockGuidanceTemplate}
                    isOpen={true}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        await act(async () => {
            fireEvent.change(nameInput, { target: { value: 'New Article' } })
            fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        })

        expect(createGuidanceArticle).toHaveBeenCalled()
    })

    it('calls onCopy callback after successful article duplication', async () => {
        const onCopy = jest.fn()
        let capturedOnDuplicate: (() => Promise<void>) | undefined

        const duplicateGuidanceArticle = jest.fn().mockResolvedValue(undefined)

        jest.mocked(
            require('pages/aiAgent/hooks/useGuidanceArticleMutation')
                .useGuidanceArticleMutation,
        ).mockReturnValue({
            updateGuidanceArticle,
            createGuidanceArticle,
            deleteGuidanceArticle: jest.fn(),
            duplicateGuidanceArticle,
            isGuidanceArticleUpdating: false,
        })

        const mockSpy = jest
            .spyOn(
                require('./KnowledgeEditorGuidanceView'),
                'KnowledgeEditorGuidanceView',
            )
            .mockImplementation((props: any) => {
                capturedOnDuplicate = props.onDuplicate
                return null
            })

        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onCopy={onCopy}
                    guidanceMode="read"
                    isOpen={true}
                />
            </Provider>,
        )

        await waitFor(() => {
            expect(capturedOnDuplicate).toBeDefined()
        })

        await act(async () => {
            await capturedOnDuplicate!()
        })

        expect(duplicateGuidanceArticle).toHaveBeenCalledWith(1, 'Test Shop')
        expect(onCopy).toHaveBeenCalledTimes(1)

        mockSpy.mockRestore()
    })

    it('disables Create button when title is empty', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    guidanceMode="create"
                    isOpen={true}
                />
            </Provider>,
        )

        const createButton = screen.getByRole('button', { name: 'Create' })
        expect(createButton).toBeDisabled()
    })

    it('disables Create button when content is empty', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={jest.fn()}
                    guidanceMode="create"
                    isOpen={true}
                />
            </Provider>,
        )

        const createButton = screen.getByRole('button', { name: 'Create' })
        expect(createButton).toBeDisabled()
    })

    it('disables Save button when no changes are made in edit mode', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    guidanceMode="edit"
                    isOpen={true}
                />
            </Provider>,
        )

        const saveButton = screen.getByRole('button', { name: 'Save' })
        expect(saveButton).toBeDisabled()
    })

    it('closes editor when Cancel is clicked with no changes in create mode', () => {
        const onClose = jest.fn()

        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    onClose={onClose}
                    guidanceMode="create"
                    isOpen={true}
                />
            </Provider>,
        )

        const cancelButton = screen.getByRole('button', { name: 'cancel' })
        act(() => {
            fireEvent.click(cancelButton)
        })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('toggles ai agent status', () => {
        const { rerender } = render(
            <Provider store={mockStore({})}>
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
                />
            </Provider>,
        )

        fireEvent.click(
            screen.getByRole('button', { name: 'expand side panel' }),
        )

        rerender(
            <Provider store={mockStore({})}>
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
                />
            </Provider>,
        )

        expect(
            screen.getByRole('checkbox', { name: 'ai-agent-status' }),
        ).toBeChecked()

        fireEvent.click(
            screen.getByRole('checkbox', { name: 'ai-agent-status' }),
        )

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({
                content: 'Content 1',
                locale: 'en-US',
                templateKey: null,
                title: 'Title 1',
                visibility: 'UNLISTED',
            }),
            { articleId: 1, locale: 'en-US' },
        )
    })

    describe('Split View - Playground Panel', () => {
        it('should toggle playground panel when test button is clicked', async () => {
            const { queryByTestId } = render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
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
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
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
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
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
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidance
                        shopName="Test Shop"
                        shopType="Test Shop Type"
                        guidanceArticleId={1}
                        onClose={jest.fn()}
                        guidanceMode="read"
                        isOpen={true}
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
                <Provider store={mockStore({})}>
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
                <Provider store={mockStore({})}>
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
                    />
                </Provider>,
            )

            expect(onClose).not.toHaveBeenCalled()
        })
    })
})
