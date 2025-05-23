import { useContext } from 'react'

import { render, waitFor } from '@testing-library/react'

import { useListVoiceQueues } from '@gorgias/helpdesk-queries'

import { VoiceQueueContext } from './VoiceQueueContext'
import VoiceQueueProvider from './VoiceQueueProvider'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useListVoiceQueues: jest.fn(),
}))

describe('VoiceQueueProvider', () => {
    const useListVoiceQueuesMock = useListVoiceQueues as jest.Mock

    const mockVoiceQueues = [
        { id: 1, name: 'Queue 1' },
        { id: 2, name: 'Queue 2' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch and provide voice queues', async () => {
        useListVoiceQueuesMock.mockReturnValue({
            data: { data: { data: mockVoiceQueues } },
            isFetching: false,
        })

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        render(
            <VoiceQueueProvider queueIds={[1, 2]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(1)).toEqual(mockVoiceQueues[0])
            expect(contextValue.getQueueFromId(2)).toEqual(mockVoiceQueues[1])
            expect(useListVoiceQueuesMock).toHaveBeenCalledWith(
                {
                    id: [1, 2],
                },
                {
                    query: {
                        enabled: true,
                    },
                },
            )
        })
    })

    it('should return undefined for a queue ID if not ready', () => {
        useListVoiceQueuesMock.mockReturnValue({
            data: null,
            isFetching: true,
        })

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        render(
            <VoiceQueueProvider queueIds={[1]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        expect(contextValue.getQueueFromId(1)).toBeUndefined()
        expect(useListVoiceQueuesMock).toHaveBeenCalledWith(
            {
                id: [1],
            },
            {
                query: {
                    enabled: true,
                },
            },
        )
    })

    it('should return null for a queue ID if ready but queue not found', async () => {
        useListVoiceQueuesMock.mockReturnValue({
            data: { data: { data: [] } },
            isFetching: false,
        })

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        render(
            <VoiceQueueProvider queueIds={[3]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(3)).toBeNull()
            expect(useListVoiceQueuesMock).toHaveBeenCalledWith(
                {
                    id: [3],
                },
                {
                    query: {
                        enabled: true,
                    },
                },
            )
        })
    })

    it('should fetch and provide only voice queues for which we do not yet have data', async () => {
        useListVoiceQueuesMock.mockReturnValue({
            data: { data: { data: [mockVoiceQueues[0]] } },
            isFetching: false,
        })

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        const { rerender } = render(
            <VoiceQueueProvider queueIds={[1]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(1)).toEqual(mockVoiceQueues[0])
            expect(contextValue.getQueueFromId(2)).toEqual(null)
            expect(useListVoiceQueuesMock).toHaveBeenCalledWith(
                {
                    id: [1],
                },
                {
                    query: {
                        enabled: true,
                    },
                },
            )
        })

        useListVoiceQueuesMock.mockReturnValue({
            data: { data: { data: [mockVoiceQueues[1]] } },
            isFetching: false,
        })

        rerender(
            <VoiceQueueProvider queueIds={[1, 2]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(2)).toEqual(mockVoiceQueues[1])
            expect(useListVoiceQueuesMock).toHaveBeenCalledWith(
                {
                    id: [2],
                },
                {
                    query: {
                        enabled: true,
                    },
                },
            )
        })

        useListVoiceQueuesMock.mockReturnValue({
            data: { data: { data: [] } },
            isFetching: false,
        })

        rerender(
            <VoiceQueueProvider queueIds={[1, 2]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(useListVoiceQueuesMock).toHaveBeenCalledWith(
                {
                    id: [],
                },
                {
                    query: {
                        enabled: false,
                    },
                },
            )
        })
    })
})
