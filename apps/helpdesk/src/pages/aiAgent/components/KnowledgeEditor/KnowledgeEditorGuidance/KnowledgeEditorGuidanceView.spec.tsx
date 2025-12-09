import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidanceView } from './KnowledgeEditorGuidanceView'

describe('KnowledgeEditorGuidanceView', () => {
    const defaultProps = {
        onClose: jest.fn(),
        onClickPrevious: jest.fn(),
        onClickNext: jest.fn(),
        availableActions: [
            {
                name: 'Test action',
                value: 'test-action',
            },
        ],
        availableVariables: [
            {
                name: 'Test variable',
                variables: [],
            },
        ],
        onSave: jest.fn(),
        onCreate: jest.fn(),
        onDelete: jest.fn(),
        onDuplicate: jest.fn(),
        title: 'Test Title',
        content: 'Test Content',
        aiAgentEnabled: true,
        onToggleAIAgentEnabled: jest.fn(),
        shopName: 'Test Shop',
        createdDatetime: new Date(),
        lastUpdatedDatetime: new Date(),
        onChangeTitle: jest.fn(),
        onChangeContent: jest.fn(),
        isGuidanceArticleUpdating: false,
        isFullscreen: false,
        onToggleFullscreen: jest.fn(),
        onTest: jest.fn(),
        closeHandlerRef: { current: null } as React.MutableRefObject<
            (() => void) | null
        >,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders in read mode', () => {
        const { container } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    guidanceMode="read"
                />
            </Provider>,
        )

        expect(
            container.querySelector('[class*="knowledgeEditor"]'),
        ).toBeInTheDocument()
    })

    it('renders in edit mode', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    guidanceMode="edit"
                />
            </Provider>,
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'cancel' }),
        ).toBeInTheDocument()
    })

    it('renders in create mode', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    title=""
                    content=""
                    guidanceMode="create"
                    createdDatetime={undefined}
                    lastUpdatedDatetime={undefined}
                />
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: 'Create' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'cancel' }),
        ).toBeInTheDocument()
    })

    it('calls onCreate when Create button is clicked', async () => {
        const onCreate = jest.fn()
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    title="New Title"
                    content="New Content"
                    onCreate={onCreate}
                    guidanceMode="create"
                    createdDatetime={undefined}
                    lastUpdatedDatetime={undefined}
                />
            </Provider>,
        )

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        })

        expect(onCreate).toHaveBeenCalledWith({
            name: 'New Title',
            content: 'New Content',
            isVisible: true,
        })
    })

    it('switches to read mode after successful create', async () => {
        const onCreate = jest.fn().mockReturnValue({
            data: {
                id: 1,
                title: 'New Title',
                content: 'New Content',
                isVisible: true,
            },
        })

        const { rerender, container } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    onCreate={onCreate}
                    guidanceMode="create"
                    createdDatetime={undefined}
                    lastUpdatedDatetime={undefined}
                />
            </Provider>,
        )

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        })

        rerender(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    onCreate={onCreate}
                    guidanceMode="read"
                />
            </Provider>,
        )

        expect(
            screen.queryByRole('button', { name: 'Create' }),
        ).not.toBeInTheDocument()
        expect(
            container.querySelector('[class*="knowledgeEditor"]'),
        ).toBeInTheDocument()
    })

    it('disables Save button when no changes are made in edit mode', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    guidanceMode="edit"
                />
            </Provider>,
        )

        const saveButton = screen.getByRole('button', { name: 'Save' })
        expect(saveButton).toBeDisabled()
    })

    it('closes editor when Cancel is clicked without changes in edit mode', () => {
        const onClose = jest.fn()

        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    onClose={onClose}
                    guidanceMode="edit"
                />
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'cancel' }))
        })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('displays create view component in create mode', () => {
        const { container } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    guidanceMode="create"
                    createdDatetime={undefined}
                    lastUpdatedDatetime={undefined}
                />
            </Provider>,
        )

        expect(container.querySelector('.container')).toBeInTheDocument()
    })

    it('does not display details panel in create mode', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    {...defaultProps}
                    guidanceMode="create"
                    createdDatetime={undefined}
                    lastUpdatedDatetime={undefined}
                />
            </Provider>,
        )

        expect(screen.queryByText(/AI Agent status/i)).not.toBeInTheDocument()
    })

    describe('unsaved changes modal', () => {
        it('opens unsaved changes modal when Cancel is clicked with changes in edit mode', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        title="Original Title"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            const titleInput = screen.getByRole('textbox', {
                name: /guidance name/i,
            })
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            await act(() =>
                user.click(screen.getByRole('button', { name: 'cancel' })),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })
        })

        it('opens unsaved changes modal when Cancel is clicked with changes in create mode', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        title=""
                        content=""
                        guidanceMode="create"
                        createdDatetime={undefined}
                        lastUpdatedDatetime={undefined}
                    />
                </Provider>,
            )

            const titleInput = screen.getByRole('textbox', {
                name: /guidance name/i,
            })
            await act(() => user.type(titleInput, 'New Title'))

            await act(() =>
                user.click(screen.getByRole('button', { name: 'cancel' })),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })
        })

        it('calls onClose when Discard changes button is clicked', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        onClose={onClose}
                        title="Original Title"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            const titleInput = screen.getByRole('textbox', {
                name: /guidance name/i,
            })
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            await act(() =>
                user.click(screen.getByRole('button', { name: 'cancel' })),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Discard changes' }),
                ),
            )

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('calls onSave when Save Changes button is clicked', async () => {
            const user = userEvent.setup()
            const onSave = jest.fn().mockResolvedValue(undefined)

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        onSave={onSave}
                        title="Original Title"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            const titleInput = screen.getByRole('textbox', {
                name: /guidance name/i,
            })
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            await act(() =>
                user.click(screen.getByRole('button', { name: 'cancel' })),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Save Changes' }),
                ),
            )

            expect(onSave).toHaveBeenCalledWith({
                name: 'Modified Title',
                content: 'Test Content',
                isVisible: true,
            })
        })

        it('closes modal when Back to editing button is clicked', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        title="Original Title"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            const titleInput = screen.getByRole('textbox', {
                name: /guidance name/i,
            })
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            await act(() =>
                user.click(screen.getByRole('button', { name: 'cancel' })),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Back to editing' }),
                ),
            )

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Save changes?' }),
                ).not.toBeInTheDocument()
            })
        })

        it('does not reset title and content when discarding changes', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        onClose={onClose}
                        title="Original Title"
                        content="Original Content"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            const titleInput = screen.getByRole('textbox', {
                name: /guidance name/i,
            })
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            await act(() =>
                user.click(screen.getByRole('button', { name: 'cancel' })),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Discard changes' }),
                ),
            )

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('closeHandlerRef', () => {
        it('sets closeHandlerRef.current to the cancel handler on mount', () => {
            const closeHandlerRef = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        guidanceMode="read"
                    />
                </Provider>,
            )

            expect(closeHandlerRef.current).not.toBeNull()
            expect(typeof closeHandlerRef.current).toBe('function')
        })

        it('updates closeHandlerRef.current when onClickCancel changes', () => {
            const closeHandlerRef = { current: null }
            const onClose = jest.fn()

            const { rerender } = render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        onClose={onClose}
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            const firstHandler = closeHandlerRef.current

            // Force a re-render that would change the callback
            rerender(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        onClose={jest.fn()}
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            // The ref should be updated with a new function
            expect(closeHandlerRef.current).not.toBe(firstHandler)
        })

        it('closeHandlerRef points to handler that calls onClose when no changes', () => {
            const closeHandlerRef = { current: null } as React.MutableRefObject<
                (() => void) | null
            >
            const onClose = jest.fn()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        onClose={onClose}
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            // Call the ref handler
            act(() => {
                closeHandlerRef.current?.()
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('closeHandlerRef points to handler that opens modal when there are changes', async () => {
            const user = userEvent.setup()
            const closeHandlerRef = { current: null } as React.MutableRefObject<
                (() => void) | null
            >
            const onClose = jest.fn()

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        onClose={onClose}
                        title="Original Title"
                        content="Original Content"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            // Simulate user making changes by typing in the title field
            const titleInput = screen.getByLabelText(/Guidance name/i)
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            // Call the ref handler (simulating X button or outside click)
            await act(() => closeHandlerRef.current?.())

            // Modal should appear instead of calling onClose directly
            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })

            expect(onClose).not.toHaveBeenCalled()
        })

        it('closeHandlerRef handler respects hasContentChanged state in read vs edit mode', async () => {
            const user = userEvent.setup()
            const closeHandlerRef = { current: null } as React.MutableRefObject<
                (() => void) | null
            >
            const onClose = jest.fn()

            // Test in read mode first
            const { unmount } = render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        onClose={onClose}
                        title="Original Title"
                        content="Original Content"
                        guidanceMode="read"
                    />
                </Provider>,
            )

            // Call in read mode - should close directly
            act(() => {
                closeHandlerRef.current?.()
            })

            expect(onClose).toHaveBeenCalledTimes(1)

            // Clean up first render
            unmount()
            onClose.mockClear()

            // Test in edit mode with changes
            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRef}
                        onClose={onClose}
                        title="Original Title"
                        content="Original Content"
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            // Make changes by typing in the title field
            const titleInput = screen.getByLabelText(/Guidance name/i)
            await act(() => user.clear(titleInput))
            await act(() => user.type(titleInput, 'Modified Title'))

            // Call in edit mode with changes - should show modal
            await act(() => closeHandlerRef.current?.())

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Save changes?' }),
                ).toBeInTheDocument()
            })

            expect(onClose).not.toHaveBeenCalled()
        })

        it('closeHandlerRef is never null after mount in any mode', () => {
            const closeHandlerRefRead = { current: null }
            const closeHandlerRefEdit = { current: null }
            const closeHandlerRefCreate = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRefRead}
                        guidanceMode="read"
                    />
                </Provider>,
            )

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRefEdit}
                        guidanceMode="edit"
                    />
                </Provider>,
            )

            render(
                <Provider store={mockStore({})}>
                    <KnowledgeEditorGuidanceView
                        {...defaultProps}
                        closeHandlerRef={closeHandlerRefCreate}
                        guidanceMode="create"
                        createdDatetime={undefined}
                        lastUpdatedDatetime={undefined}
                    />
                </Provider>,
            )

            expect(closeHandlerRefRead.current).not.toBeNull()
            expect(closeHandlerRefEdit.current).not.toBeNull()
            expect(closeHandlerRefCreate.current).not.toBeNull()
        })
    })
})
