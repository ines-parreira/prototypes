import React from 'react'

import { getFileTooLargeError } from '@repo/utils'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GenericAttachment } from 'common/types'
import uploadFiles from 'common/utils/uploadFiles'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { UploadedImageAttachment } from './UploadImage'
import { UploadImageField } from './UploadImage'

jest.mock('common/utils/uploadFiles')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    getFileTooLargeError: jest.fn(),
}))

const mockUploadFiles = uploadFiles as jest.MockedFunction<typeof uploadFiles>
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockNotify = notify as jest.MockedFunction<typeof notify>
const mockGetFileTooLargeError = getFileTooLargeError as jest.MockedFunction<
    typeof getFileTooLargeError
>

describe('UploadImageField', () => {
    let mockDispatch: jest.Mock
    const MAX_IMAGE_SIZE = 5 * 1000 * 1000

    const createMockFile = (
        name: string,
        size: number,
        type: string = 'image/png',
    ): File => {
        const file = new File([''], name, { type })
        Object.defineProperty(file, 'size', { value: size })
        return file
    }

    const mockUploadedAttachment: GenericAttachment = {
        url: 'https://example.com/uploaded-image.png',
        name: 'uploaded-image.png',
        content_type: 'image/png',
        size: 1000,
        type: 'type',
    }

    beforeEach(() => {
        mockDispatch = jest.fn()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockNotify.mockReturnValue(() => Promise.resolve() as any)
        mockGetFileTooLargeError.mockReturnValue(
            `Failed to upload files. Attached files must be smaller than 5MB.`,
        )
        mockUploadFiles.mockResolvedValue([mockUploadedAttachment])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props: {
        imageUrl?: string
        onChange?: (attachment: UploadedImageAttachment | undefined) => void
    }) => {
        return render(<UploadImageField {...props} />)
    }

    describe('rendering states', () => {
        it('should render default state with drop zone text', () => {
            renderComponent({})

            expect(screen.getByText('Upload custom image')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Upload a custom image to include in your messages',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Supported formats: JPG, PNG. Maximum file size: 5MB',
                ),
            ).toBeInTheDocument()
        })

        it('should render uploaded image when imageUrl is provided', () => {
            renderComponent({ imageUrl: 'https://example.com/test-image.png' })

            const image = screen.getByTestId('image-upload-preview')
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute(
                'src',
                'https://example.com/test-image.png',
            )
            expect(image).toHaveAttribute('alt', 'Uploaded image')
        })

        it('should render remove button when image is uploaded', () => {
            renderComponent({ imageUrl: 'https://example.com/test-image.png' })

            expect(
                screen.getByTestId('image-upload-remove'),
            ).toBeInTheDocument()
        })

        it('should not render remove button when no image is uploaded', () => {
            renderComponent({})

            expect(
                screen.queryByTestId('image-upload-remove'),
            ).not.toBeInTheDocument()
        })
    })

    describe('file upload via input change', () => {
        it('should successfully upload file and call onChange', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })

            const file = createMockFile('test-image.png', 1000)
            const input = screen.getByLabelText(
                'Drop zone files input',
            ) as HTMLInputElement

            await userEvent.upload(input, file)

            await waitFor(() => {
                expect(mockUploadFiles).toHaveBeenCalledWith([file])
            })

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith({
                    url: mockUploadedAttachment.url,
                    name: mockUploadedAttachment.name,
                    content_type: mockUploadedAttachment.content_type,
                })
            })

            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should show error notification when file is too large', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })

            const largeFile = createMockFile(
                'large-image.png',
                MAX_IMAGE_SIZE + 1,
            )
            const input = screen.getByLabelText(
                'Drop zone files input',
            ) as HTMLInputElement

            await userEvent.upload(input, largeFile)

            await waitFor(() => {
                expect(mockGetFileTooLargeError).toHaveBeenCalledWith(
                    MAX_IMAGE_SIZE,
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    status: NotificationStatus.Error,
                    message: `Failed to upload files. Attached files must be smaller than 5MB.`,
                }),
            )

            expect(mockUploadFiles).not.toHaveBeenCalled()
            expect(onChange).not.toHaveBeenCalled()
        })

        it('should handle upload error gracefully', async () => {
            const uploadError = new Error('Upload failed')
            mockUploadFiles.mockRejectedValueOnce(uploadError)

            const onChange = jest.fn()
            renderComponent({ onChange })

            const file = createMockFile('test-image.png', 1000)
            const input = screen.getByLabelText(
                'Drop zone files input',
            ) as HTMLInputElement

            await userEvent.upload(input, file)

            await waitFor(() => {
                expect(mockUploadFiles).toHaveBeenCalledWith([file])
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Error uploading image: ${uploadError}`,
                    }),
                )
            })

            expect(onChange).not.toHaveBeenCalled()
        })

        it('should not call onChange when uploadFiles returns empty array', async () => {
            mockUploadFiles.mockResolvedValueOnce([])

            const onChange = jest.fn()
            renderComponent({ onChange })

            const file = createMockFile('test-image.png', 1000)
            const input = screen.getByLabelText(
                'Drop zone files input',
            ) as HTMLInputElement

            await userEvent.upload(input, file)

            await waitFor(() => {
                expect(mockUploadFiles).toHaveBeenCalledWith([file])
            })

            expect(onChange).not.toHaveBeenCalled()
        })

        it('should work without onChange callback', async () => {
            renderComponent({})

            const file = createMockFile('test-image.png', 1000)
            const input = screen.getByLabelText(
                'Drop zone files input',
            ) as HTMLInputElement

            await userEvent.upload(input, file)

            await waitFor(() => {
                expect(mockUploadFiles).toHaveBeenCalledWith([file])
            })
        })

        it('should show loading state during upload', async () => {
            let resolveUpload: (value: GenericAttachment[]) => void
            const uploadPromise = new Promise<GenericAttachment[]>(
                (resolve) => {
                    resolveUpload = resolve
                },
            )
            mockUploadFiles.mockReturnValueOnce(uploadPromise)

            const onChange = jest.fn()
            renderComponent({ onChange })

            const file = createMockFile('test-image.png', 1000)
            const input = screen.getByLabelText(
                'Drop zone files input',
            ) as HTMLInputElement

            await userEvent.upload(input, file)

            await waitFor(() => {
                expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            })

            resolveUpload!([mockUploadedAttachment])

            await waitFor(() => {
                expect(onChange).toHaveBeenCalled()
            })
        })
    })

    describe('file upload via drag and drop', () => {
        const createDropEvent = (file?: File) => {
            const dropEvent = new Event('drop', { bubbles: true }) as any
            const files = file ? [file] : []
            const items = file ? [{ type: file.type, kind: 'file' }] : []

            dropEvent.dataTransfer = {
                files,
                items: Object.assign(items, { length: items.length }),
            }

            return dropEvent
        }

        it('should successfully upload dropped file and call onChange', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })

            const file = createMockFile('dropped-image.png', 1000)
            const dropZone = screen.getByLabelText('Drop zone files')

            const dropEvent = createDropEvent(file)
            dropZone.dispatchEvent(dropEvent)

            await waitFor(() => {
                expect(mockUploadFiles).toHaveBeenCalledWith([file])
            })

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith({
                    url: mockUploadedAttachment.url,
                    name: mockUploadedAttachment.name,
                    content_type: mockUploadedAttachment.content_type,
                })
            })
        })

        it('should show error when dropped file is too large', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })

            const largeFile = createMockFile(
                'large-image.png',
                MAX_IMAGE_SIZE + 1,
            )
            const dropZone = screen.getByLabelText('Drop zone files')

            const dropEvent = createDropEvent(largeFile)
            dropZone.dispatchEvent(dropEvent)

            await waitFor(() => {
                expect(mockGetFileTooLargeError).toHaveBeenCalledWith(
                    MAX_IMAGE_SIZE,
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    status: NotificationStatus.Error,
                    message: `Failed to upload files. Attached files must be smaller than 5MB.`,
                }),
            )

            expect(mockUploadFiles).not.toHaveBeenCalled()
            expect(onChange).not.toHaveBeenCalled()
        })

        it('should handle drop event without files', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })

            const dropZone = screen.getByLabelText('Drop zone files')

            const dropEvent = createDropEvent()
            dropZone.dispatchEvent(dropEvent)

            expect(mockUploadFiles).not.toHaveBeenCalled()
            expect(onChange).not.toHaveBeenCalled()
        })
    })

    describe('remove image', () => {
        it('should call onChange with undefined when remove button is clicked', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({
                imageUrl: 'https://example.com/test-image.png',
                onChange,
            })

            const removeButton = screen.getByTestId('image-upload-remove')

            await user.click(removeButton)

            expect(onChange).toHaveBeenCalledWith(undefined)
        })

        it('should prevent default behavior when remove button is clicked', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()

            renderComponent({
                imageUrl: 'https://example.com/test-image.png',
                onChange,
            })

            const removeButton = screen.getByTestId('image-upload-remove')

            await user.click(removeButton)

            expect(onChange).toHaveBeenCalledWith(undefined)
            expect(onChange).toHaveBeenCalledTimes(1)
        })

        it('should work without onChange callback when removing', async () => {
            const user = userEvent.setup()
            renderComponent({
                imageUrl: 'https://example.com/test-image.png',
            })

            const removeButton = screen.getByTestId('image-upload-remove')

            await user.click(removeButton)
        })
    })
})
