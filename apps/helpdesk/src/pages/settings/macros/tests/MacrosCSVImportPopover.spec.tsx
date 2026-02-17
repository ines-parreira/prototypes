import { saveFileAsDownloaded } from '@repo/utils'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { uploadFiles } from 'common/utils'
import client from 'models/api/resources'
import { createJob } from 'models/job/resources'
import { renderWithRouter } from 'utils/testing'

import { MacrosCSVImportPopover } from '../MacrosCSVImportPopover'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    saveZippedFiles: jest.fn(),
    saveFileAsDownloaded: jest.fn(),
    saveBlobAsDownloaded: jest.fn(),
    createCsv: jest.fn(),
    getText: jest.fn(),
    getBase64: jest.fn(),
    getFileTooLargeError: jest.fn(),
}))

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

    const defaultStore = configureMockStore([thunk])()
    const onClose = jest.fn()

    const minProps = {
        isOpen: true,
        onClose,
    }

    it.each([false, true])('should render', (isOpen) => {
        const { baseElement } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCSVImportPopover {...{ ...minProps, isOpen }} />
            </Provider>,
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should close when cancel clicked', () => {
        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCSVImportPopover {...minProps} />
            </Provider>,
        )
        fireEvent.click(getByText('×'))
        expect(onClose).toHaveBeenCalled()
    })

    it('should download template when clicked', async () => {
        mockedServer.onGet('/api/macros/import/template/').reply(200, {})

        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCSVImportPopover {...minProps} />
            </Provider>,
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
        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCSVImportPopover {...minProps} />
            </Provider>,
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
        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCSVImportPopover {...minProps} />
            </Provider>,
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
})
