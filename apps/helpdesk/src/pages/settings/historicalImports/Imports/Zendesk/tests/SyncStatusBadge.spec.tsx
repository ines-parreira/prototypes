import type React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockUpdateIntegrationHandler } from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { SyncStatusBadge } from '../SyncStatusBadge'
import { ImportStatus } from '../types'
import { createMockIntegration } from './fixture'

const server = setupServer()
let queryClient = mockQueryClient()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    queryClient = mockQueryClient()
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

const renderComponent = (integrationItem: Integration) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    return render(<SyncStatusBadge integrationItem={integrationItem} />, {
        wrapper,
    })
}

describe('SyncStatusBadge', () => {
    describe('Initial rendering', () => {
        it('displays "Synchronizing" when continuous import is enabled', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
            })

            renderComponent(integration)

            expect(screen.getByText('Synchronizing')).toBeInTheDocument()
        })

        it('displays "Paused" when continuous import is disabled', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
            })

            renderComponent(integration)

            expect(screen.getByText('Paused')).toBeInTheDocument()
        })

        it('displays pause icon when paused', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
            })

            renderComponent(integration)

            expect(
                screen.getByLabelText('media-pause-circle'),
            ).toBeInTheDocument()
        })
    })

    describe('Toggling sync status', () => {
        it('sends request to pause when clicking synchronizing badge', async () => {
            const user = userEvent.setup()
            const integration = createMockIntegration({
                id: 123,
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
            })

            let requestBody: any = null
            const mockUpdateIntegration = mockUpdateIntegrationHandler(
                async ({ request }) => {
                    requestBody = await request.json()
                    return HttpResponse.json({
                        ...integration,
                        meta: {
                            ...integration.meta,
                            continuous_import_enabled: false,
                        },
                    } as Integration)
                },
            )
            server.use(mockUpdateIntegration.handler)

            renderComponent(integration)

            const badge = screen
                .getByText('Synchronizing')
                .closest('[data-name="badge"]')

            await act(() => user.click(badge!))

            await waitFor(() => {
                expect(requestBody).toEqual({
                    id: 123,
                    meta: {
                        continuous_import_enabled: false,
                    },
                })
            })
        })

        it('sends request to resume when clicking paused badge', async () => {
            const user = userEvent.setup()
            const integration = createMockIntegration({
                id: 456,
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
            })

            let requestBody: any = null
            const mockUpdateIntegration = mockUpdateIntegrationHandler(
                async ({ request }) => {
                    requestBody = await request.json()
                    return HttpResponse.json({
                        ...integration,
                        meta: {
                            ...integration.meta,
                            continuous_import_enabled: true,
                        },
                    } as Integration)
                },
            )
            server.use(mockUpdateIntegration.handler)

            renderComponent(integration)

            const badge = screen
                .getByText('Paused')
                .closest('[data-name="badge"]')

            await act(() => user.click(badge!))

            await waitFor(() => {
                expect(requestBody).toEqual({
                    id: 456,
                    meta: {
                        continuous_import_enabled: true,
                    },
                })
            })
        })
    })

    describe('Loading state during update', () => {
        it('shows loading indicator while pausing', async () => {
            const user = userEvent.setup()
            const integration = createMockIntegration({
                id: 789,
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
            })

            const mockUpdateIntegration = mockUpdateIntegrationHandler(
                async () => {
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    return HttpResponse.json({
                        ...integration,
                        meta: {
                            ...integration.meta,
                            continuous_import_enabled: false,
                        },
                    } as Integration)
                },
            )
            server.use(mockUpdateIntegration.handler)

            renderComponent(integration)

            const badge = screen
                .getByText('Synchronizing')
                .closest('[data-name="badge"]')
            await act(() => user.click(badge!))

            await waitFor(() => {
                const spinners = screen.getAllByRole('status')
                expect(spinners.length).toBeGreaterThan(0)
            })
        })

        it('shows loading indicator while resuming', async () => {
            const user = userEvent.setup()
            const integration = createMockIntegration({
                id: 789,
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
            })

            const mockUpdateIntegration = mockUpdateIntegrationHandler(
                async () => {
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    return HttpResponse.json({
                        ...integration,
                        meta: {
                            ...integration.meta,
                            continuous_import_enabled: true,
                        },
                    } as Integration)
                },
            )
            server.use(mockUpdateIntegration.handler)

            renderComponent(integration)

            const badge = screen
                .getByText('Paused')
                .closest('[data-name="badge"]')
            await act(() => user.click(badge!))

            await waitFor(() => {
                expect(screen.getByRole('status')).toBeInTheDocument()
            })
        })
    })

    describe('Error handling', () => {
        it('maintains current state when request fails', async () => {
            const user = userEvent.setup()
            const integration = createMockIntegration({
                id: 333,
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
            })

            const mockUpdateIntegration = mockUpdateIntegrationHandler(
                async () => {
                    return HttpResponse.json(
                        { error: { msg: 'Server error' } } as any,
                        { status: 500 },
                    )
                },
            )
            server.use(mockUpdateIntegration.handler)

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            renderComponent(integration)

            const badge = screen
                .getByText('Synchronizing')
                .closest('[data-name="badge"]')
            await act(() => user.click(badge!))

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled()
            })

            expect(screen.getByText('Synchronizing')).toBeInTheDocument()

            consoleErrorSpy.mockRestore()
        })
    })
})
