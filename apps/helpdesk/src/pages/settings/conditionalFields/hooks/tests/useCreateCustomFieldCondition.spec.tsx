import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useCreateCustomFieldCondition as useCreate,
} from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useCreateCustomFieldCondition } from '../useCreateCustomFieldCondition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useCreateCustomFieldConditionMock = assumeMock(useCreate)

describe('useCreateCustomFieldCondition', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should show success toast on success and invalidate proper query data', async () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useCreateCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        act(() => {
            useCreateCustomFieldConditionMock.mock.calls[0][0]?.mutation!
                .onSuccess!(
                axiosSuccessResponse(customFieldCondition) as any,
                { data: customFieldCondition },
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
                    name: 'Condition created successfully',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show failure toast on error', async () => {
        renderHook(() => useCreateCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        act(() => {
            useCreateCustomFieldConditionMock.mock.calls[0][0]?.mutation!
                .onError!({}, { data: customFieldCondition }, undefined)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to create condition',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
