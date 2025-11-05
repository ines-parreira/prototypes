import { act, fireEvent, render, screen } from '@testing-library/react'
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
        const onCreate = jest.fn()
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
})
