import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import {
    mockCreateSlaPolicyHandler,
    mockCreateSlaPolicyResponse,
    mockUpdateSlaPolicyHandler,
    mockUpdateSlaPolicyResponse,
} from '@gorgias/helpdesk-mocks'

import type { SLAFormValues } from '../useFormValues'
import { useSubmitPolicy } from '../useSubmitPolicy'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = assumeMock(useParams)
const createSlaRequests: Request[] = []
const updateSlaRequests: Request[] = []
const server = setupServer()

function renderUseSubmitPolicy() {
    return renderHook(useSubmitPolicy)
}

describe('useSubmitPolicy()', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        createSlaRequests.length = 0
        updateSlaRequests.length = 0
        server.use(
            mockCreateSlaPolicyHandler(async ({ request }) => {
                createSlaRequests.push(request)

                return HttpResponse.json(mockCreateSlaPolicyResponse())
            }).handler,
            mockUpdateSlaPolicyHandler(async ({ request }) => {
                updateSlaRequests.push(request)

                return HttpResponse.json(mockUpdateSlaPolicyResponse())
            }).handler,
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
        server.resetHandlers()
        toast.dismiss()
    })

    afterAll(() => {
        server.close()
    })

    it('should call create on save if the policy is new', async () => {
        useParamsMock.mockReturnValue({ policyId: 'new' })
        const { result } = renderUseSubmitPolicy()

        const data = {
            name: 'test',
            metrics: undefined,
            target_channels: [],
            conditions: [],
        } as unknown as SLAFormValues

        await result.current.save(data)

        await waitFor(() => {
            expect(createSlaRequests).toHaveLength(1)
        })
        await expect(createSlaRequests[0].json()).resolves.toEqual({
            name: 'test',
            metrics: undefined,
            target_channels: [],
        })
    })

    it('should call update on save if the policy exists', async () => {
        useParamsMock.mockReturnValue({ policyId: '1' })
        const { result } = renderUseSubmitPolicy()

        const data = {
            name: 'test',
            metrics: undefined,
            target_channels: [],
            conditions: [],
        } as unknown as SLAFormValues

        await result.current.save(data)

        await waitFor(() => {
            expect(updateSlaRequests).toHaveLength(1)
        })
        await expect(updateSlaRequests[0].json()).resolves.toEqual({
            name: 'test',
            metrics: undefined,
            target_channels: [],
        })
    })

    it('should show a success toast after creating a policy', async () => {
        useParamsMock.mockReturnValue({ policyId: 'new' })
        const { result } = renderUseSubmitPolicy()

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
        server.use(
            mockCreateSlaPolicyHandler(async () =>
                HttpResponse.json(mockCreateSlaPolicyResponse(), {
                    status: 500,
                }),
            ).handler,
        )
        const { result } = renderUseSubmitPolicy()

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
