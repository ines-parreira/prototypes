import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { useInfiniteListVoiceQueues } from 'domains/reporting/hooks/common/useInfiniteListVoiceQueues'
import { voiceQueue } from 'fixtures/voiceQueue'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueList from '../VoiceQueueList'
import VoiceQueueListPage from '../VoiceQueueListPage'

jest.mock('domains/reporting/hooks/common/useInfiniteListVoiceQueues')
const useInfiniteListVoiceQueuesMock = assumeMock(useInfiniteListVoiceQueues)

jest.mock('../VoiceQueueList')
const VoiceQueueListMock = assumeMock(VoiceQueueList)

jest.mock('pages/history')

describe('VoiceQueueListPage', () => {
    const renderComponent = () => {
        return renderWithQueryClientProvider(<VoiceQueueListPage />)
    }

    beforeEach(() => {
        VoiceQueueListMock.mockImplementation(({ onScroll }) => (
            <div>
                VoiceQueueList
                <button onClick={onScroll}>scroll</button>
            </div>
        ))
        useInfiniteListVoiceQueuesMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [voiceQueue],
                        },
                    },
                ],
            },
            isFetching: false,
            isFetchingNextPage: false,
            isFetchedAfterMount: true,
            refetch: jest.fn(),
            hasNextPage: true,
            fetchNextPage: jest.fn(),
            isError: false,
        } as any)
    })

    it('should render the list when request is successful', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('VoiceQueueList')).toBeInTheDocument()
        })

        expect(screen.getByText('scroll')).toBeInTheDocument()

        fireEvent.click(screen.getByText('scroll'))
        expect(
            useInfiniteListVoiceQueuesMock().fetchNextPage,
        ).toHaveBeenCalled()
    })

    it.each([
        { isFetching: false, hasNextPage: false, isFetchingNextPage: false },
        { isFetching: true, hasNextPage: true, isFetchingNextPage: false },
        { isFetching: false, hasNextPage: true, isFetchingNextPage: true },
    ])(
        'should not try to scroll',
        async ({ isFetching, hasNextPage, isFetchingNextPage }) => {
            useInfiniteListVoiceQueuesMock.mockReturnValue({
                isFetching,
                isFetchingNextPage,
                hasNextPage,
                data: {
                    pages: [
                        {
                            data: {
                                data: [voiceQueue],
                            },
                        },
                    ],
                },
                isFetchedAfterMount: true,
                refetch: jest.fn(),
                fetchNextPage: jest.fn(),
                isError: false,
            } as any)
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('VoiceQueueList')).toBeInTheDocument()
            })

            expect(screen.getByText('scroll')).toBeInTheDocument()

            fireEvent.click(screen.getByText('scroll'))
            expect(
                useInfiniteListVoiceQueuesMock().fetchNextPage,
            ).not.toHaveBeenCalled()
        },
    )

    it('should render the no queues message when request is successful and there are no queues', async () => {
        useInfiniteListVoiceQueuesMock.mockReturnValue({
            data: {
                pages: [],
            },
            isFetchedAfterMount: true,
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
        const mockRefetch = jest.fn()
        useInfiniteListVoiceQueuesMock.mockReturnValue({
            isError: true,
            refetch: mockRefetch,
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Retry')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Retry'))
        })

        expect(mockRefetch).toHaveBeenCalled()
    })
})
