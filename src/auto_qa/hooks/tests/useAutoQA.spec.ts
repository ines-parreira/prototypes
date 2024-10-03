import {
    TicketQAScoreDimensionName,
    useListTicketQaScoreDimensions,
    useUpsertTicketQaScoreDimension,
} from '@gorgias/api-queries'
import {act, renderHook} from '@testing-library/react-hooks'

import useAutoQA from '../useAutoQA'

jest.mock('@gorgias/api-queries', () => ({
    TicketQAScoreDimensionName: {
        CommunicationSkills: 'communication_skills',
        ResolutionCompleteness: 'resolution_completeness',
    },
    useListTicketQaScoreDimensions: jest.fn(),
    useUpsertTicketQaScoreDimension: jest.fn(),
}))
const useListTicketQaScoreDimensionsMock =
    useListTicketQaScoreDimensions as jest.Mock
const useUpsertTicketQaScoreDimensionMock =
    useUpsertTicketQaScoreDimension as jest.Mock
const refetchMock = jest.fn()

describe('useAutoQA', () => {
    beforeEach(() => {
        jest.useRealTimers()

        useListTicketQaScoreDimensionsMock.mockReturnValue({
            data: {
                data: {
                    data: {
                        dimensions: [
                            {
                                id: 1,
                                ticket_id: 1,
                                user_id: 801087805,
                                created_datetime: '2024-01-20T10:00:00Z',
                                updated_datetime: '2024-09-16T08:00:00Z',
                                name: TicketQAScoreDimensionName.ResolutionCompleteness,
                                prediction: 0,
                                explanation: 'Beep-boop',
                            },
                            {
                                id: 2,
                                ticket_id: 1,
                                user_id: null,
                                created_datetime: '2024-01-20T10:00:00Z',
                                updated_datetime: '2024-01-21T10:00:00Z',
                                name: TicketQAScoreDimensionName.CommunicationSkills,
                                prediction: 4,
                                explanation: 'Beepity-boopity',
                            },
                        ],
                    },
                },
            },
            refetch: refetchMock,
        })

        useUpsertTicketQaScoreDimensionMock.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
        })
    })

    it('should return empty data', () => {
        useListTicketQaScoreDimensionsMock.mockReturnValue({
            data: {
                data: {},
            },
        })

        const {result} = renderHook(() => useAutoQA(1))
        expect(result.current.dimensions).toEqual([])
    })

    it('should return the dimensions', () => {
        const {result} = renderHook(() => useAutoQA(1))
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({
                name: TicketQAScoreDimensionName.ResolutionCompleteness,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.CommunicationSkills,
            }),
        ])
    })

    it('should return an edited value if applicable', () => {
        const {result} = renderHook(() => useAutoQA(1))
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 0, explanation: 'Beep-boop'}),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beepity-boopity',
            }),
        ])

        act(() => {
            result.current.changeHandlers[
                TicketQAScoreDimensionName.ResolutionCompleteness
            ](1, 'Yup')
        })
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 1, explanation: 'Yup'}),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beepity-boopity',
            }),
        ])

        act(() => {
            result.current.changeHandlers[
                TicketQAScoreDimensionName.CommunicationSkills
            ](5, 'Excellent')
        })
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 1, explanation: 'Yup'}),
            expect.objectContaining({
                prediction: 5,
                explanation: 'Excellent',
            }),
        ])
    })

    it('should save changed values with a delay', () => {
        jest.useFakeTimers()
        const mutateAsync = jest.fn()
        useUpsertTicketQaScoreDimensionMock.mockReturnValue({
            isLoading: false,
            mutateAsync,
        })

        const {result} = renderHook(() => useAutoQA(1))

        act(() => {
            result.current.changeHandlers[
                TicketQAScoreDimensionName.CommunicationSkills
            ](5, 'Excellent')
        })
        act(() => {
            jest.advanceTimersByTime(1500)
        })

        expect(mutateAsync).toHaveBeenCalledWith(
            {
                data: {
                    dimensions: [
                        {
                            explanation: 'Excellent',
                            name: 'communication_skills',
                            prediction: 5,
                        },
                    ],
                },
                ticketId: 1,
            },
            {
                onSuccess: expect.anything(),
            }
        )
        ;(
            mutateAsync.mock.calls[0] as [{data: []}, {onSuccess: () => void}]
        )[1].onSuccess()
        expect(refetchMock).toHaveBeenCalled()
    })
})
