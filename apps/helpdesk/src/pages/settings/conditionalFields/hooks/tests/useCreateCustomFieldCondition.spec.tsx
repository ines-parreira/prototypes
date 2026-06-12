import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import {
    mockCreateCustomFieldConditionHandler,
    mockCreateCustomFieldConditionResponse,
} from '@gorgias/helpdesk-mocks'

import { customFieldCondition } from 'fixtures/customFieldCondition'

import { useCreateCustomFieldCondition } from '../useCreateCustomFieldCondition'

const server = setupServer()

function renderUseCreateCustomFieldCondition() {
    return renderHook(() => useCreateCustomFieldCondition())
}

describe('useCreateCustomFieldCondition', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.resetAllMocks()
        server.use(
            mockCreateCustomFieldConditionHandler(async () =>
                HttpResponse.json(
                    mockCreateCustomFieldConditionResponse(
                        customFieldCondition,
                    ),
                ),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
        toast.dismiss()
    })

    afterAll(() => {
        server.close()
    })

    it('should show success toast on success', async () => {
        const { result } = renderUseCreateCustomFieldCondition()

        await act(async () => {
            await result.current.mutateAsync({
                data: customFieldCondition,
            } as never)
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
        server.use(
            mockCreateCustomFieldConditionHandler(async () =>
                HttpResponse.json(mockCreateCustomFieldConditionResponse(), {
                    status: 500,
                }),
            ).handler,
        )
        const { result } = renderUseCreateCustomFieldCondition()

        await act(async () => {
            await result.current
                .mutateAsync({ data: customFieldCondition } as never)
                .catch(() => undefined)
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
