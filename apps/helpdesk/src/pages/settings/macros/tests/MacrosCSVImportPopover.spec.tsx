import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { toast } from '@gorgias/axiom'

import { uploadFiles } from 'common/utils'
import { createJob } from 'models/job/resources'
import { saveFileAsDownloaded } from 'utils/file'

import { MacrosCSVImportPopover } from '../MacrosCSVImportPopover'

jest.mock('utils/file')
jest.mock('common/utils', () => {
    const original: Record<string, unknown> = jest.requireActual('common/utils')
    return {
        ...original,
        uploadFiles: jest.fn(() =>
            Promise.resolve([{ url: 'https://example.com/file1.csv' }]),
        ),
    }
})
jest.mock('models/job/resources', () => ({
    createJob: jest.fn(() => Promise.resolve()),
}))
describe('<MacrosCSVImportPopover/>', () => {
    const mockedServer = new MockAdapter(client)
    const onClose = jest.fn()
    const minProps = {
        isOpen: true,
        onClose,
    }
    const uploadFilesMock = uploadFiles as jest.MockedFunction<
        typeof uploadFiles
    >
    const createJobMock = createJob as jest.MockedFunction<typeof createJob>

    afterEach(() => {
        toast.dismiss()
    })

    const dropCsv = async (dropZone: HTMLElement) => {
        const dummyFile = {
            getAsFile: () =>
                new File(['file.csv'], 'file.csv', {
                    type: 'text/csv',
                }),
        }
        await waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            }),
        )
    }
    it.each([false, true])('should render', (isOpen) => {
        const { baseElement } = render(
            <MacrosCSVImportPopover {...{ ...minProps, isOpen }} />,
            {},
        )
        expect(baseElement).toMatchSnapshot()
    })
    it('should close when cancel clicked', () => {
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        fireEvent.click(getByText('×'))
        expect(onClose).toHaveBeenCalled()
    })
    it('should download template when clicked', async () => {
        mockedServer.onGet('/api/macros/import/template/').reply(200, {})
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        fireEvent.click(getByText('download this CSV template'))
        await waitFor(() => expect(saveFileAsDownloaded).toHaveBeenCalled())
    })
    it('should add footer because file is set', async () => {
        const dummyFile = {
            getAsFile: () =>
                new File(['file.csv'], 'file.csv', {
                    type: 'text/csv',
                }),
        }
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        const dropZone = getByText('Drop your CSV here, or')
        await waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            }),
        )
        expect(screen.getByText('Import File')).toBeTruthy()
    })
    it('should start import job', async () => {
        const dummyFile = {
            getAsFile: () =>
                new File(['file.csv'], 'file.csv', {
                    type: 'text/csv',
                }),
        }
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        const dropZone = getByText('Drop your CSV here, or')
        await waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            }),
        )
        await waitFor(() => fireEvent.click(screen.getByText('Import File')))
        expect(uploadFiles).toHaveBeenCalled()
        expect(createJob).toHaveBeenCalled()
    })

    it('should show a success toast when the import job is created', async () => {
        uploadFilesMock.mockResolvedValueOnce([
            { url: 'https://example.com/file1.csv' } as never,
        ])
        createJobMock.mockResolvedValueOnce(undefined as never)
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        await dropCsv(getByText('Drop your CSV here, or'))
        await waitFor(() => fireEvent.click(screen.getByText('Import File')))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /All the macros will be imported/i,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show an error toast when uploadFiles fails with a 413', async () => {
        const error = new AxiosError('too large')
        error.response = {
            status: 413,
            data: { error: { msg: 'too large' } },
        } as never
        uploadFilesMock.mockRejectedValueOnce(error)
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        await dropCsv(getByText('Drop your CSV here, or'))
        await waitFor(() => fireEvent.click(screen.getByText('Import File')))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Failed to upload file because its size is bigger than 10MB/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should show an error toast when uploadFiles fails with a server message', async () => {
        const error = new AxiosError('upload failed')
        error.response = {
            status: 500,
            data: { error: { msg: 'storage offline' } },
        } as never
        uploadFilesMock.mockRejectedValueOnce(error)
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        await dropCsv(getByText('Drop your CSV here, or'))
        await waitFor(() => fireEvent.click(screen.getByText('Import File')))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'storage offline' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should show an error toast when createJob fails', async () => {
        uploadFilesMock.mockResolvedValueOnce([
            { url: 'https://example.com/file1.csv' } as never,
        ])
        const error = new AxiosError('job failed')
        error.response = {
            status: 500,
            data: { error: { msg: 'queue is full' } },
        } as never
        createJobMock.mockRejectedValueOnce(error)
        const { getByText } = render(
            <MacrosCSVImportPopover {...minProps} />,
            {},
        )
        await dropCsv(getByText('Drop your CSV here, or'))
        await waitFor(() => fireEvent.click(screen.getByText('Import File')))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'queue is full' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
