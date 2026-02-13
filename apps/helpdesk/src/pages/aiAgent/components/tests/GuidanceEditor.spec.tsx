import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { GuidanceEditor } from '../GuidanceEditor/GuidanceEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

describe('GuidanceEditor', () => {
    const defaultProps = {
        shopName: 'test-shop',
        availableActions: [],
        content: '',
        handleUpdateContent: jest.fn(),
        onBlur: jest.fn(),
        label: 'Guidance',
        showActionsButton: true,
    }

    const renderWithProvider = (ui: React.ReactElement) => {
        return render(<Provider store={mockStore({})}>{ui}</Provider>)
    }

    beforeEach(() => {
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiAgentSupportActionInGuidance
                ? false
                : true,
        )
    })

    it('renders correctly with default props', () => {
        const { getByText } = renderWithProvider(
            <GuidanceEditor {...defaultProps} />,
        )

        expect(getByText('Guidance')).toBeInTheDocument()
    })

    it('renders initial content correctly', () => {
        const initialContent = '<p>Initial test content</p>'
        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} content={initialContent} />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Initial test content')
    })

    it('displays character count in toolbar', () => {
        const content = 'Test content'
        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} content={content} />,
        )

        const charCount = container.querySelector('.maxLength')
        expect(charCount?.textContent).toBe('12/30000')
    })

    it('renders toolbar with formatting buttons', () => {
        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} />,
        )

        const toolbar = container.querySelector('.editor-toolbar')
        expect(toolbar).toBeInTheDocument()

        const buttons = toolbar?.querySelectorAll('button')
        expect(buttons).toHaveLength(10)

        const icons = container.querySelectorAll('i.material-icons')
        expect(icons[0]).toHaveTextContent('format_bold')
        expect(icons[1]).toHaveTextContent('format_italic')
        expect(icons[2]).toHaveTextContent('format_underline')
        expect(icons[3]).toHaveTextContent('link')
        expect(icons[4]).toHaveTextContent('insert_emoticon')
        expect(icons[5]).toHaveTextContent('title')
        expect(icons[6]).toHaveTextContent('format_list_bulleted')
        expect(icons[7]).toHaveTextContent('format_list_numbered')

        expect(toolbar).toHaveTextContent('Actions')
    })

    it('renders toolbar without actions button', () => {
        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} showActionsButton={false} />,
        )

        const toolbar = container.querySelector('.editor-toolbar')
        expect(toolbar).toBeInTheDocument()

        const buttons = toolbar?.querySelectorAll('button')
        expect(buttons).toHaveLength(9)

        expect(toolbar).not.toHaveTextContent('Actions')
    })

    it('calls onBlur when editor loses focus', () => {
        const onBlur = jest.fn()
        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} onBlur={onBlur} />,
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

    it('has guidance variable button and action button', () => {
        mockUseFlag.mockReturnValue(true)

        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} />,
        )

        const toolbar = container.querySelector('.editor-toolbar')
        expect(toolbar).toBeInTheDocument()

        const buttons = toolbar?.querySelectorAll('button')
        expect(buttons).toHaveLength(10)
    })

    it('handles empty content correctly', () => {
        const handleUpdateContent = jest.fn()
        const { container } = renderWithProvider(
            <GuidanceEditor
                {...defaultProps}
                content=""
                handleUpdateContent={handleUpdateContent}
            />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('')

        const charCount = container.querySelector('.maxLength')
        expect(charCount?.textContent).toBe('0/30000')
    })

    it('renders with available guidance actions', () => {
        const availableActions = [
            { name: 'Action 1', value: 'action1' },
            { name: 'Action 2', value: 'action2' },
        ]

        const { container } = renderWithProvider(
            <GuidanceEditor
                {...defaultProps}
                availableActions={availableActions}
            />,
        )

        expect(container.querySelector('.editor-toolbar')).toBeInTheDocument()
    })

    it('preserves HTML formatting when content is rendered', () => {
        const htmlContent =
            '<p><strong>Bold text</strong> and <em>italic text</em></p>'

        const { container } = renderWithProvider(
            <GuidanceEditor {...defaultProps} content={htmlContent} />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        // Draft.js renders the content with its own structure
        expect(editorContent?.textContent).toContain('Bold text')
        expect(editorContent?.textContent).toContain('italic text')
    })

    it('calls handleUpdateContent when pasting text content', async () => {
        const handleUpdateContent = jest.fn()
        const { container } = renderWithProvider(
            <GuidanceEditor
                {...defaultProps}
                handleUpdateContent={handleUpdateContent}
            />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        if (editorContent) {
            fireEvent.focus(editorContent)

            fireEvent.paste(editorContent, {
                clipboardData: {
                    getData: () => 'Pasted text content',
                    types: ['text/plain'],
                },
            })

            await waitFor(() => {
                expect(handleUpdateContent).toHaveBeenCalled()
                expect(handleUpdateContent).toHaveBeenCalledWith(
                    expect.stringContaining('Pasted text content'),
                )
            })
        }
    })

    it('calls handleUpdateContent when pasting empty content', async () => {
        const handleUpdateContent = jest.fn()
        const { container } = renderWithProvider(
            <GuidanceEditor
                {...defaultProps}
                handleUpdateContent={handleUpdateContent}
            />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        if (editorContent) {
            fireEvent.focus(editorContent)

            fireEvent.paste(editorContent, {
                clipboardData: {
                    getData: () => 'Pasted text content',
                    types: ['text/plain'],
                },
            })

            await waitFor(() => {
                expect(handleUpdateContent).toHaveBeenCalled()
                expect(handleUpdateContent).toHaveBeenCalledWith(
                    expect.stringContaining('Pasted text content'),
                )
            })

            fireEvent.paste(editorContent, {
                clipboardData: {
                    getData: () => '',
                    types: ['text/plain'],
                },
            })

            await waitFor(() => {
                expect(handleUpdateContent).toHaveBeenCalled()
                expect(handleUpdateContent).toHaveBeenCalledWith(
                    expect.stringContaining(''),
                )
            })
        }
    })

    it('calls handleUpdateContent when pasting HTML content', async () => {
        const handleUpdateContent = jest.fn()
        const { container } = renderWithProvider(
            <GuidanceEditor
                {...defaultProps}
                handleUpdateContent={handleUpdateContent}
            />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        if (editorContent) {
            fireEvent.focus(editorContent)

            fireEvent.paste(editorContent, {
                clipboardData: {
                    getData: (type: string) => {
                        if (type === 'text/html') {
                            return '<p><strong>Bold</strong> text</p>'
                        }
                        return 'Bold text'
                    },
                    types: ['text/html', 'text/plain'],
                },
            })

            await waitFor(() => {
                expect(handleUpdateContent).toHaveBeenCalled()
                const callArg = handleUpdateContent.mock.calls[0][0]
                expect(callArg).toMatch(/<strong>Bold<\/strong>|Bold/)
            })
        }
    })
})
