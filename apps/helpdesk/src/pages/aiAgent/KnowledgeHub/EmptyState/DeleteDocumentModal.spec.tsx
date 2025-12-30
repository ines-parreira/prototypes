import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GroupedKnowledgeItem } from '../types'
import { DeleteDocumentModal } from './DeleteDocumentModal'
import { openDeleteDocumentModal } from './utils'

const mockInnerDispatch = jest.fn()
const mockDispatch = jest.fn((action) => {
    // If action is a function (thunk), execute it
    if (typeof action === 'function') {
        return action(mockInnerDispatch, () => ({ notifications: [] }))
    }
    return mockInnerDispatch(action)
})
const mockDeleteIngestedFile = jest.fn()

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => mockDispatch),
}))

jest.mock('pages/aiAgent/hooks/useFileIngestion', () => ({
    useFileIngestion: jest.fn(() => ({
        deleteIngestedFile: mockDeleteIngestedFile,
    })),
}))

jest.mock('./utils', () => {
    const mockDispatch = jest.fn()
    return {
        dispatchDocumentEvent: mockDispatch,
        useListenToDocumentEvent: jest.fn(),
        openDeleteDocumentModal: jest.fn((data) => {
            mockDispatch('open-delete-document-modal', data)
        }),
    }
})

const { dispatchDocumentEvent: mockDispatchDocumentEvent } = require('./utils')
const {
    useListenToDocumentEvent: mockUseListenToDocumentEvent,
} = require('./utils')

describe('DeleteDocumentModal', () => {
    let eventCallback: (event?: Event) => void
    const mockOnRefetch = jest.fn()
    const mockOnFolderChange = jest.fn()
    const mockOnRemoveFolderParam = jest.fn()

    const mockFolder: GroupedKnowledgeItem = {
        id: 'doc-1',
        type: 'document' as any,
        title: 'Test Document',
        lastUpdatedAt: '2024-01-01',
        source: 'test-document.pdf',
    }

    const mockFileIngestionLogs = [
        {
            id: 1,
            filename: 'test-document.pdf',
            status: 'SUCCESSFUL',
            uploaded_datetime: '2024-01-01',
        },
        {
            id: 2,
            filename: 'another-document.pdf',
            status: 'SUCCESSFUL',
            uploaded_datetime: '2024-01-02',
        },
    ]

    const renderModal = (props?: {
        fileIngestionLogs?: any
        onRefetch?: () => void
        onFolderChange?: (folder: any) => void
        onRemoveFolderParam?: () => void
    }) => {
        return render(
            <DeleteDocumentModal
                helpCenterId={1}
                fileIngestionLogs={
                    props && 'fileIngestionLogs' in props
                        ? props.fileIngestionLogs
                        : mockFileIngestionLogs
                }
                onRefetch={props?.onRefetch ?? mockOnRefetch}
                onFolderChange={props?.onFolderChange ?? mockOnFolderChange}
                onRemoveFolderParam={
                    props?.onRemoveFolderParam ?? mockOnRemoveFolderParam
                }
            />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockDeleteIngestedFile.mockResolvedValue(undefined)
        mockUseListenToDocumentEvent.mockImplementation(
            (
                _eventName: any,
                callback: (event?: Event | undefined) => void,
            ) => {
                eventCallback = callback
            },
        )
    })

    describe('modal visibility', () => {
        it('is closed by default', () => {
            renderModal()

            expect(
                screen.queryByRole('heading', { name: 'Delete document?' }),
            ).not.toBeInTheDocument()
        })

        it('opens when OPEN_DELETE_DOCUMENT_MODAL event is dispatched', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Delete document?' }),
                ).toBeInTheDocument()
            })
        })

        it('opens without folder data', async () => {
            renderModal()

            await act(() => {
                eventCallback?.()
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Delete document?' }),
                ).toBeInTheDocument()
            })
        })

        it('closes when Cancel button is clicked', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Delete document?',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('closes modal using onOpenChange', async () => {
            const user = userEvent.setup()
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await act(() => user.keyboard('{Escape}'))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Delete document?',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('modal content', () => {
        it('displays warning messages', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            expect(
                screen.getByText(
                    /Once deleted, this content can't be restored/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /All snippets generated from this document will be deleted/,
                ),
            ).toBeInTheDocument()
        })

        it('displays cancel and delete buttons', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Delete' }),
            ).toBeInTheDocument()
        })
    })

    describe('document deletion', () => {
        it('successfully deletes document', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockDeleteIngestedFile).toHaveBeenCalledWith(1)
                expect(mockOnFolderChange).toHaveBeenCalledWith(null)
                expect(mockOnRefetch).toHaveBeenCalled()
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: 'Document successfully deleted',
                            status: 'success',
                        }),
                    }),
                )
            })
        })

        it('calls onRemoveFolderParam when document is successfully deleted', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockOnRemoveFolderParam).toHaveBeenCalled()
                expect(mockOnFolderChange).toHaveBeenCalledWith(null)
            })
        })

        it('closes modal after successful deletion', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Delete document?',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('shows error notification when document not found in logs', async () => {
            const nonExistentFolder: GroupedKnowledgeItem = {
                id: 'doc-999',
                type: 'document' as any,
                title: 'Non-existent Document',
                lastUpdatedAt: '2024-01-01',
                source: 'non-existent.pdf',
            }

            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: nonExistentFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: 'Could not find document to delete',
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('shows error notification when deletion fails', async () => {
            mockDeleteIngestedFile.mockRejectedValue(new Error('Delete failed'))

            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: expect.stringContaining(
                                'Error during document deletion',
                            ),
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('does nothing when no folder is selected', async () => {
            renderModal()

            await act(() => {
                eventCallback?.()
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockDeleteIngestedFile).not.toHaveBeenCalled()
            })
        })

        it('handles empty fileIngestionLogs array', async () => {
            renderModal({ fileIngestionLogs: [] })

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: 'Could not find document to delete',
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('handles undefined fileIngestionLogs', async () => {
            renderModal({ fileIngestionLogs: undefined })

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: 'Could not find document to delete',
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('clears selected folder when modal closes via cancel', async () => {
            renderModal()

            await act(() => {
                const customEvent = new CustomEvent(
                    'open-delete-document-modal',
                    {
                        detail: mockFolder,
                    },
                )
                eventCallback?.(customEvent)
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => userEvent.click(cancelButton))

            await act(() => {
                eventCallback?.()
            })

            await waitFor(() =>
                screen.getByRole('heading', { name: 'Delete document?' }),
            )

            const deleteButton = screen.getByRole('button', { name: 'Delete' })
            await act(() => userEvent.click(deleteButton))

            expect(mockDeleteIngestedFile).not.toHaveBeenCalled()
        })
    })

    describe('openDeleteDocumentModal helper function', () => {
        it('dispatches OPEN_DELETE_DOCUMENT_MODAL event with data', () => {
            // Clear any previous calls
            mockDispatchDocumentEvent.mockClear()

            openDeleteDocumentModal(mockFolder)

            // Check that dispatchDocumentEvent was called with correct arguments
            expect(mockDispatchDocumentEvent).toHaveBeenCalledTimes(1)
            expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                'open-delete-document-modal',
                mockFolder,
            )
        })
    })
})
