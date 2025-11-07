import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'
import { MemoryRouter } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateProductAdditionalInfo } from 'models/ecommerce/queries'
import useUnsavedChangesPrompt from 'pages/common/components/useUnsavedChangesPrompt'

import ProductAdditionalInfoView from '../ProductAdditionalInfoView'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const mockDispatch = jest.fn()
useAppDispatchMock.mockReturnValue(mockDispatch)

jest.mock('models/ecommerce/queries', () => ({
    useUpdateProductAdditionalInfo: jest.fn(),
}))

jest.mock('pages/common/components/useUnsavedChangesPrompt')
const mockUseUnsavedChangesPrompt =
    useUnsavedChangesPrompt as jest.MockedFunction<
        typeof useUnsavedChangesPrompt
    >

const mockCloseNavigationModal = jest.fn()
const mockRedirectToOriginalLocation = jest.fn()
const mockOnNavigateAway = jest.fn()

// Default mock implementation
mockUseUnsavedChangesPrompt.mockReturnValue({
    isOpen: false,
    onClose: mockCloseNavigationModal,
    redirectToOriginalLocation: mockRedirectToOriginalLocation,
    onNavigateAway: mockOnNavigateAway,
    onLeaveContext: jest.fn(),
})

let mockOnChange: ((editorState: EditorState) => void) | null = null

jest.mock('pages/common/forms/RichField/RichField', () => {
    return function MockRichField(props: any) {
        mockOnChange = props.onChange

        return (
            <div data-testid="mock-rich-field" role="combobox">
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

const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>)
}

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
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /save changes/i }),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(screen.getByRole('button', { name: /cancel/i })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
    })

    it('renders with initial value', () => {
        const initialValue = {
            rich_text: '<p>Test content</p>',
        }

        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('enables buttons when content changes', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        expect(cancelButton).toHaveAttribute('aria-disabled', 'true')

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        await waitFor(() => {
            expect(saveButton).toHaveAttribute('aria-disabled', 'false')
            expect(cancelButton).toHaveAttribute('aria-disabled', 'false')
        })
    })

    it('triggers save when Save button is clicked', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState =
                ContentState.createFromText('Updated content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })

        await act(async () => {
            fireEvent.click(saveButton)
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
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })

        await act(async () => {
            fireEvent.click(saveButton)
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

        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })

        await act(async () => {
            fireEvent.click(saveButton)
        })

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('keeps buttons disabled when content has not changed', async () => {
        const initialValue = {
            rich_text: '<p>Test content</p>',
        }

        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        expect(cancelButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('shows success notification when save succeeds', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })

        await act(async () => {
            fireEvent.click(saveButton)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('opens cancel modal when Cancel button is clicked', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Save changes?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    "Your changes to this page will be lost if you don't save them.",
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /discard changes/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /back to editing/i }),
            ).toBeInTheDocument()
        })
    })

    it('closes modal when Back To Editing button is clicked', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        const backToEditingButton = await screen.findByRole('button', {
            name: /back to editing/i,
        })

        await act(async () => {
            fireEvent.click(backToEditingButton)
        })

        await waitFor(() => {
            expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
        })
    })

    it('reverts content when Discard Changes button is clicked', async () => {
        const initialValue = {
            rich_text: '<p>Initial content</p>',
        }

        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={initialValue}
            />,
        )

        act(() => {
            const newContentState =
                ContentState.createFromText('Modified content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        const discardButton = await screen.findByRole('button', {
            name: /discard changes/i,
        })

        await act(async () => {
            fireEvent.click(discardButton)
        })

        await waitFor(() => {
            expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('saves and closes modal when Save Changes button in modal is clicked', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        const modalSaveButtons = await screen.findAllByRole('button', {
            name: /save changes/i,
        })
        const modalSaveButton = modalSaveButtons[1]

        await act(async () => {
            fireEvent.click(modalSaveButton)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled()
            expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
        })
    })

    it('shows loading state on Save button while saving', async () => {
        let resolveSave: (value: any) => void
        mockMutateAsync.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSave = resolve
                }),
        )

        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })

        expect(saveButton).toHaveAttribute('aria-disabled', 'false')

        await act(async () => {
            fireEvent.click(saveButton)
        })

        // Button should be disabled while saving
        await waitFor(() => {
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })

        // Resolve the save
        await act(async () => {
            resolveSave!({})
        })

        // After successful save, button should remain disabled because content is no longer dirty
        await waitFor(() => {
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('disables save button but allows cancel when content exceeds character limit', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const longText = 'a'.repeat(1001)

        act(() => {
            const longContentState = ContentState.createFromText(longText)
            const longEditorState =
                EditorState.createWithContent(longContentState)
            mockOnChange?.(longEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await waitFor(() => {
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
            expect(cancelButton).toHaveAttribute('aria-disabled', 'false')
            expect(
                screen.getByText(
                    /You've exceeded the 1000 character limit.*shorten it to save your changes/,
                ),
            ).toBeInTheDocument()
        })
    })

    it('disables modal save button when content exceeds character limit', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        const longText = 'a'.repeat(1001)

        act(() => {
            const longContentState = ContentState.createFromText(longText)
            const longEditorState =
                EditorState.createWithContent(longContentState)
            mockOnChange?.(longEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    /Your text exceeds the character limit.*need to shorten it in order to save/,
                ),
            ).toBeInTheDocument()
        })

        const modalSaveButtons = await screen.findAllByRole('button', {
            name: /save changes/i,
        })
        const modalSaveButton = modalSaveButtons[1]

        expect(modalSaveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables buttons after successful save', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const saveButton = screen.getByRole('button', { name: /save changes/i })

        await act(async () => {
            fireEvent.click(saveButton)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled()
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('discards changes when no initial content exists', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        const discardButton = await screen.findByRole('button', {
            name: /discard changes/i,
        })

        await act(async () => {
            fireEvent.click(discardButton)
        })

        await waitFor(() => {
            expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('handles error state properly during modal save', async () => {
        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        // Create content that exceeds character limit
        const longText = 'a'.repeat(1001)

        act(() => {
            const longContentState = ContentState.createFromText(longText)
            const longEditorState =
                EditorState.createWithContent(longContentState)
            mockOnChange?.(longEditorState)
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(async () => {
            fireEvent.click(cancelButton)
        })

        // Modal should open with error message
        await waitFor(() => {
            expect(screen.getByText('Save changes?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Your text exceeds the character limit.*need to shorten it in order to save/,
                ),
            ).toBeInTheDocument()
        })

        const modalSaveButtons = await screen.findAllByRole('button', {
            name: /save changes/i,
        })
        const modalSaveButton = modalSaveButtons[1]

        // Modal save button should be disabled due to error
        expect(modalSaveButton).toHaveAttribute('aria-disabled', 'true')

        // Back to editing should still work
        const backButton = screen.getByRole('button', {
            name: /back to editing/i,
        })

        await act(async () => {
            fireEvent.click(backButton)
        })

        await waitFor(() => {
            expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
        })
    })

    it('calls redirectToOriginalLocation when saving from navigation modal', async () => {
        // Mock the hook to simulate navigation modal being open
        // Use mockReturnValue (not mockReturnValueOnce) to ensure it persists through re-renders
        mockUseUnsavedChangesPrompt.mockReturnValue({
            isOpen: true,
            onClose: mockCloseNavigationModal,
            redirectToOriginalLocation: mockRedirectToOriginalLocation,
            onNavigateAway: mockOnNavigateAway,
            onLeaveContext: jest.fn(),
        })

        renderWithRouter(
            <ProductAdditionalInfoView
                integrationId={123}
                productId="456"
                initialValue={null}
            />,
        )

        act(() => {
            const newContentState = ContentState.createFromText('New content')
            const newEditorState =
                EditorState.createWithContent(newContentState)
            mockOnChange?.(newEditorState)
        })

        // Modal should be open (simulating navigation attempt)
        await waitFor(() => {
            expect(screen.getByText('Save changes?')).toBeInTheDocument()
        })

        const modalSaveButtons = await screen.findAllByRole('button', {
            name: /save changes/i,
        })
        const modalSaveButton = modalSaveButtons[1]

        await act(async () => {
            fireEvent.click(modalSaveButton)
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled()
            expect(mockRedirectToOriginalLocation).toHaveBeenCalled()
        })

        // Reset the mock to default behavior for other tests
        mockUseUnsavedChangesPrompt.mockReturnValue({
            isOpen: false,
            onClose: mockCloseNavigationModal,
            redirectToOriginalLocation: mockRedirectToOriginalLocation,
            onNavigateAway: mockOnNavigateAway,
            onLeaveContext: jest.fn(),
        })
    })
})
