import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidanceCreateView } from './KnowledgeEditorGuidanceCreateView'

describe('KnowledgeEditorGuidanceCreateView', () => {
    const defaultProps = {
        content: '',
        onChangeContent: jest.fn(),
        title: '',
        onChangeTitle: jest.fn(),
        shopName: 'Test Shop',
        availableActions: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with empty fields', () => {
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView {...defaultProps} />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        expect(nameInput).toHaveValue('')
    })

    it('renders with template data when provided', () => {
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView
                    {...defaultProps}
                    title="Template Title"
                    content="Template Content"
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        expect(nameInput).toHaveValue('Template Title')
    })

    it('calls onChangeTitle when title input changes', () => {
        const onChangeTitle = jest.fn()
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView
                    {...defaultProps}
                    onChangeTitle={onChangeTitle}
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        fireEvent.change(nameInput, { target: { value: 'New Title' } })

        expect(onChangeTitle).toHaveBeenCalledWith('New Title')
    })

    it('displays required field indicator for title', () => {
        const { getByText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView {...defaultProps} />
            </Provider>,
        )

        expect(getByText(/Guidance name/i)).toBeInTheDocument()
    })

    it('displays caption with example', () => {
        const { getByText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView {...defaultProps} />
            </Provider>,
        )

        expect(
            getByText(
                /Provide a name for this Guidance. e.g. When a customer asks for a return or exchange/i,
            ),
        ).toBeInTheDocument()
    })

    it('displays instruction caption for content editor', () => {
        const { getByText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView {...defaultProps} />
            </Provider>,
        )

        expect(
            getByText(
                /Provide instructions on how AI Agent should handle this situation./i,
            ),
        ).toBeInTheDocument()
    })

    it('respects maxLength of 135 characters for title', () => {
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceCreateView {...defaultProps} />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i) as HTMLInputElement
        expect(nameInput.maxLength).toBe(135)
    })
})
