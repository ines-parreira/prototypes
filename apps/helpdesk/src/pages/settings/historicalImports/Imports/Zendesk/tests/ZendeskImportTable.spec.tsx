import type React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListIntegrationsHandler } from '@gorgias/helpdesk-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { ZendeskImportTable } from '../ZendeskImportTable'
import { mockZendeskIntegrations } from './fixture'

const mockListIntegrations = mockListIntegrationsHandler(async () =>
    HttpResponse.json({
        data: mockZendeskIntegrations,
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/integrations',
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListIntegrations.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('ZendeskImportTable', () => {
    const renderComponent = () => {
        const queryClient = mockQueryClient()
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        return render(<ZendeskImportTable />, { wrapper })
    }

    describe('Empty State', () => {
        it('renders empty state when no integrations exist', async () => {
            const emptyHandler = mockListIntegrationsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                    },
                    object: 'list',
                    uri: '/api/integrations',
                }),
            )

            server.use(emptyHandler.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('No Zendesk data imported'),
                ).toBeInTheDocument()
            })
            expect(
                screen.getByText(
                    /Connect to Zendesk to migrate up to 2 years of data/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /import zendesk/i }),
            ).toBeInTheDocument()
        })

        it('renders empty state when API returns error', async () => {
            const errorHandler = mockListIntegrationsHandler(async () =>
                HttpResponse.json(
                    {
                        error: { msg: 'Failed to fetch integrations' },
                    } as any,
                    { status: 500 },
                ),
            )

            server.use(errorHandler.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('No Zendesk data imported'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Table with data', () => {
        it('renders table with integrations', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument()
            })
        })

        it('renders column headers', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('columnheader', { name: /account/i }),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByRole('columnheader', { name: /status/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /tickets/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /macros/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /customers/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /users/i }),
            ).toBeInTheDocument()
        })

        it('renders integration data', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Zendesk Support Account 1'),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByText('Zendesk Support Account 2'),
            ).toBeInTheDocument()
            expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
            expect(screen.getByText('5432')).toBeInTheDocument()
        })

        it('renders Zendesk logos', async () => {
            renderComponent()

            await waitFor(() => {
                const logos = screen.getAllByAltText('Zendesk logo')
                expect(logos.length).toBeGreaterThan(0)
            })
        })

        it('renders sync status badges', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getAllByText('Synchronizing').length,
                ).toBeGreaterThan(0)
            })

            expect(screen.getAllByText('Paused').length).toBeGreaterThan(0)
        })

        it('fetches integrations with type parameter', async () => {
            const waitForListIntegrationsRequest =
                mockListIntegrations.waitForRequest(server)

            renderComponent()

            await waitForListIntegrationsRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.searchParams.get('type')).toBe('zendesk')
            })
        })
    })
})
