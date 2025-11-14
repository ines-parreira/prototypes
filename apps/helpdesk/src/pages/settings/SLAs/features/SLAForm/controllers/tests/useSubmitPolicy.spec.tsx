import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
    queryKeys,
    useCreateSlaPolicy,
    useUpdateSlaPolicy,
} from '@gorgias/helpdesk-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { SLAFormValues } from '../useFormValues'
import useSubmitPolicy from '../useSubmitPolicy'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useCreateSlaPolicy: jest.fn(),
    useUpdateSlaPolicy: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = assumeMock(useParams)
const createMock = jest.fn()
const updateMock = jest.fn()

assumeMock(useCreateSlaPolicy).mockReturnValue({
    mutateAsync: createMock,
} as any)

assumeMock(useUpdateSlaPolicy).mockReturnValue({
    mutateAsync: updateMock,
} as any)

const queryClient = mockQueryClient()

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <Provider store={mockStore({} as any)}>{children}</Provider>
    </QueryClientProvider>
)

describe('useSubmitPolicy()', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should call create on save if the policy is new', async () => {
        useParamsMock.mockReturnValue({ policyId: 'new' })
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(useSubmitPolicy, { wrapper })
        const data = {
            name: 'test',
            metrics: undefined,
            target_channels: [],
        } as unknown as SLAFormValues

        result.current.save(data)

        expect(createMock).toHaveBeenCalledWith({ data })

        await waitFor(() => {
            expect(invalidateQueryMock).toHaveBeenCalledWith({
                queryKey: queryKeys.slaPolicies.listSlaPolicies(),
            })
        })
    })

    it('should call update on save if the policy exists', async () => {
        useParamsMock.mockReturnValue({ policyId: '1' })
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(useSubmitPolicy, { wrapper })
        const data = {
            name: 'test',
            metrics: undefined,
            target_channels: [],
        } as unknown as SLAFormValues

        result.current.save(data)

        expect(updateMock).toHaveBeenCalledWith({ id: '1', data })

        await waitFor(() => {
            expect(invalidateQueryMock).toHaveBeenCalledWith({
                queryKey: queryKeys.slaPolicies.listSlaPolicies(),
            })
            expect(invalidateQueryMock).toHaveBeenCalledWith({
                queryKey: queryKeys.slaPolicies.getSlaPolicy('1'),
            })
        })
    })
})
