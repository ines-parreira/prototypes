import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBusinessHoursConfig,
    mockIntegrationWithBusinessHoursAndStore,
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
    mockListIntegrationsForBusinessHoursHandler,
    mockListIntegrationsForBusinessHoursResponse,
} from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithStore } from 'utils/testing'

import CustomBusinessHoursIntegrationsTable from '../CustomBusinessHoursIntegrationsTable'

const queryClient = mockQueryClient()
const server = setupServer()

const integrations = [
    mockIntegrationWithBusinessHoursAndStore(),
    mockIntegrationWithBusinessHoursAndStore(),
    mockIntegrationWithBusinessHoursAndStore(),
]

const mockListResponse = mockListIntegrationsForBusinessHoursResponse({
    data: integrations,
    meta: {
        next_cursor: '123',
        prev_cursor: '122',
        total_resources: 3,
    },
})

const mockHandler = mockListIntegrationsForBusinessHoursHandler(async () =>
    HttpResponse.json(mockListResponse),
)

const accountSettingsResponse = mockListAccountSettingsResponse({
    data: [
        {
            type: 'business_hours',
            ...mockBusinessHoursConfig(),
        },
    ],
})
const mockAccountSettingsHandler = mockListAccountSettingsHandler(async () =>
    HttpResponse.json(accountSettingsResponse),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockAccountSettingsHandler.handler)
    server.use(mockHandler.handler)
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    renderWithStore(
        <QueryClientProvider client={queryClient}>
            <Form
                onValidSubmit={jest.fn()}
                defaultValues={{
                    assigned_integrations: {
                        assign_integrations: [integrations[0].integration_id],
                    },
                }}
            >
                <CustomBusinessHoursIntegrationsTable />
            </Form>
        </QueryClientProvider>,
        {},
    )

describe('CustomBusinessHoursIntegrationsTable', () => {
    it('renders the section header with correct title', () => {
        renderComponent()

        expect(screen.getByText('Integrations')).toBeInTheDocument()
    })

    it('renders the section header with correct description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Assign one or multiple integrations for your custom business hours.',
            ),
        ).toBeInTheDocument()
    })

    it('renders the table structure with correct headers', () => {
        renderComponent()

        expect(screen.getByText('Integration')).toBeInTheDocument()
        expect(screen.getByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Business hours')).toBeInTheDocument()
    })

    it('renders the select all checkbox in the header', () => {
        renderComponent()

        expect(
            screen.getByRole('checkbox', { name: 'Select all integrations' }),
        ).toBeInTheDocument()
    })

    it('selects all checkboxes correctly when clicking on the select all checkbox', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() =>
            expect(
                screen.getByText(integrations[0].integration_name),
            ).toBeInTheDocument(),
        )

        const firstIntegrationCheckbox = screen.getByRole('checkbox', {
            name: `assigned_integrations.assign_integrations.${integrations[0].integration_id}`,
        })
        expect(firstIntegrationCheckbox).toBeChecked()

        const secondIntegrationCheckbox = screen.getByRole('checkbox', {
            name: `assigned_integrations.assign_integrations.${integrations[1].integration_id}`,
        })
        expect(secondIntegrationCheckbox).not.toBeChecked()

        const selectAllCheckbox = screen.getByRole('checkbox', {
            name: 'Select all integrations',
        })
        expect(selectAllCheckbox).not.toBeChecked()

        /* select all */
        await waitFor(() => user.click(selectAllCheckbox))

        expect(firstIntegrationCheckbox).toBeChecked()
        expect(secondIntegrationCheckbox).toBeChecked()
        expect(selectAllCheckbox).toBeChecked()

        /* unselect all */
        await waitFor(() => user.click(selectAllCheckbox))

        expect(firstIntegrationCheckbox).not.toBeChecked()
        expect(secondIntegrationCheckbox).not.toBeChecked()
        expect(selectAllCheckbox).not.toBeChecked()
    })

    it('renders the navigation component when data is loaded', async () => {
        const mockHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    meta: {
                        ...data.meta,
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    },
                }),
        )

        server.use(mockHandler.handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('keyboard_arrow_left')).toBeInTheDocument()
            expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
        })
    })

    it('does not render the navigation, select all and integration rows field when isLoading is true', () => {
        const { container } = renderComponent()

        expect(
            screen.queryByText('keyboard_arrow_left'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('keyboard_arrow_right'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('IntegrationRowsField'),
        ).not.toBeInTheDocument()

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders skeleton rows when loading', () => {
        const { container } = renderComponent()

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('disables select all checkbox when loading', () => {
        renderComponent()

        const selectAllCheckbox = screen.getByRole('checkbox', {
            name: 'Select all integrations',
        })
        expect(selectAllCheckbox).toBeDisabled()
    })

    it('enables select all checkbox when data is loaded', async () => {
        renderComponent()

        await waitFor(() => {
            const selectAllCheckbox = screen.getByRole('checkbox', {
                name: 'Select all integrations',
            })
            expect(selectAllCheckbox).not.toBeDisabled()
        })
    })

    it('handles select all checkbox interaction', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            const selectAllCheckbox = screen.getByRole('checkbox', {
                name: 'Select all integrations',
            })
            expect(selectAllCheckbox).not.toBeDisabled()
        })

        const selectAllCheckbox = screen.getByRole('checkbox', {
            name: 'Select all integrations',
        })

        await user.click(selectAllCheckbox)

        expect(selectAllCheckbox).toBeChecked()
    })

    it('handles navigation next button click', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
        })

        const nextButton = screen
            .getByText('keyboard_arrow_right')
            .closest('button')
        expect(nextButton).toBeInTheDocument()

        if (nextButton) {
            await user.click(nextButton)
        }
    })

    it('handles navigation prev button click', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('keyboard_arrow_left')).toBeInTheDocument()
        })

        const prevButton = screen
            .getByText('keyboard_arrow_left')
            .closest('button')
        expect(prevButton).toBeInTheDocument()

        if (prevButton) {
            await user.click(prevButton)
        }
    })

    it('maintains table structure even when no data', async () => {
        renderComponent()

        // Table headers should still be present
        expect(screen.getByText('Integration')).toBeInTheDocument()
        expect(screen.getByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Business hours')).toBeInTheDocument()
    })

    it('renders with correct CSS classes', () => {
        const { container } = renderComponent()

        const tableWrapper = container.querySelector('[class*="table"]')
        expect(tableWrapper).toBeInTheDocument()
    })
})
