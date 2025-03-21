import { screen, waitFor } from '@testing-library/react'

import { listVoiceQueues } from '@gorgias/api-client'

import { voiceQueue } from 'fixtures/voiceQueue'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import VoiceQueueListPage from '../VoiceQueueListPage'

jest.mock('@gorgias/api-client', () => ({
    listVoiceQueues: jest.fn(() => ({
        mutate: jest.fn(),
        isLoading: false,
        isError: false,
        error: null,
    })),
}))
const listVoiceQueuesMock = assumeMock(listVoiceQueues)

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))

jest.mock('pages/history')

describe('VoiceQueueListPage', () => {
    const renderComponent = () => {
        return renderWithQueryClientProvider(<VoiceQueueListPage />)
    }

    it('should render the list when request is successful', async () => {
        listVoiceQueuesMock.mockResolvedValue({
            data: {
                data: [voiceQueue],
            },
        } as any)
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(voiceQueue.name as string),
            ).toBeInTheDocument()
        })
    })

    it('should render the loader when request is pending', () => {
        listVoiceQueuesMock.mockResolvedValue({
            data: {
                data: [],
            },
        } as any)
        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render the error when request is rejected', async () => {
        listVoiceQueuesMock.mockRejectedValue({
            message: 'Error',
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeInTheDocument()
        })
    })
})
