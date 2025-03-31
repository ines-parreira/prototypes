import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useListVoiceQueues } from '@gorgias/api-queries'

import { assumeMock, getLastMockCall } from 'utils/testing'

import CreateNewQueueModal from '../CreateNewQueueModal'
import VoiceQueueSelectField from '../VoiceQueueSelectField'

jest.mock('@gorgias/api-queries', () => ({
    ...jest.requireActual('@gorgias/api-queries'),
    useListVoiceQueues: jest.fn(),
}))

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div>Skeleton</div>,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)

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
    ]

    beforeEach(() => {
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: { data: { data: mockQueues } },
            isFetching: false,
            error: null,
            refetch: jest.fn(),
        })
        CreateNewQueueModalMock.mockImplementation(() => (
            <div>CreateNewQueueModal</div>
        ))
    })

    it('should display the selected queue name', () => {
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: { data: { data: mockQueues } },
            isFetching: false,
            error: null,
        })

        const { getByText } = renderComponent(2)

        expect(getByText('Queue name')).toBeInTheDocument()
        expect(getByText('Queue 2')).toBeInTheDocument()
        expect(
            getByText(/Assigning a queue applies its settings automatically/),
        ).toBeInTheDocument()
    })

    it('should open the dropdown when clicked', () => {
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: { data: { data: mockQueues } },
            isFetching: false,
            error: null,
        })

        const { getByText } = renderComponent()

        const selectInput = getByText('Select queue')
        fireEvent.focus(selectInput)

        expect(getByText('Queue 1')).toBeInTheDocument()
        expect(getByText('Queue 2')).toBeInTheDocument()
        expect(getByText('Queue 3')).toBeInTheDocument()
        expect(getByText('Queue #4')).toBeInTheDocument()
    })

    it('should call the onChange function when a queue is selected', () => {
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: { data: { data: mockQueues } },
            isFetching: false,
            error: null,
        })

        const { getByText } = renderComponent()

        const selectInput = getByText('Select queue')
        fireEvent.focus(selectInput)

        const queue2Option = getByText('Queue 2')
        fireEvent.click(queue2Option)
        expect(handleChange).toHaveBeenCalledWith(2)
    })

    it('should disable input when there is an error', () => {
        const mockRefetch = jest.fn()
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: null,
            isFetching: false,
            error: new Error('error'),
            refetch: mockRefetch,
        })

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
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: { data: { data: mockQueues } },
            isFetching: false,
            error: null,
        })

        const { getByText } = renderComponent()

        expect(getByText('Select queue')).toBeInTheDocument()
    })

    it('should display skeletons when data is loading', () => {
        ;(useListVoiceQueues as jest.Mock).mockReturnValue({
            data: { data: { data: mockQueues } },
            isFetching: true,
            error: null,
        })

        const { getAllByText } = renderComponent()

        expect(getAllByText('Skeleton')).toHaveLength(4)
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
