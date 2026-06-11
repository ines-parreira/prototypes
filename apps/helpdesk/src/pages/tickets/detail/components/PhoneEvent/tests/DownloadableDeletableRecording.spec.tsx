import client from '@repo/api-resources'
import { render, renderHook } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { UserRole } from 'config/types/user'

import {
    DownloadableDeletableRecording,
    useDownloadRecording,
} from '../DownloadableDeletableRecording'

const mockedServer = new MockAdapter(client)
const mockStore = configureMockStore()

describe('DownloadableDeletableRecording', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('useDownloadRecording', () => {
        it('shows an error toast when the download fails', async () => {
            mockedServer
                .onGet('/api/recordings/1/download')
                .reply(500, { error: { msg: 'Recording unavailable' } })

            const { result } = renderHook(() =>
                useDownloadRecording('/api/recordings/1/download'),
            )

            await act(async () => {
                await result.current.downloadRecording()
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Recording unavailable',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('delete recording', () => {
        const adminStore = mockStore({
            currentUser: fromJS({
                role: { name: UserRole.Admin },
            }),
        })

        it('shows an error toast when the delete fails', async () => {
            mockedServer
                .onDelete('/api/recordings/1')
                .reply(500, { error: { msg: 'Cannot delete recording' } })

            render(
                <Provider store={adminStore}>
                    <DownloadableDeletableRecording
                        downloadRecordingURL="/api/recordings/1/download"
                        deleteRecordingURL="/api/recordings/1"
                    />
                </Provider>,
            )

            fireEvent.click(screen.getByText('delete'))
            await waitFor(() => {
                expect(screen.getByText('Confirm')).toBeInTheDocument()
            })
            fireEvent.click(screen.getByText('Confirm'))

            const toastEl = await screen.findByRole('status', {
                name: 'Cannot delete recording',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
