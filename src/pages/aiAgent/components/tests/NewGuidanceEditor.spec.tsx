import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { NewGuidanceEditor } from '../GuidanceEditor/NewGuidanceEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('NewGuidanceEditor', () => {
    const defaultProps = {
        content: '',
        handleUpdateContent: jest.fn(),
        onBlur: jest.fn(),
        label: 'Guidance',
    }

    const renderWithProvider = (ui: React.ReactElement) => {
        return render(<Provider store={mockStore({})}>{ui}</Provider>)
    }

    it('renders correctly with default props', () => {
        const { getByText } = renderWithProvider(
            <NewGuidanceEditor {...defaultProps} />,
        )

        expect(getByText('Guidance')).toBeInTheDocument()
    })

    it('renders initial content correctly', () => {
        const initialContent = '<p>Initial test content</p>'
        const { container } = renderWithProvider(
            <NewGuidanceEditor {...defaultProps} content={initialContent} />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Initial test content')
    })

    it('displays character count in toolbar', () => {
        const content = 'Test content'
        const { container } = renderWithProvider(
            <NewGuidanceEditor {...defaultProps} content={content} />,
        )

        const charCount = container.querySelector('.maxLength')
        expect(charCount?.textContent).toBe('12/5000')
    })

    it('renders toolbar with formatting buttons', () => {
        const { container } = renderWithProvider(
            <NewGuidanceEditor {...defaultProps} />,
        )

        const toolbar = container.querySelector('.editor-toolbar')
        expect(toolbar).toBeInTheDocument()

        const buttons = toolbar?.querySelectorAll('button')
        expect(buttons).toHaveLength(8)

        const icons = container.querySelectorAll('i.material-icons')
        expect(icons[0]).toHaveTextContent('format_bold')
        expect(icons[1]).toHaveTextContent('format_italic')
        expect(icons[2]).toHaveTextContent('format_underline')
        expect(icons[3]).toHaveTextContent('link')
        expect(icons[4]).toHaveTextContent('insert_emoticon')
        expect(icons[5]).toHaveTextContent('format_list_bulleted')
        expect(icons[6]).toHaveTextContent('format_list_numbered')
    })

    it('calls onBlur when editor loses focus', () => {
        const onBlur = jest.fn()
        const { container } = renderWithProvider(
            <NewGuidanceEditor {...defaultProps} onBlur={onBlur} />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        if (editorContent) {
            fireEvent.focus(editorContent)
            fireEvent.blur(editorContent)
        }

        expect(onBlur).toHaveBeenCalled()
    })
})
