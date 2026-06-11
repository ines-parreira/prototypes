import { history } from '@repo/routing'
import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'
import { useCreateCustomFieldCondition } from '@gorgias/helpdesk-queries'

import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import { useSaveCondition } from '../useSaveCondition'
import { useUpdateCustomFieldCondition } from '../useUpdateCustomFieldCondition'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useCreateCustomFieldCondition: jest.fn(),
    queryKeys: {
        ...jest.requireActual('@gorgias/helpdesk-queries').queryKeys,
        customFieldConditions: {
            listCustomFieldConditions: jest.fn(),
            getCustomFieldCondition: jest.fn(),
        },
    },
}))
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

const useQueryClientMock = assumeMock(useQueryClient)
const useCreateCustomFieldConditionMock = assumeMock(
    useCreateCustomFieldCondition,
)
const useUpdateCustomFieldConditionMock = assumeMock(
    useUpdateCustomFieldCondition,
)

describe('useSaveCondition', () => {
    const queryClient = {
        invalidateQueries: jest.fn(),
    }
    const createCondition = jest.fn()
    const updateCondition = jest.fn()

    beforeEach(() => {
        useQueryClientMock.mockReturnValue(
            queryClient as unknown as QueryClient,
        )
        useCreateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: createCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useCreateCustomFieldCondition>)
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should create a condition successfully', async () => {
        const { result } = renderHook(() => useSaveCondition())

        await act(async () => {
            await result.current.onSubmit({ name: 'New Condition' })
        })

        expect(createCondition).toHaveBeenCalledWith({
            data: { name: 'New Condition' },
        })
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Condition created successfully',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
        expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1)
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
        expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2)
        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should handle errors when creating a condition', async () => {
        const error = new Error('Create error')
        createCondition.mockRejectedValueOnce(error)

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

    it('should return isSubmitting as true when creating or updating', () => {
        useCreateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: createCondition,
            isLoading: true,
        } as unknown as ReturnType<typeof useCreateCustomFieldCondition>)
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)

        const { result } = renderHook(() => useSaveCondition())

        expect(result.current.isSubmitting).toBe(true)

        useCreateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: createCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useCreateCustomFieldCondition>)
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
