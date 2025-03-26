import { fireEvent, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'

import { listVoiceQueues } from '@gorgias/api-client'

import { voiceQueue } from 'fixtures/voiceQueue'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueList from '../VoiceQueueList'
import VoiceQueueListPage from '../VoiceQueueListPage'

jest.mock('@gorgias/api-client', () => ({
    listVoiceQueues: jest.fn(),
}))
const listVoiceQueuesMock = assumeMock(listVoiceQueues)

jest.mock('../VoiceQueueList')
const VoiceQueueListMock = assumeMock(VoiceQueueList)
jest.mock('pages/common/components/Paginations/NumberedPagination', () => ({
    NumberedPagination: ({
        onChange,
    }: {
        onChange: (page: number) => void
    }) => (
        <div>
            <div>NumberedPagination</div>
            <button onClick={() => onChange(1)}>page 1</button>
            <button onClick={() => onChange(2)}>page 2</button>
        </div>
    ),
}))

jest.mock('pages/history')

describe('VoiceQueueListPage', () => {
    const renderComponent = () => {
        return renderWithQueryClientProvider(<VoiceQueueListPage />)
    }

    beforeEach(() => {
        VoiceQueueListMock.mockReturnValue(<div>VoiceQueueList</div>)
    })

    it('should render the list when request is successful', async () => {
        listVoiceQueuesMock.mockResolvedValue({
            data: {
                data: [voiceQueue],
            },
        } as any)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('VoiceQueueList')).toBeInTheDocument()
            expect(screen.getByText('NumberedPagination')).toBeInTheDocument()
        })
    })

    it('should render the no queues message when request is successful and there are no queues', async () => {
        listVoiceQueuesMock.mockResolvedValue({
            data: {
                data: [],
            },
        } as any)
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('You have no queues at the moment.'),
            ).toBeInTheDocument()
        })

        const createQueueButton = screen.getByText('Create queue')
        expect(createQueueButton.closest('a')).toHaveAttribute(
            'href',
            `${PHONE_INTEGRATION_BASE_URL}/queues/new`,
        )
    })

    it('should render the error when request is rejected', async () => {
        listVoiceQueuesMock.mockRejectedValue({
            message: 'Error',
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Retry')).toBeInTheDocument()
        })

        const listVoiceQueuesMockCalls = listVoiceQueuesMock.mock.calls.length

        act(() => {
            fireEvent.click(screen.getByText('Retry'))
        })

        expect(listVoiceQueuesMock).toHaveBeenCalledTimes(
            listVoiceQueuesMockCalls + 1,
        )
    })

    it('should request the correct data when the page is changed', async () => {
        listVoiceQueuesMock.mockResolvedValue({
            data: {
                data: [voiceQueue],
                meta: {
                    totalResources: 100,
                    prev_cursor: 'prev_cursor',
                    next_cursor: 'next_cursor',
                },
            },
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(VoiceQueueListMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    isFetching: false,
                }),
                {},
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('page 2'))
        })

        await waitFor(() => {
            expect(listVoiceQueuesMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    cursor: 'next_cursor',
                }),
                expect.anything(),
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('page 1'))
        })

        await waitFor(() => {
            expect(listVoiceQueuesMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    cursor: 'prev_cursor',
                }),
                expect.anything(),
            )
        })
    })
})
