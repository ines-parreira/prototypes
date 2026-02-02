import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListSlaPoliciesHandler } from '@gorgias/helpdesk-mocks'
import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { VoiceSlaTargetInfoBanner } from 'domains/reporting/pages/sla/voice/VoiceSlaTargetInfoBanner'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

const server = setupServer()

const mockListSlaPolicies = mockListSlaPoliciesHandler()

const localHandlers = [mockListSlaPolicies.handler]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('VoiceSlaTargetInfoBanner', () => {
    it('should render skeleton when loading', () => {
        renderWithStoreAndQueryClientProvider(<VoiceSlaTargetInfoBanner />)

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should render banner with policy information', async () => {
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json({
                    data: [
                        {
                            id: 1,
                            target: 0.9,
                            target_channel: 'phone',
                            metrics: [
                                {
                                    name: SLAPolicyMetricType.WaitTime,
                                    threshold: 1,
                                    unit: SLAPolicyMetricUnit.Minute,
                                },
                            ],
                        },
                    ],
                    meta: { next_cursor: null },
                } as any),
            ).handler,
        )

        renderWithStoreAndQueryClientProvider(<VoiceSlaTargetInfoBanner />)

        expect(
            await screen.findByText(
                'Your current Voice SLA policy is 90% within 1 minutes.',
            ),
        ).toBeInTheDocument()
    })

    it('should not render when there are no policies', async () => {
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null },
                } as any),
            ).handler,
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <VoiceSlaTargetInfoBanner />,
        )

        await waitFor(() => {
            expect(
                document.querySelector('.react-loading-skeleton'),
            ).not.toBeInTheDocument()
        })

        expect(container.firstChild).toBeNull()
    })

    it('should not render when policy has no target', async () => {
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json({
                    data: [
                        {
                            id: 1,
                            target: null,
                            target_channel: 'phone',
                            metrics: [
                                {
                                    name: SLAPolicyMetricType.WaitTime,
                                    threshold: 1,
                                    unit: SLAPolicyMetricUnit.Minute,
                                },
                            ],
                        },
                    ],
                    meta: { next_cursor: null },
                } as any),
            ).handler,
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <VoiceSlaTargetInfoBanner />,
        )

        await waitFor(() => {
            expect(
                document.querySelector('.react-loading-skeleton'),
            ).not.toBeInTheDocument()
        })

        expect(container.firstChild).toBeNull()
    })

    it('should not render when policy has no metrics', async () => {
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json({
                    data: [
                        {
                            id: 1,
                            target: 0.9,
                            target_channel: 'phone',
                            metrics: [],
                        },
                    ],
                    meta: { next_cursor: null },
                } as any),
            ).handler,
        )

        const { container } = renderWithStoreAndQueryClientProvider(
            <VoiceSlaTargetInfoBanner />,
        )

        await waitFor(() => {
            expect(
                document.querySelector('.react-loading-skeleton'),
            ).not.toBeInTheDocument()
        })

        expect(container.firstChild).toBeNull()
    })
})
