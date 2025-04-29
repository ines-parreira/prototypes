import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useGetVoiceQueue, VoiceQueue } from '@gorgias/api-queries'

import { useVoiceQueueSearch } from 'hooks/reporting/common/useVoiceQueueSearch'
import { assumeMock, getLastMockCall } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import CreateNewQueueModal from '../CreateNewQueueModal'
import VoiceQueueSelectField from '../VoiceQueueSelectField'

jest.mock('@gorgias/api-queries', () => ({
    ...jest.requireActual('@gorgias/api-queries'),
    useListVoiceQueues: jest.fn(),
    useGetVoiceQueue: jest.fn(),
}))

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div>Skeleton</div>,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)

jest.mock('hooks/reporting/common/useVoiceQueueSearch')
const useVoiceQueueSearchMock = assumeMock(useVoiceQueueSearch)

const useGetVoiceQueueMock = assumeMock(useGetVoiceQueue)
jest.mock('../CreateNewQueueModal')
const CreateNewQueueModalMock = assumeMock(CreateNewQueueModal)

const handleChange = jest.fn()
const renderComponent = (value?: number) =>
    render(<VoiceQueueSelectField value={value} onChange={handleChange} />)

describe('<VoiceQueueSelectField />', () => {
    const mockQueues = [
        { id: 1, name: 'Queue 1' },
        { id: 2, name: 'Queue 2' },
        { id: 3, name: 'Queue 3' },
        { id: 4, name: null },
    ] as VoiceQueue[]

    beforeEach(() => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isFetching: false,
            error: null,
            refetch: jest.fn(),
        } as any)
        useGetVoiceQueueMock.mockReturnValue({
            data: null,
            isFetching: false,
            error: null,
        } as any)
        CreateNewQueueModalMock.mockImplementation(() => (
            <div>CreateNewQueueModal</div>
        ))
    })

    it('should display the selected queue name', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isFetching: false,
            error: null,
        } as any)

        const { getByText } = renderComponent(2)

        expect(getByText('Queue name')).toBeInTheDocument()
        expect(getByText('Queue 2')).toBeInTheDocument()
        expect(
            getByText(/Assigning a queue applies its settings automatically/),
        ).toBeInTheDocument()
    })

    it('Queues link should redirect to Edit queue page when a queue is selected', () => {
        renderComponent(2)

        const anchorEl = screen
            .getByRole('link', { name: 'Queues' })
            .closest('a')
        expect(anchorEl).toHaveAttribute(
            'href',
            `${PHONE_INTEGRATION_BASE_URL}/queues/2`,
        )
    })

    it('Queues link should redirect to Queues page when no queue is selected', () => {
        renderComponent()

        const anchorEl = screen
            .getByRole('link', { name: 'Queues' })
            .closest('a')
        expect(anchorEl).toHaveAttribute(
            'href',
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })

    it('should fetch the queue data when the queue data is not found in the list of queues', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: [mockQueues[1]],
            isFetching: false,
            error: null,
        } as any)

        useGetVoiceQueueMock.mockReturnValue({
            data: { data: mockQueues[0] },
            isFetching: false,
            error: null,
        } as any)

        renderComponent(mockQueues[0].id)

        expect(screen.getByText(mockQueues[0].name)).toBeInTheDocument()
    })

    it('should open the dropdown when clicked', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isFetching: false,
            error: null,
        } as any)

        const { getByText } = renderComponent()

        const selectInput = getByText('Select queue')
        fireEvent.focus(selectInput)

        expect(getByText('Queue 1')).toBeInTheDocument()
        expect(getByText('Queue 2')).toBeInTheDocument()
        expect(getByText('Queue 3')).toBeInTheDocument()
        expect(getByText('Queue #4')).toBeInTheDocument()
    })

    it('should call the onChange function when a queue is selected', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isFetching: false,
            error: null,
        } as any)

        const { getByText } = renderComponent()

        const selectInput = getByText('Select queue')
        fireEvent.focus(selectInput)

        const queue2Option = getByText('Queue 2')
        fireEvent.click(queue2Option)
        expect(handleChange).toHaveBeenCalledWith(2)
    })

    it('should disable input when there is an error', () => {
        const mockRefetch = jest.fn()
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isFetching: false,
            isError: true,
            refetch: mockRefetch,
        } as any)

        const { getByText } = renderComponent()

        expect(
            getByText(
                'There was an error while trying to fetch the queues. Please try again later.',
            ),
        ).toBeInTheDocument()
        expect(getByText('Retry')).toBeInTheDocument()

        fireEvent.click(getByText('Retry'))
        expect(mockRefetch).toHaveBeenCalled()
    })

    it('should display message when there is no selected queue', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isFetching: false,
            error: null,
        } as any)

        const { getByText } = renderComponent()

        expect(getByText('Select queue')).toBeInTheDocument()
    })

    it('should display skeletons when data is loading', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: mockQueues,
            isLoading: true,
            error: null,
        } as any)

        const { getAllByText } = renderComponent()

        expect(getAllByText('Skeleton')).toHaveLength(4)
    })

    it('should display empty state for no queues', () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: [],
            isLoading: false,
            error: null,
        } as any)

        const { getByText } = render(
            <VoiceQueueSelectField value={2} onChange={handleChange} />,
        )

        expect(getByText('No call queues yet?')).toBeInTheDocument()
        expect(getByText('Create New Call Queue')).toBeInTheDocument()
    })

    it('should open the create new queue modal with no queues', async () => {
        useVoiceQueueSearchMock.mockReturnValue({
            voiceQueues: [],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any)

        renderComponent()

        fireEvent.click(screen.getByText('Create New Call Queue'))
        expect(CreateNewQueueModalMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: true,
            }),
            {},
        )

        const lastCall = getLastMockCall(CreateNewQueueModalMock)
        lastCall[0].onCreateSuccess(1)
        expect(handleChange).toHaveBeenCalledWith(1)

        lastCall[0].onClose()
        await waitFor(() => {
            expect(CreateNewQueueModalMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isOpen: false,
                }),
                {},
            )
        })
    })

    it('should open the create new queue modal when the button is clicked', async () => {
        renderComponent()

        const selectInput = screen.getByText('Select queue')
        fireEvent.focus(selectInput)

        fireEvent.click(screen.getByText('Create queue'))
        expect(CreateNewQueueModalMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: true,
            }),
            {},
        )

        const lastCall = getLastMockCall(CreateNewQueueModalMock)
        lastCall[0].onCreateSuccess(1)
        expect(handleChange).toHaveBeenCalledWith(1)

        lastCall[0].onClose()
        await waitFor(() => {
            expect(CreateNewQueueModalMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isOpen: false,
                }),
                {},
            )
        })
    })
})
