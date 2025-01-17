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
        LanguageProficiency: 'language_proficiency',
        Accuracy: 'accuracy',
        Efficiency: 'efficiency',
        InternalCompliance: 'internal_compliance',
        BrandVoice: 'brand_voice',
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
                            {
                                id: 3,
                                ticket_id: 1,
                                user_id: null,
                                created_datetime: '2024-01-20T10:00:00Z',
                                updated_datetime: '2024-01-21T10:00:00Z',
                                name: TicketQAScoreDimensionName.LanguageProficiency,
                                prediction: 4,
                                explanation: 'Boopity-boop',
                            },
                            {
                                id: 4,
                                ticket_id: 1,
                                user_id: null,
                                created_datetime: '2024-01-20T10:00:00Z',
                                updated_datetime: '2024-01-21T10:00:00Z',
                                name: TicketQAScoreDimensionName.Accuracy,
                                prediction: 5,
                                explanation: 'Boop-boop',
                            },
                            {
                                id: 5,
                                ticket_id: 1,
                                user_id: null,
                                created_datetime: '2024-01-20T10:00:00Z',
                                updated_datetime: '2024-01-21T10:00:00Z',
                                name: TicketQAScoreDimensionName.Efficiency,
                                prediction: 3,
                                explanation: 'Beepity-beep',
                            },
                            {
                                id: 6,
                                ticket_id: 1,
                                user_id: null,
                                created_datetime: '2024-01-20T10:00:00Z',
                                name: TicketQAScoreDimensionName.InternalCompliance,
                                prediction: 2,
                                explanation: 'Boopity-beepity',
                            },
                            {
                                id: 7,
                                ticket_id: 1,
                                user_id: null,
                                name: TicketQAScoreDimensionName.BrandVoice,
                                prediction: 4,
                                explanation: 'Beep-boopity',
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

    it('should return empty data with Manual Dimensions', () => {
        useListTicketQaScoreDimensionsMock.mockReturnValue({
            data: {
                data: {},
            },
        })

        const {result} = renderHook(() => useAutoQA(1))

        const expectedResult = [
            {
                name: TicketQAScoreDimensionName.ResolutionCompleteness,
                value: null,
            },
            {
                name: TicketQAScoreDimensionName.Accuracy,
                value: null,
            },
            {
                name: TicketQAScoreDimensionName.InternalCompliance,
                value: null,
            },
            {
                name: TicketQAScoreDimensionName.Efficiency,
                value: null,
            },
            {
                name: TicketQAScoreDimensionName.CommunicationSkills,
                value: null,
            },
            {
                name: TicketQAScoreDimensionName.LanguageProficiency,
                value: null,
            },
            {
                name: TicketQAScoreDimensionName.BrandVoice,
                value: null,
            },
        ]

        expect(result.current.dimensions).toEqual(expectedResult)
    })

    it('should return the dimensions containing manually scored dimensions', () => {
        const {result} = renderHook(() => useAutoQA(1))

        expect(result.current.dimensions).toEqual([
            expect.objectContaining({
                name: TicketQAScoreDimensionName.ResolutionCompleteness,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.Accuracy,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.InternalCompliance,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.Efficiency,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.CommunicationSkills,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.LanguageProficiency,
            }),
            expect.objectContaining({
                name: TicketQAScoreDimensionName.BrandVoice,
            }),
        ])
    })

    it('should return an edited value if applicable', () => {
        const {result} = renderHook(() => useAutoQA(1))

        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 0, explanation: 'Beep-boop'}),
            expect.objectContaining({
                prediction: 5,
                explanation: 'Boop-boop',
            }),
            expect.objectContaining({
                prediction: 2,
                explanation: 'Boopity-beepity',
            }),
            expect.objectContaining({
                prediction: 3,
                explanation: 'Beepity-beep',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beepity-boopity',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Boopity-boop',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beep-boopity',
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
                prediction: 5,
                explanation: 'Boop-boop',
            }),
            expect.objectContaining({
                prediction: 2,
                explanation: 'Boopity-beepity',
            }),
            expect.objectContaining({
                prediction: 3,
                explanation: 'Beepity-beep',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beepity-boopity',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Boopity-boop',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beep-boopity',
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
                explanation: 'Boop-boop',
            }),
            expect.objectContaining({
                prediction: 2,
                explanation: 'Boopity-beepity',
            }),
            expect.objectContaining({
                prediction: 3,
                explanation: 'Beepity-beep',
            }),
            expect.objectContaining({
                prediction: 5,
                explanation: 'Excellent',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Boopity-boop',
            }),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beep-boopity',
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
                            name: TicketQAScoreDimensionName.CommunicationSkills,
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

    it('should save an empty string when no explanation is passed - with a delay', () => {
        jest.useFakeTimers()
        const mutateAsync = jest.fn()
        useUpsertTicketQaScoreDimensionMock.mockReturnValue({
            isLoading: false,
            mutateAsync,
        })

        const {result} = renderHook(() => useAutoQA(1))

        act(() => {
            result.current.changeHandlers[TicketQAScoreDimensionName.Accuracy](
                1,
                undefined
            )
        })
        act(() => {
            jest.advanceTimersByTime(1500)
        })

        expect(mutateAsync).toHaveBeenCalledWith(
            {
                data: {
                    dimensions: [
                        {
                            explanation: '',
                            name: TicketQAScoreDimensionName.Accuracy,
                            prediction: 1,
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
