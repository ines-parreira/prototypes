import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListCustomerCustomFieldsValuesHandler,
    mockUpdateCustomerCustomFieldValueHandler,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateOrDeleteCustomCustomerFieldValue } from '../useUpdateOrDeleteCustomCustomerFieldValue'

const server = setupServer(
    mockListCustomerCustomFieldsValuesHandler().handler,
    mockUpdateCustomerCustomFieldValueHandler().handler,
)

describe('useUpdateOrDeleteCustomCustomerFieldValue', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should show error toast when update fails', async () => {
        server.use(
            mockUpdateCustomerCustomFieldValueHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useUpdateOrDeleteCustomCustomerFieldValue(123),
        )

        await result.current.updateOrDeleteCustomerFieldValue({
            fieldId: 1,
            value: 'some value',
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update customer field',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
