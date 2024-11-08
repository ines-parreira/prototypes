import {screen, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {useFileIngestion} from 'pages/automate/aiAgent/hooks/useFileIngestion'
import {Components} from 'rest_api/help_center_api/client.generated'
import {uploadAttachments} from 'rest_api/help_center_api/uploadAttachments'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {ExternalFilesSection} from './ExternalFilesSection'

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/automate/aiAgent/hooks/useFileIngestion')
jest.mock('rest_api/help_center_api/uploadAttachments')

const mockDispatch = jest.fn()
const mockIngestFile = jest.fn()
const mockDeleteIngestedFile = jest.fn()

const useFileIngestionMock = assumeMock(useFileIngestion)
const useAppDispatchMock = assumeMock(useAppDispatch)
const uploadAttachmentsMock = assumeMock(uploadAttachments)
const notifyMock = assumeMock(notify)

useAppDispatchMock.mockReturnValue(mockDispatch)

let onSuccess: () => void
let onFailure: () => void

const renderComponent = ({
    ingestedFiles = null,
}: {
    ingestedFiles?: Components.Schemas.RetrieveFileIngestionLogDto[] | null
} = {}) => {
    useFileIngestionMock.mockImplementation((props) => {
        onSuccess = props.onSuccess
        onFailure = props.onFailure

        return {
            ingestFile: mockIngestFile,
            ingestedFiles,
            deleteIngestedFile: mockDeleteIngestedFile,
            isIngesting:
                ingestedFiles?.some((x) => x.status === 'PENDING') ?? false,
        }
    })

    return renderWithRouter(<ExternalFilesSection helpCenterId={1} />)
}

describe('ExternalFilesSection', () => {
    it('should render correctly', () => {
        renderComponent()
        expect(screen.getByText('External documents')).toBeInTheDocument()
    })

    it('should handle file upload correctly', async () => {
        renderComponent()

        uploadAttachmentsMock.mockResolvedValue([
            {
                name: 'test.pdf',
                type: 'pdf',
                content_type: 'application/pdf',
                size: 123456,
                url: 'https://attachments.gorgias.rehab/test.pdf',
                google_storage_key: 'test.pdf',
            },
        ])

        const fileInput = screen.getByDisplayValue('')
        const file = new File(['dummy content'], 'test.pdf', {
            type: 'application/pdf',
        })

        Object.defineProperty(fileInput, 'files', {
            value: [file],
        })
        fireEvent.change(fileInput)

        expect(screen.getByText('Uploading..')).toHaveClass('isDisabled')

        await waitFor(() => {
            expect(mockIngestFile).toHaveBeenCalledWith({
                filename: 'test.pdf',
                type: 'pdf',
                size_bytes: 123456,
                google_storage_url: 'test.pdf',
            })
        })
    })

    it('should not show pending and failed files', () => {
        renderComponent({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 1,
                    filename: 'test.pdf',
                    status: 'PENDING',
                    google_storage_url:
                        'https://storage.googleapis.com/test.pdf',
                    uploaded_datetime: '2024-11-04T19:24:08Z',
                },
                {
                    id: 2,
                    help_center_id: 1,
                    filename: 'test2.pdf',
                    status: 'FAILED',
                    google_storage_url:
                        'https://storage.googleapis.com/test2.pdf',
                    uploaded_datetime: '2024-11-04T19:24:08Z',
                },
                {
                    id: 3,
                    help_center_id: 1,
                    filename: 'test3.pdf',
                    status: 'SUCCESSFUL',
                    google_storage_url:
                        'https://storage.googleapis.com/tes3.pdf',
                    uploaded_datetime: '2024-11-04T19:24:08Z',
                },
            ],
        })

        expect(screen.getByText('Uploading..')).toHaveClass('isDisabled')
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
        expect(screen.queryByText('test2.pdf')).not.toBeInTheDocument()
        expect(screen.queryByText('test3.pdf')).toBeInTheDocument()
    })

    it('should show an error message if the file is too large', () => {
        renderComponent()

        const fileInput = screen.getByDisplayValue('')
        const file = new File(['dummy content'], 'test.pdf', {
            type: 'application/pdf',
        })

        Object.defineProperty(file, 'size', {value: 500 * 1024 * 1024 + 1})
        Object.defineProperty(fileInput, 'files', {
            value: [file],
        })
        fireEvent.change(fileInput)

        expect(screen.getByText('Upload File')).toBeInTheDocument()

        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message: 'File too large. Upload a file smaller than 500 MB.',
        })
    })

    it('should show an error message when ingestion fails', () => {
        renderComponent({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 1,
                    filename: 'test.pdf',
                    status: 'FAILED',
                    google_storage_url:
                        'https://storage.googleapis.com/test.pdf',
                    uploaded_datetime: '2024-11-04T19:24:08Z',
                },
            ],
        })

        onFailure && onFailure()

        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message:
                'Failed to upload to due to corrupted, incomplete, or mislabeled data. Please double-check the file or upload a different one.',
        })
    })

    it('should show a success message when ingestion succeeds', () => {
        renderComponent({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 1,
                    filename: 'test.pdf',
                    status: 'SUCCESSFUL',
                    google_storage_url:
                        'https://storage.googleapis.com/test.pdf',
                    uploaded_datetime: '2024-11-04T19:24:08Z',
                },
            ],
        })

        onSuccess && onSuccess()

        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'File uploaded successfully',
        })
    })

    it('should disable the upload button when max files is reached', () => {
        renderComponent({
            ingestedFiles: Array.from({length: 10}, (_, i) => ({
                id: i + 1,
                help_center_id: 1,
                filename: `test-${i + 1}.pdf`,
                status: 'SUCCESSFUL',
                google_storage_url: `https://storage.googleapis.com/test-${i + 1}.pdf`,
                uploaded_datetime: '2024-11-04T19:24:08Z',
            })),
        })

        expect(screen.getByText('Upload File').closest('button')).toHaveClass(
            'isDisabled'
        )
    })
})
