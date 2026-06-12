import type { ReactNode } from 'react'

import { createElement } from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListTicketQaScoreDimensionsHandler,
    mockListTicketQaScoreDimensionsResponse,
    mockTicketQAScoreDimension,
    mockUpsertTicketQaScoreDimensionHandler,
    mockUpsertTicketQaScoreDimensionResponse,
} from '@gorgias/helpdesk-mocks'
import { TicketQAScoreDimensionName } from '@gorgias/helpdesk-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAutoQA } from '../useAutoQA'

const server = setupServer()
let queryClient = mockQueryClient()

const dimensions = [
    mockTicketQAScoreDimension({
        id: 1,
        ticket_id: 1,
        user_id: 801087805,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-09-16T08:00:00Z',
        name: TicketQAScoreDimensionName.ResolutionCompleteness,
        prediction: 0,
        explanation: 'Beep-boop',
    }),
    mockTicketQAScoreDimension({
        id: 2,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-01-21T10:00:00Z',
        name: TicketQAScoreDimensionName.CommunicationSkills,
        prediction: 4,
        explanation: 'Beepity-boopity',
    }),
    mockTicketQAScoreDimension({
        id: 3,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-01-21T10:00:00Z',
        name: TicketQAScoreDimensionName.LanguageProficiency,
        prediction: 4,
        explanation: 'Boopity-boop',
    }),
    mockTicketQAScoreDimension({
        id: 4,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-01-21T10:00:00Z',
        name: TicketQAScoreDimensionName.Accuracy,
        prediction: 5,
        explanation: 'Boop-boop',
    }),
    mockTicketQAScoreDimension({
        id: 5,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-01-21T10:00:00Z',
        name: TicketQAScoreDimensionName.Efficiency,
        prediction: 3,
        explanation: 'Beepity-beep',
    }),
    mockTicketQAScoreDimension({
        id: 6,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        name: TicketQAScoreDimensionName.InternalCompliance,
        prediction: 2,
        explanation: 'Boopity-beepity',
    }),
    mockTicketQAScoreDimension({
        id: 7,
        ticket_id: 1,
        user_id: null,
        name: TicketQAScoreDimensionName.BrandVoice,
        prediction: 4,
        explanation: 'Beep-boopity',
    }),
]

const createWrapper = () => {
    queryClient = mockQueryClient()

    return ({ children }: { children?: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)
}

const useDimensionsHandler = (
    response = mockListTicketQaScoreDimensionsResponse({
        data: { dimensions },
    }),
    requests: Request[] = [],
) => {
    server.use(
        mockListTicketQaScoreDimensionsHandler(async ({ request }) => {
            requests.push(request)

            return HttpResponse.json(response)
        }).handler,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    jest.useRealTimers()
    useDimensionsHandler()
    server.use(mockUpsertTicketQaScoreDimensionHandler().handler)
})

afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useAutoQA', () => {
    it('should return empty data with Manual Dimensions', async () => {
        useDimensionsHandler(
            {} as ReturnType<typeof mockListTicketQaScoreDimensionsResponse>,
        )

        const { result } = renderHook(() => useAutoQA(1), {
            wrapper: createWrapper(),
        })

        await waitFor(() =>
            expect(result.current.dimensions).toEqual([
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
            ]),
        )
    })

    it('should return the dimensions containing manually scored dimensions', async () => {
        const { result } = renderHook(() => useAutoQA(1), {
            wrapper: createWrapper(),
        })

        await waitFor(() =>
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
            ]),
        )
    })

    it('should return an edited value if applicable', async () => {
        const { result } = renderHook(() => useAutoQA(1), {
            wrapper: createWrapper(),
        })

        await waitFor(() =>
            expect(result.current.dimensions).toEqual([
                expect.objectContaining({
                    prediction: 0,
                    explanation: 'Beep-boop',
                }),
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
            ]),
        )

        act(() => {
            result.current.changeHandlers[
                TicketQAScoreDimensionName.ResolutionCompleteness
            ](1, 'Yup')
        })
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({ prediction: 1, explanation: 'Yup' }),
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
            expect.objectContaining({ prediction: 1, explanation: 'Yup' }),
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

    it('should save changed values with a delay', async () => {
        jest.useFakeTimers()
        const listRequests: Request[] = []
        useDimensionsHandler(
            mockListTicketQaScoreDimensionsResponse({
                data: { dimensions },
            }),
            listRequests,
        )
        const upsertMock = mockUpsertTicketQaScoreDimensionHandler(async () =>
            HttpResponse.json(mockUpsertTicketQaScoreDimensionResponse()),
        )
        const waitForUpsertRequest = upsertMock.waitForRequest(server)
        server.use(upsertMock.handler)

        const { result } = renderHook(() => useAutoQA(1), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            result.current.changeHandlers[
                TicketQAScoreDimensionName.CommunicationSkills
            ](5, 'Excellent')
        })
        act(() => {
            jest.advanceTimersByTime(1500)
        })

        await waitForUpsertRequest(async (request) => {
            expect(await request.json()).toEqual({
                dimensions: [
                    {
                        explanation: 'Excellent',
                        name: TicketQAScoreDimensionName.CommunicationSkills,
                        prediction: 5,
                    },
                ],
            })
        })
        await waitFor(() => expect(listRequests.length).toBeGreaterThan(1))
    })

    it('should save an empty string when no explanation is passed with a delay', async () => {
        jest.useFakeTimers()
        const upsertMock = mockUpsertTicketQaScoreDimensionHandler(async () =>
            HttpResponse.json(mockUpsertTicketQaScoreDimensionResponse()),
        )
        const waitForUpsertRequest = upsertMock.waitForRequest(server)
        server.use(upsertMock.handler)

        const { result } = renderHook(() => useAutoQA(1), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            result.current.changeHandlers[TicketQAScoreDimensionName.Accuracy](
                1,
                undefined,
            )
        })
        act(() => {
            jest.advanceTimersByTime(1500)
        })

        await waitForUpsertRequest(async (request) => {
            expect(await request.json()).toEqual({
                dimensions: [
                    {
                        explanation: '',
                        name: TicketQAScoreDimensionName.Accuracy,
                        prediction: 1,
                    },
                ],
            })
        })
    })
})
