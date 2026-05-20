import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useDeleteCustomFieldCondition as useDelete,
} from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useDeleteCustomFieldCondition from '../useDeleteCustomFieldCondition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useDeleteCustomFieldConditionMock = assumeMock(useDelete)

describe('useDeleteCustomFieldCondition', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should show success toast on success and invalidate proper query data', async () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useDeleteCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        act(() => {
            useDeleteCustomFieldConditionMock.mock.calls[0][0]?.mutation!
                .onSuccess!(
                axiosSuccessResponse(customFieldCondition) as any,
                { id: customFieldCondition.id },
                undefined,
            )
        })

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey:
                queryKeys.customFieldConditions.listCustomFieldConditions(),
        })
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Successfully deleted condition',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show failure toast on error', async () => {
        renderHook(() => useDeleteCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        act(() => {
            useDeleteCustomFieldConditionMock.mock.calls[0][0]?.mutation!
                .onError!({}, { id: customFieldCondition.id }, undefined)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete condition',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
