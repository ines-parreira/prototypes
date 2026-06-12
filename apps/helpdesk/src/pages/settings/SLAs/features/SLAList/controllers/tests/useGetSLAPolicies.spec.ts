import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListSlaPoliciesHandler,
    mockListSlaPoliciesResponse,
} from '@gorgias/helpdesk-mocks'

import { slaPolicy1, UISLAPolicy1 } from 'pages/settings/SLAs/fixtures/fixtures'

import { useGetSLAPolicies } from '../useGetSLAPolicies'

const server = setupServer()

function renderUseGetSLAPolicies() {
    return renderHook(() => useGetSLAPolicies())
}

describe('useGetSLAPolicies', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json(
                    mockListSlaPoliciesResponse({
                        data: [slaPolicy1],
                    }),
                ),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should transform api query data', async () => {
        const { result } = renderUseGetSLAPolicies()

        await waitFor(() => {
            expect(result.current.data).toEqual([UISLAPolicy1])
        })
    })

    it('should use created_datetime if updated_datetime is not available', async () => {
        const policyWithoutUpdatedDatetime = {
            ...slaPolicy1,
            updated_datetime: null,
        }
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json(
                    mockListSlaPoliciesResponse({
                        data: [policyWithoutUpdatedDatetime],
                    }),
                ),
            ).handler,
        )

        const UISLAPolicy1WithoutUpdatedDatetime = {
            ...UISLAPolicy1,
            updatedDatetime: slaPolicy1.created_datetime,
        }

        const { result } = renderUseGetSLAPolicies()

        await waitFor(() => {
            expect(result.current.data).toEqual([
                UISLAPolicy1WithoutUpdatedDatetime,
            ])
        })
    })
})
