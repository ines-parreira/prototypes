import type { PropsWithChildren } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useCreateSlaPolicy,
    useUpdateSlaPolicy,
} from '@gorgias/helpdesk-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import type { SLAFormValues } from '../useFormValues'
import { useSubmitPolicy } from '../useSubmitPolicy'

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
const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useSubmitPolicy()', () => {
    afterEach(() => {
        jest.clearAllMocks()
        toast.dismiss()
    })

    it('should call create on save if the policy is new', async () => {
        useParamsMock.mockReturnValue({ policyId: 'new' })
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(useSubmitPolicy, { wrapper })
        const data = {
            name: 'test',
            metrics: undefined,
            target_channels: [],
            conditions: [],
        } as unknown as SLAFormValues

        await result.current.save(data)

        expect(createMock).toHaveBeenCalledWith({
            data: {
                name: 'test',
                metrics: undefined,
                target_channels: [],
            },
        })

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
            conditions: [],
        } as unknown as SLAFormValues

        await result.current.save(data)

        expect(updateMock).toHaveBeenCalledWith({
            id: '1',
            data: {
                name: 'test',
                metrics: undefined,
                target_channels: [],
            },
        })

        await waitFor(() => {
            expect(invalidateQueryMock).toHaveBeenCalledWith({
                queryKey: queryKeys.slaPolicies.listSlaPolicies(),
            })
            expect(invalidateQueryMock).toHaveBeenCalledWith({
                queryKey: queryKeys.slaPolicies.getSlaPolicy('1'),
            })
        })
    })

    it('should show a success toast after creating a policy', async () => {
        useParamsMock.mockReturnValue({ policyId: 'new' })
        const { result } = renderHook(useSubmitPolicy, { wrapper })

        await result.current.save({
            name: 'test',
            metrics: undefined,
            target_channels: [],
            conditions: [],
        } as unknown as SLAFormValues)

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'SLA policy created' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show an error toast when the request fails', async () => {
        useParamsMock.mockReturnValue({ policyId: 'new' })
        createMock.mockRejectedValueOnce({
            response: { data: { error: { msg: 'boom' } } },
        })
        const { result } = renderHook(useSubmitPolicy, { wrapper })

        await result.current.save({
            name: 'test',
            metrics: undefined,
            target_channels: [],
            conditions: [],
        } as unknown as SLAFormValues)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to create SLA policy.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
