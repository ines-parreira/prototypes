import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateProductAdditionalInfo } from 'models/ecommerce/queries'

import ProductAdditionalInfoView from '../ProductAdditionalInfoView'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const mockDispatch = jest.fn()
useAppDispatchMock.mockReturnValue(mockDispatch)

jest.mock('models/ecommerce/queries', () => ({
    useUpdateProductAdditionalInfo: jest.fn(),
}))

let mockOnChange: ((editorState: EditorState) => void) | null = null
let mockOnBlur: (() => void) | null = null
let mockOnFocus: (() => void) | null = null

jest.mock('pages/common/forms/RichField/RichField', () => {
    return function MockRichField(props: any) {
        mockOnChange = props.onChange
        mockOnBlur = props.onBlur
        mockOnFocus = props.onFocus

        return (
            <div
                data-testid="mock-rich-field"
                role="combobox"
                onFocus={() => mockOnFocus?.()}
                onBlur={() => mockOnBlur?.()}
            >
                {props.placeholder}
            </div>
        )
    }
})

jest.mock('utils/editor', () => ({
    contentStateFromTextOrHTML: jest.fn((text: string, html: string) => {
        const plainText = html.replace(/<[^>]*>/g, '')
        return ContentState.createFromText(plainText)
    }),
    convertToHTML: jest.fn((contentState: any) => {
        const plainText = contentState.getPlainText('')
        return plainText ? `<p>${plainText}</p>` : ''
    }),
    isValidSelectionKey: jest.fn(() => true),
    EditorBlockType: {
        Unstyled: 'unstyled',
        CodeBlock: 'code-block',
        OrderedListItem: 'ordered-list-item',
        UnorderedListItem: 'unordered-list-item',
        HeaderOne: 'header-one',
        HeaderTwo: 'header-two',
        HeaderThree: 'header-three',
        HeaderFour: 'header-four',
        HeaderFive: 'header-five',
        HeaderSix: 'header-six',
        Atomic: 'atomic',
        Blockquote: 'blockquote',
    },
}))

const mockMutateAsync = jest.fn()
const mockUseUpdateProductAdditionalInfo =
    useUpdateProductAdditionalInfo as jest.MockedFunction<
        typeof useUpdateProductAdditionalInfo
    >

describe('ProductAdditionalInfoView', () => {
    beforeEach(() => {
        mockUseUpdateProductAdditionalInfo.mockReturnValue({
            mutateAsync: mockMutateAsync,
        } as any)
        mockMutateAsync.mockResolvedValue({})
        jest.clearAllTimers()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('renders with initial empty state', () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
            screen.getByText(
                '0/1000 characters (formatting consumes available characters)',
            ),
        ).toBeInTheDocument()
    })

    it('renders with initial value', () => {
        const initialValue = {
            rich_text: '<p>Test content</p>',
        }

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
            screen.getByText(
                /\d+\/1000 characters \(formatting consumes available characters\)/,
            ),
        ).toBeInTheDocument()
    })

    it('updates character count as user types', async () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            fireEvent.focus(richField)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    '0/1000 characters (formatting consumes available characters)',
                ),
            ).toBeInTheDocument()
        })
    })

    it('shows saving indicator when blur event triggers save', async () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            fireEvent.focus(richField)
            const newContentState =
                ContentState.createFromText('Updated content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith({
                objectType: 'product',
                sourceType: 'shopify',
                integrationId: 123,
                externalId: '456',
                key: 'ai_agent_extended_context',
                data: {
                    data: {
                        rich_text: expect.any(String),
                    },
                    version: expect.any(String),
                },
            })
        })
    })

    it('calls mutation with correct parameters on save', async () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    objectType: 'product',
                    sourceType: 'shopify',
                    integrationId: 123,
                    externalId: '456',
                    key: 'ai_agent_extended_context',
                }),
            )
        })
    })

    it('shows error notification when save fails', async () => {
        mockMutateAsync.mockRejectedValueOnce(new Error('Save failed'))

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('does not exceed character limit', () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        expect(
            screen.getByText(
                '0/1000 characters (formatting consumes available characters)',
            ),
        ).toBeInTheDocument()
    })

    it('shows limit reached styling when at max characters', () => {
        const longText = 'a'.repeat(993) // formatting consumes 7 characters for <p></p> tags
        const initialValue = {
            rich_text: `<p>${longText}</p>`,
        }

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        expect(
            screen.getByText(
                '1000/1000 characters (formatting consumes available characters)',
            ),
        ).toBeInTheDocument()
    })

    it('prevents typing when character limit is exceeded', () => {
        const longText = 'a'.repeat(993) // formatting consumes 7 characters for <p></p> tags
        const initialValue = {
            rich_text: `<p>${longText}</p>`,
        }

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        act(() => {
            const tooLongContentState = ContentState.createFromText(
                longText + 'extra',
            )
            const tooLongEditorState =
                EditorState.createWithContent(tooLongContentState)
            mockOnChange?.(tooLongEditorState)
        })

        expect(
            screen.getByText(
                '1000/1000 characters (formatting consumes available characters)',
            ),
        ).toBeInTheDocument()
    })

    it('does not save when content has not changed', async () => {
        const initialValue = {
            rich_text: '<p>Test content</p>',
        }

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            fireEvent.focus(richField)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('shows success notification when save succeeds', async () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('updates focused state on focus and blur', async () => {
        const { container } = render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')
        const editorContainer = container.querySelector('.editorContainer')

        expect(editorContainer).not.toHaveClass('focused')

        act(() => {
            fireEvent.focus(richField)
        })

        await waitFor(() => {
            expect(editorContainer).toHaveClass('focused')
        })

        act(() => {
            fireEvent.blur(richField)
        })

        await waitFor(() => {
            expect(editorContainer).not.toHaveClass('focused')
        })
    })

    it('cleans up timeout on unmount', () => {
        const { unmount } = render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
            fireEvent.blur(richField)
        })

        unmount()

        act(() => {
            jest.advanceTimersByTime(300)
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('shows saving indicator while saving', async () => {
        mockMutateAsync.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({}), 1000)
                }),
        )

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        await waitFor(() => {
            expect(screen.getByText('Saving...')).toBeInTheDocument()
        })
    })

    it('displays the correct character count for text with formatting', () => {
        const initialValue = {
            rich_text:
                '<div><strong>Bold</strong> and <em>italic</em> text</div>',
        }

        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        expect(
            screen.getByText(
                '27/1000 characters (formatting consumes available characters)',
            ),
        ).toBeInTheDocument()
    })

    it('clears pending timeout when blurring multiple times (lines 147-148)', async () => {
        render(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const richField = screen.getByRole('combobox')

        act(() => {
            const firstContentState =
                ContentState.createFromText('First content')
            const firstEditorState =
                EditorState.createWithContent(firstContentState)
            mockOnChange?.(firstEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(100)
        })

        act(() => {
            fireEvent.focus(richField)
            const secondContentState =
                ContentState.createFromText('Second content')
            const secondEditorState =
                EditorState.createWithContent(secondContentState)
            mockOnChange?.(secondEditorState)
        })

        await act(async () => {
            fireEvent.blur(richField)
            jest.advanceTimersByTime(300)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledTimes(1)
            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        data: expect.objectContaining({
                            rich_text: '<p>Second content</p>',
                        }),
                    }),
                }),
            )
        })
    })
})
