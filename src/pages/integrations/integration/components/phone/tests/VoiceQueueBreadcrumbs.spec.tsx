import { screen, waitFor } from '@testing-library/react'

import { getVoiceQueue } from '@gorgias/api-client'

import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import VoiceQueueBreadcrumbs from '../VoiceQueueBreadcrumbs'

jest.mock('@gorgias/api-client', () => ({
    getVoiceQueue: jest.fn(),
}))

const getVoiceQueueMock = assumeMock(getVoiceQueue)

describe('<VoiceQueueBreadcrumbs />', () => {
    beforeEach(() => {
        getVoiceQueueMock.mockReset()
    })

    it('should render Voice link for all cases', () => {
        renderWithQueryClientAndRouter(<VoiceQueueBreadcrumbs queueId="123" />)
        expect(screen.getByText('Voice')).toBeInTheDocument()
    })

    it('should render Add call queue for new queue', () => {
        renderWithQueryClientAndRouter(<VoiceQueueBreadcrumbs queueId="new" />)
        expect(screen.getByText('Add call queue')).toBeInTheDocument()
        expect(screen.queryByText('Edit queue')).not.toBeInTheDocument()
    })

    it('should render queue name when queue data is available', async () => {
        getVoiceQueueMock.mockResolvedValue({
            data: {
                name: 'Test Queue',
            },
        } as any)

        renderWithQueryClientAndRouter(<VoiceQueueBreadcrumbs queueId="123" />)
        await waitFor(() => {
            expect(screen.getByText('Test Queue')).toBeInTheDocument()
        })
    })

    it('should render Edit queue when queue data is not available', () => {
        getVoiceQueueMock.mockRejectedValue(new Error('Error'))

        renderWithQueryClientAndRouter(<VoiceQueueBreadcrumbs queueId="123" />)
        expect(screen.getByText('Edit queue')).toBeInTheDocument()
    })

    it('should not fetch queue data when queueId is not a number', () => {
        renderWithQueryClientAndRouter(<VoiceQueueBreadcrumbs queueId="abc" />)
        expect(getVoiceQueueMock).not.toHaveBeenCalled()
    })

    it('should not fetch queue data when queueId is new', () => {
        renderWithQueryClientAndRouter(<VoiceQueueBreadcrumbs queueId="new" />)
        expect(getVoiceQueueMock).not.toHaveBeenCalled()
    })
})
