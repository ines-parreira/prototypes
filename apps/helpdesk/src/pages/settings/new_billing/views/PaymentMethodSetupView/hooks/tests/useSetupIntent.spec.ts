import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockCreateBillingPaymentMethodSetupHandler,
    mockCreateBillingPaymentMethodSetupResponse,
} from '@gorgias/helpdesk-mocks'

import { useSetupIntent } from '../useSetupIntent'

const createBillingPaymentMethodSetupMock =
    mockCreateBillingPaymentMethodSetupHandler(async () =>
        HttpResponse.json(
            mockCreateBillingPaymentMethodSetupResponse({
                client_secret: 'test_client_secret',
            }),
        ),
    )

const server = setupServer(createBillingPaymentMethodSetupMock.handler)

describe('useSetupIntent hook', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should call startSetupIntent on mount', async () => {
        const waitForSetupIntentRequest =
            createBillingPaymentMethodSetupMock.waitForRequest(server)

        renderHook(useSetupIntent)

        await waitForSetupIntentRequest()
    })

    it('should return the client secret from setupIntent', async () => {
        const { result } = renderHook(useSetupIntent)

        await waitFor(() => {
            expect(result.current.clientSecret).toBe('test_client_secret')
        })
    })

    it('should return status properties', async () => {
        const { result } = renderHook(useSetupIntent)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.isError).toBe(false)
    })
})
