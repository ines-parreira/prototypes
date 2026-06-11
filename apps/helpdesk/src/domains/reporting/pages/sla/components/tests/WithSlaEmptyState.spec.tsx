import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { delay, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListSlaPoliciesHandler } from '@gorgias/helpdesk-mocks'

import { WithSlaEmptyState } from 'domains/reporting/pages/sla/components/WithSlaEmptyState'
import { CONTENT_HEADER_TEXT } from 'domains/reporting/pages/sla/ServiceLevelAgreementsEmptyState'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('WithSlaEmptyState', () => {
    it('should render loading skeleton when policies loading', () => {
        const mockListSlaPolicies = mockListSlaPoliciesHandler(async () => {
            await delay('infinite')
            return HttpResponse.json(mockListSlaPolicies.data)
        })
        server.use(mockListSlaPolicies.handler)

        render(<WithSlaEmptyState>something</WithSlaEmptyState>)

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should render Empty state when no policies', async () => {
        const mockListSlaPolicies = mockListSlaPoliciesHandler(async () =>
            HttpResponse.json({
                data: [],
                meta: { next_cursor: null, prev_cursor: null },
                object: null,
                uri: '',
            }),
        )
        server.use(mockListSlaPolicies.handler)

        render(<WithSlaEmptyState>something</WithSlaEmptyState>)

        expect(await screen.findByText(CONTENT_HEADER_TEXT)).toBeInTheDocument()
    })

    it('should render children', async () => {
        const mockListSlaPolicies = mockListSlaPoliciesHandler()
        server.use(mockListSlaPolicies.handler)
        const child = 'something'

        render(<WithSlaEmptyState>{child}</WithSlaEmptyState>)

        expect(await screen.findByText(child)).toBeInTheDocument()
    })

    it('should pass targetChannel to useListSlaPolicies', async () => {
        const mockListSlaPolicies = mockListSlaPoliciesHandler()
        const waitForListSlaPoliciesRequest =
            mockListSlaPolicies.waitForRequest(server)
        server.use(mockListSlaPolicies.handler)

        render(
            <WithSlaEmptyState targetChannel="phone">
                something
            </WithSlaEmptyState>,
        )

        await waitForListSlaPoliciesRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('target_channel')).toBe('phone')
        })
    })

    it('should call useListSlaPolicies without targetChannel when not provided', async () => {
        const mockListSlaPolicies = mockListSlaPoliciesHandler()
        const waitForListSlaPoliciesRequest =
            mockListSlaPolicies.waitForRequest(server)
        server.use(mockListSlaPolicies.handler)

        render(<WithSlaEmptyState>something</WithSlaEmptyState>)

        await waitForListSlaPoliciesRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.has('target_channel')).toBe(false)
        })
    })
})
