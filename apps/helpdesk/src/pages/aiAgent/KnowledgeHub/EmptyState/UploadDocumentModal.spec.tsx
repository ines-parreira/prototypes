import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { RetrieveFileIngestionLogDto } from '@gorgias/help-center-types'

import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { uploadAttachments } from 'rest_api/help_center_api/uploadAttachments'

import {
    openUploadDocumentModal,
    UploadDocumentModal,
} from './UploadDocumentModal'
import { dispatchDocumentEvent, useListenToDocumentEvent } from './utils'

const mockInnerDispatch = jest.fn()
const mockDispatch = jest.fn((action) => {
    // If action is a function (thunk), execute it
    if (typeof action === 'function') {
        return action(mockInnerDispatch, () => ({ notifications: [] }))
    }
    return mockInnerDispatch(action)
})
const mockIngestFile = jest.fn()
const mockResetBanner = jest.fn()

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => mockDispatch),
}))

jest.mock('pages/aiAgent/hooks/useFileIngestion', () => ({
    useFileIngestion: jest.fn(() => ({
        ingestFile: mockIngestFile,
        ingestedFiles: [],
    })),
}))

jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
    () => ({
        useIngestionDomainBannerDismissed: jest.fn(() => ({
            resetBanner: mockResetBanner,
            dismissBanner: jest.fn(),
        })),
    }),
)

jest.mock('rest_api/help_center_api/uploadAttachments', () => ({
    uploadAttachments: jest.fn(),
}))

jest.mock('./utils', () => ({
    ...jest.requireActual('./utils'),
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

const mockUseListenToDocumentEvent =
    useListenToDocumentEvent as jest.MockedFunction<
        typeof useListenToDocumentEvent
    >

const mockDispatchDocumentEvent = dispatchDocumentEvent as jest.MockedFunction<
    typeof dispatchDocumentEvent
>

const mockUseFileIngestion = useFileIngestion as jest.MockedFunction<
    typeof useFileIngestion
>

const mockUploadAttachments = uploadAttachments as jest.MockedFunction<
    typeof uploadAttachments
>

describe('UploadDocumentModal', () => {
    let eventCallback: (event?: Event) => void

    beforeEach(() => {
        jest.clearAllMocks()
        mockIngestFile.mockResolvedValue(undefined)
        mockUploadAttachments.mockResolvedValue([])
        mockUseFileIngestion.mockReturnValue({
            ingestFile: mockIngestFile,
            ingestedFiles: [],
            deleteIngestedFile: jest.fn(),
            isIngesting: false,
            isLoading: false,
        })
        mockUseListenToDocumentEvent.mockImplementation(
            (eventName, callback) => {
                eventCallback = callback
            },
        )
    })

    describe('modal visibility', () => {
        it('is closed by default', () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            expect(
                screen.queryByRole('heading', { name: 'Upload documents' }),
            ).not.toBeInTheDocument()
        })

        it('opens when OPEN_UPLOAD_DOCUMENT_MODAL event is dispatched', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Upload documents' }),
            ).toBeInTheDocument()
        })

        it('closes when Cancel button is clicked', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Upload documents' }),
            ).toBeInTheDocument()

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(async () => await userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Upload documents',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('closes modal using onOpenChange', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Upload documents' }),
            ).toBeInTheDocument()

            const closeButton = screen.getByRole('button', { name: /close/i })
            await act(async () => await userEvent.click(closeButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Upload documents',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('modal content', () => {
        it('displays warning about personal information', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(
                    /Avoid including personal or sensitive information/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Images in documents are not supported/),
            ).toBeInTheDocument()
        })

        it('displays supported file types information', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(/Supported file types:/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/.pdf, .docx, .pptx, and .xlsx up to 50 MB/),
            ).toBeInTheDocument()
        })

        it('displays drop file message', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(screen.getByText('Drop your file')).toBeInTheDocument()
        })

        it('displays select files button', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('button', { name: 'Select files' }),
            ).toBeInTheDocument()
        })

        it('displays upload button as disabled by default', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            await waitFor(() => {
                const uploadButton = screen.getByRole('button', {
                    name: /upload/i,
                })
                expect(uploadButton).toBeDisabled()
            })
        })
    })

    describe('file selection', () => {
        it('opens file picker when select files button is clicked', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const selectButton = screen.getByRole('button', {
                name: 'Select files',
            })
            const fileInput = document.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            const clickSpy = jest.fn()
            fileInput.click = clickSpy

            await act(async () => await userEvent.click(selectButton))

            expect(clickSpy).toHaveBeenCalled()
        })

        it('accepts multiple files', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const fileInput = document.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            expect(fileInput).toHaveAttribute('multiple')
        })

        it('accepts correct file types', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const fileInput = document.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            expect(fileInput).toHaveAttribute(
                'accept',
                '.pdf,.docx,.pptx,.xlsx',
            )
        })
    })

    describe('file upload', () => {
        it('shows error notification when file is too large', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(async () => {
                eventCallback?.()
            })

            const fileInput = document.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            const largeFile = new File(
                ['x'.repeat(51 * 1024 * 1024)],
                'large.pdf',
                {
                    type: 'application/pdf',
                },
            )

            Object.defineProperty(fileInput, 'files', {
                value: [largeFile],
                writable: false,
            })

            await act(async () => {
                fileInput.dispatchEvent(new Event('change', { bubbles: true }))
            })

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message:
                                'File too large. Upload a file smaller than 50 MB.',
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('shows error notification when file with duplicate name exists', async () => {
            mockUseFileIngestion.mockReturnValue({
                ingestFile: mockIngestFile,
                ingestedFiles: [
                    {
                        filename: 'duplicate.pdf',
                        status: 'SUCCESSFUL',
                        uploaded_datetime: '2024-01-01',
                    },
                ] as unknown as RetrieveFileIngestionLogDto[],
                deleteIngestedFile: jest.fn(),
                isIngesting: false,
                isLoading: false,
            })

            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(async () => {
                eventCallback?.()
            })

            const fileInput = document.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            const duplicateFile = new File(['content'], 'duplicate.pdf', {
                type: 'application/pdf',
            })

            Object.defineProperty(fileInput, 'files', {
                value: [duplicateFile],
                writable: false,
            })

            await act(async () => {
                fileInput.dispatchEvent(new Event('change', { bubbles: true }))
            })

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: expect.stringContaining(
                                'A file with duplicate.pdf name already exists',
                            ),
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('clears selected files when modal closes', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(async () => await userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Upload documents' }),
                ).not.toBeInTheDocument()
            })

            await act(() => {
                eventCallback?.()
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Upload documents' }),
                ).toBeInTheDocument()
            })

            await waitFor(() => {
                const uploadButton = screen.getByRole('button', {
                    name: /upload/i,
                })
                expect(uploadButton).toBeDisabled()
            })
        })
    })

    describe('drag and drop', () => {
        it('accepts drag enter events on upload area', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const uploadArea = screen.getByTestId('upload-drop-zone')

            // Verify drag enter doesn't throw errors
            await act(async () => {
                fireEvent.dragEnter(uploadArea!, {
                    dataTransfer: {
                        items: [{}],
                        files: [],
                    },
                })
            })

            // Upload area should still be in the document
            expect(uploadArea).toBeInTheDocument()
        })

        it('accepts drag leave events on upload area', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const uploadArea = screen.getByTestId('upload-drop-zone')

            await act(async () => {
                fireEvent.dragEnter(uploadArea!, {
                    dataTransfer: {
                        items: [{}],
                        files: [],
                    },
                })
            })

            // Verify drag leave doesn't throw errors
            await act(async () => {
                fireEvent.dragLeave(uploadArea!, {
                    target: uploadArea,
                    currentTarget: uploadArea,
                })
            })

            // Upload area should still be in the document
            expect(uploadArea).toBeInTheDocument()
        })

        it('handles file drop with valid PDF file', async () => {
            mockUploadAttachments.mockResolvedValue([
                {
                    name: 'test.pdf',
                    content_type: 'application/pdf',
                    size: 1000,
                    google_storage_key: 'key-123',
                    url: '',
                    type: '',
                },
            ])

            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const uploadArea = screen.getByTestId('upload-drop-zone')

            const pdfFile = new File(['content'], 'test.pdf', {
                type: 'application/pdf',
            })

            await act(async () => {
                fireEvent.drop(uploadArea!, {
                    dataTransfer: {
                        files: [pdfFile],
                        items: [{}],
                    },
                })
            })

            await waitFor(() => {
                expect(mockUploadAttachments).toHaveBeenCalledWith(
                    [pdfFile],
                    expect.any(Object),
                )
            })
        })

        it('handles file drop with multiple valid files', async () => {
            mockUploadAttachments.mockResolvedValue([
                {
                    name: 'test1.pdf',
                    content_type: 'application/pdf',
                    size: 1000,
                    google_storage_key: 'key-123',
                    url: '',
                    type: '',
                },
                {
                    name: 'test2.docx',
                    content_type:
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    size: 2000,
                    google_storage_key: 'key-456',
                    url: '',
                    type: '',
                },
            ])

            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const uploadArea = screen.getByTestId('upload-drop-zone')

            const pdfFile = new File(['content'], 'test1.pdf', {
                type: 'application/pdf',
            })
            const docxFile = new File(['content'], 'test2.docx', {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            })

            await act(async () => {
                fireEvent.drop(uploadArea!, {
                    dataTransfer: {
                        files: [pdfFile, docxFile],
                        items: [{}, {}],
                    },
                })
            })

            await waitFor(() => {
                expect(mockUploadAttachments).toHaveBeenCalled()
            })
        })

        it('shows error notification when dropping invalid file type', async () => {
            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const uploadArea = screen.getByTestId('upload-drop-zone')

            const invalidFile = new File(['content'], 'test.txt', {
                type: 'text/plain',
            })

            await act(async () => {
                fireEvent.drop(uploadArea!, {
                    dataTransfer: {
                        files: [invalidFile],
                        items: [{}],
                    },
                })
            })

            await waitFor(() => {
                expect(mockInnerDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            message: expect.stringContaining(
                                'Some files were rejected',
                            ),
                            status: 'error',
                        }),
                    }),
                )
            })
        })

        it('filters out invalid files and uploads only valid ones', async () => {
            mockUploadAttachments.mockResolvedValue([
                {
                    name: 'test.pdf',
                    content_type: 'application/pdf',
                    size: 1000,
                    google_storage_key: 'key-123',
                    url: '',
                    type: '',
                },
            ])

            render(
                <UploadDocumentModal helpCenterId={1} shopName="test-shop" />,
            )

            await act(() => {
                eventCallback?.()
            })

            const uploadArea = screen.getByTestId('upload-drop-zone')

            const validFile = new File(['content'], 'test.pdf', {
                type: 'application/pdf',
            })
            const invalidFile = new File(['content'], 'test.txt', {
                type: 'text/plain',
            })

            await act(async () => {
                fireEvent.drop(uploadArea!, {
                    dataTransfer: {
                        files: [validFile, invalidFile],
                        items: [{}, {}],
                    },
                })
            })

            await waitFor(() => {
                expect(mockUploadAttachments).toHaveBeenCalledWith(
                    [validFile],
                    expect.any(Object),
                )
            })

            expect(mockInnerDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'reapop/upsertNotification',
                    payload: expect.objectContaining({
                        message: expect.stringContaining(
                            'Some files were rejected',
                        ),
                        status: 'error',
                    }),
                }),
            )
        })
    })

    describe('openUploadDocumentModal helper function', () => {
        it('dispatches OPEN_UPLOAD_DOCUMENT_MODAL event', () => {
            openUploadDocumentModal()

            expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                'open-upload-document-modal',
            )
        })
    })
})
