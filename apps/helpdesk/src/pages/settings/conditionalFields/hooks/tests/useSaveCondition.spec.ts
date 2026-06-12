import { history } from '@repo/routing'
import { assumeMock, renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { toast } from '@gorgias/axiom'
import { mockCreateCustomFieldConditionHandler } from '@gorgias/helpdesk-mocks'

import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import { useSaveCondition } from '../useSaveCondition'
import { useUpdateCustomFieldCondition } from '../useUpdateCustomFieldCondition'

jest.mock('../useUpdateCustomFieldCondition')
jest.mock('pages/settings/SLAs/utils/handleApiError', () => ({
    ...jest.requireActual('pages/settings/SLAs/utils/handleApiError'),
}))
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

const useUpdateCustomFieldConditionMock = assumeMock(
    useUpdateCustomFieldCondition,
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useSaveCondition', () => {
    const updateCondition = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        server.use(mockCreateCustomFieldConditionHandler().handler)
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should create a condition successfully', async () => {
        const createConditionMock = mockCreateCustomFieldConditionHandler()
        server.use(createConditionMock.handler)
        const waitForCreateConditionRequest =
            createConditionMock.waitForRequest(server)

        const { result } = renderHook(() => useSaveCondition())

        await act(async () => {
            await result.current.onSubmit({ name: 'New Condition' })
        })

        await waitForCreateConditionRequest(async (request) => {
            expect(await request.json()).toEqual({
                name: 'New Condition',
            })
        })
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Condition created successfully',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should update a condition successfully', async () => {
        const { result } = renderHook(() => useSaveCondition(1))

        await act(async () => {
            await result.current.onSubmit({ name: 'Updated Condition' })
        })

        expect(updateCondition).toHaveBeenCalledWith({
            id: 1,
            data: { name: 'Updated Condition' },
        })
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Condition updated successfully',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should handle errors when creating a condition', async () => {
        server.use(
            mockCreateCustomFieldConditionHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'Failed to create condition.' } } as any,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSaveCondition())

        await act(async () => {
            await result.current.onSubmit({ name: 'New Condition' })
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to create condition.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle errors when updating a condition', async () => {
        const error = new Error('Update error')
        updateCondition.mockRejectedValueOnce(error)

        const { result } = renderHook(() => useSaveCondition(1))

        await act(async () => {
            await result.current.onSubmit({ name: 'Updated Condition' })
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update condition.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should return isSubmitting as true when creating or updating', async () => {
        server.use(
            mockCreateCustomFieldConditionHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)

        const { result } = renderHook(() => useSaveCondition())

        act(() => {
            void result.current.onSubmit({ name: 'New Condition' })
        })

        await waitFor(() => {
            expect(result.current.isSubmitting).toBe(true)
        })

        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: true,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)

        const { result: result2 } = renderHook(() => useSaveCondition())

        expect(result2.current.isSubmitting).toBe(true)
    })

    it('should return isSubmitting as false when neither creating nor updating', () => {
        const { result } = renderHook(() => useSaveCondition())

        expect(result.current.isSubmitting).toBe(false)
    })
})
