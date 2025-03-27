import { screen, waitFor } from '@testing-library/react'

import { getVoiceQueue } from '@gorgias/api-client'
import { useGetVoiceQueue, useUpdateVoiceQueue } from '@gorgias/api-queries'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import VoiceQueueBreadcrumbs from '../VoiceQueueBreadcrumbs'

jest.mock('@gorgias/api-client', () => ({
    getVoiceQueue: jest.fn(),
}))

jest.mock('@gorgias/api-queries', () => ({
    useUpdateVoiceQueue: jest.fn(),
    useGetVoiceQueue: jest.fn(),
}))

const getVoiceQueueMock = assumeMock(getVoiceQueue)
const useUpdateVoiceQueueMock = assumeMock(useUpdateVoiceQueue)
const useGetVoiceQueueMock = assumeMock(useGetVoiceQueue)

describe('<VoiceQueueBreadcrumbs />', () => {
    const mockMutate = jest.fn()

    beforeEach(() => {
        getVoiceQueueMock.mockReset()
        useUpdateVoiceQueueMock.mockReset()
        useGetVoiceQueueMock.mockReset()
        // @ts-ignore - Mock only includes what's needed by the component
        useUpdateVoiceQueueMock.mockReturnValue({
            mutate: mockMutate,
        })
    })

    it('should render Voice link for all cases', () => {
        // @ts-ignore - Mock only includes what's needed by the component
        useGetVoiceQueueMock.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })
        renderWithStoreAndQueryClientAndRouter(
            <VoiceQueueBreadcrumbs queueId="123" />,
        )
        expect(screen.getByText('Voice')).toBeInTheDocument()
    })

    it('should render Add call queue for new queue', () => {
        // @ts-ignore - Mock only includes what's needed by the component
        useGetVoiceQueueMock.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })
        renderWithStoreAndQueryClientAndRouter(
            <VoiceQueueBreadcrumbs queueId="new" />,
        )
        expect(screen.getByText('Add call queue')).toBeInTheDocument()
        expect(screen.queryByText('Edit queue')).not.toBeInTheDocument()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('should render queue name and status toggle when queue data is available', async () => {
        // @ts-ignore - Mock only includes what's needed by the component
        useGetVoiceQueueMock.mockReturnValue({
            data: {
                data: {
                    name: 'Test Queue',
                    status: 'enabled',
                },
            },
            isLoading: false,
            isError: false,
        })

        renderWithStoreAndQueryClientAndRouter(
            <VoiceQueueBreadcrumbs queueId="123" />,
        )
        await waitFor(() => {
            expect(screen.getByText('Test Queue')).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeChecked()
        })
    })

    it('should render Edit queue and not render status toggle when queue data is not available', () => {
        // @ts-ignore - Mock only includes what's needed by the component
        useGetVoiceQueueMock.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        renderWithStoreAndQueryClientAndRouter(
            <VoiceQueueBreadcrumbs queueId="123" />,
        )
        expect(screen.getByText('Edit queue')).toBeInTheDocument()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('should not fetch queue data or render status toggle when queueId is not a number', () => {
        // @ts-ignore - Mock only includes what's needed by the component
        useGetVoiceQueueMock.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })
        renderWithStoreAndQueryClientAndRouter(
            <VoiceQueueBreadcrumbs queueId="abc" />,
        )
        expect(getVoiceQueueMock).not.toHaveBeenCalled()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('should not fetch queue data or render status toggle when queueId is new', () => {
        // @ts-ignore - Mock only includes what's needed by the component
        useGetVoiceQueueMock.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })
        renderWithStoreAndQueryClientAndRouter(
            <VoiceQueueBreadcrumbs queueId="new" />,
        )
        expect(getVoiceQueueMock).not.toHaveBeenCalled()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })
})
