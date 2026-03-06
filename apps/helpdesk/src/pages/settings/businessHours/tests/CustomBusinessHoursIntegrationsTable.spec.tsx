import { Form } from '@repo/forms'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
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

import { IntegrationType } from 'models/integration/constants'
import type { ShopifyIntegration } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithStore } from 'utils/testing'

import type { CustomBusinessHoursContextState } from '../CustomBusinessHoursContext'
import { CustomBusinessHoursContext } from '../CustomBusinessHoursContext'
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
    server.use(mockAccountSettingsHandler.handler, mockHandler.handler)
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

const renderComponent = (
    name?: string,
    cbhProviderValue: Partial<CustomBusinessHoursContextState> = {},
) =>
    renderWithStore(
        <QueryClientProvider client={queryClient}>
            <CustomBusinessHoursContext.Provider
                value={
                    {
                        integrationsToOverride: [],
                        toggleIntegrationsToOverride: jest.fn(),
                        ...cbhProviderValue,
                    } as CustomBusinessHoursContextState
                }
            >
                <Form
                    onValidSubmit={jest.fn()}
                    defaultValues={{
                        assigned_integrations: {
                            assign_integrations: [
                                integrations[0].integration_id,
                            ],
                        },
                        temporary_assigned_integrations: [
                            integrations[0].integration_id,
                        ],
                    }}
                >
                    <CustomBusinessHoursIntegrationsTable name={name as any} />
                </Form>
            </CustomBusinessHoursContext.Provider>
        </QueryClientProvider>,
        {
            integrations: fromJS({
                integrations: [
                    {
                        id: 42,
                        type: IntegrationType.Shopify,
                        name: 'Test Shopify Store',
                    } as ShopifyIntegration,
                ],
            }),
        } as any,
    )

describe('CustomBusinessHoursIntegrationsTable', () => {
    it('renders the table structure with correct headers', () => {
        renderComponent()

        expect(screen.getByText('Integration')).toBeInTheDocument()
        expect(screen.getByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Business hours')).toBeInTheDocument()

        // filters
        expect(screen.getByText('search')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /All Stores/ }),
        ).toBeInTheDocument()
        expect(screen.getByText('All Channels')).toBeInTheDocument()
    })

    it('renders the select all checkbox in the header', () => {
        renderComponent()

        expect(
            screen.getByRole('checkbox', { name: 'Select all integrations' }),
        ).toBeInTheDocument()
    })

    it.each([
        [undefined, 'assigned_integrations.assign_integrations'],
        ['temporary_assigned_integrations', 'temporary_assigned_integrations'],
    ])(
        'selects all checkboxes correctly when clicking on the select all checkbox',
        async (name: any, expectedName) => {
            const user = userEvent.setup()
            renderComponent(name)

            await waitFor(() =>
                expect(
                    screen.getByText(integrations[0].integration_name),
                ).toBeInTheDocument(),
            )

            const firstIntegrationCheckbox = screen.getByRole('checkbox', {
                name: `${expectedName}.${integrations[0].integration_id}`,
            })
            expect(firstIntegrationCheckbox).toBeChecked()

            const secondIntegrationCheckbox = screen.getByRole('checkbox', {
                name: `${expectedName}.${integrations[1].integration_id}`,
            })
            expect(secondIntegrationCheckbox).not.toBeChecked()

            const selectAllCheckbox = screen.getByRole('checkbox', {
                name: 'Select all integrations',
            })
            expect(selectAllCheckbox).not.toBeChecked()

            /* select all */
            await user.click(selectAllCheckbox)

            expect(firstIntegrationCheckbox).toBeChecked()
            expect(secondIntegrationCheckbox).toBeChecked()
            expect(selectAllCheckbox).toBeChecked()

            /* unselect all */

            await user.click(selectAllCheckbox)

            expect(firstIntegrationCheckbox).not.toBeChecked()
            expect(secondIntegrationCheckbox).not.toBeChecked()
            expect(selectAllCheckbox).not.toBeChecked()
        },
    )

    it('make select all checkbox unchecked and disabled if there are no integrations', async () => {
        const mockHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [],
                }),
        )
        server.use(mockHandler.handler)

        renderComponent()

        await waitFor(() =>
            expect(screen.getByText('No data available')).toBeInTheDocument(),
        )

        const selectAllCheckbox = screen.getByRole('checkbox', {
            name: 'Select all integrations',
        })
        expect(selectAllCheckbox).not.toBeChecked()
        expect(selectAllCheckbox).toBeDisabled()
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

    it('does not render the navigation when isLoading is true', () => {
        renderComponent()

        expect(
            screen.queryByText('keyboard_arrow_left'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('keyboard_arrow_right'),
        ).not.toBeInTheDocument()
    })

    it('renders skeleton row when loading', () => {
        const { container } = renderComponent()

        expect(
            screen.queryByText('ListCustomBusinessHoursTableRow'),
        ).not.toBeInTheDocument()

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
        const toggleIntegrationsToOverride = jest.fn()
        renderComponent(undefined, {
            toggleIntegrationsToOverride,
        })

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

        await waitFor(() => {
            expect(selectAllCheckbox).toBeChecked()
        })

        expect(toggleIntegrationsToOverride).toHaveBeenCalledWith(
            integrations,
            true,
        )

        await user.click(selectAllCheckbox)

        await waitFor(() => {
            expect(selectAllCheckbox).not.toBeChecked()
        })

        expect(toggleIntegrationsToOverride).toHaveBeenCalledWith(
            integrations,
            false,
        )
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

    it('handles sorting header click and cycles through sorting states', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(integrations[0].integration_name),
            ).toBeInTheDocument()
        })

        const integrationHeader = screen.getByText('Integration')

        expect(integrationHeader).toBeInTheDocument()

        await user.click(integrationHeader)

        expect(screen.getByText('arrow_upward')).toBeVisible()

        await user.click(integrationHeader)

        expect(screen.getByText('arrow_downward')).toBeVisible()

        await user.click(integrationHeader)
    })

    it('should search for integrations by name when typing in the search input', async () => {
        const user = userEvent.setup()
        const searchTerm = 'Shopify'

        let receivedSearchParam: string | undefined
        const queryHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                receivedSearchParam =
                    url.searchParams.get('name_search') ?? undefined
                return HttpResponse.json(mockListResponse)
            },
        )

        server.use(queryHandler.handler, mockAccountSettingsHandler.handler)

        renderComponent()

        const searchInput = await screen.findByPlaceholderText(
            'Search integrations',
        )

        await user.clear(searchInput)
        await user.type(searchInput, searchTerm)

        await waitFor(() => {
            expect(receivedSearchParam).toBe(searchTerm)
        })
    })

    it('should search for integrations by channel when selecting a channel from the dropdown', async () => {
        const user = userEvent.setup()

        let receivedChannelsParam: string | undefined
        const queryHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                receivedChannelsParam =
                    url.searchParams.get('channels') ?? undefined
                return HttpResponse.json(mockListResponse)
            },
        )

        server.use(queryHandler.handler, mockAccountSettingsHandler.handler)

        renderComponent()

        const allChannelsDropdown = await screen.findByRole('button', {
            name: /all channels/i,
        })
        await user.click(allChannelsDropdown)

        const voiceOption = await screen.findByText('Voice')
        await user.click(voiceOption)

        await waitFor(() => {
            expect(receivedChannelsParam).toBe('phone')
        })
    })

    it('should search for integrations by App channel when selecting More Applications from the dropdown', async () => {
        const user = userEvent.setup()

        let receivedChannelsParam: string | undefined
        const queryHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                receivedChannelsParam =
                    url.searchParams.get('channels') ?? undefined
                return HttpResponse.json(mockListResponse)
            },
        )

        server.use(queryHandler.handler, mockAccountSettingsHandler.handler)

        renderComponent()

        const allChannelsDropdown = await screen.findByRole('button', {
            name: /all channels/i,
        })
        await user.click(allChannelsDropdown)

        const appOption = await screen.findByText('More Applications')
        await user.click(appOption)

        await waitFor(() => {
            expect(receivedChannelsParam).toBe('app')
        })
    })

    it('should search for integrations by store when selecting a store from the dropdown', async () => {
        const user = userEvent.setup()

        let receivedStoreIdParam: string | undefined
        const queryHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                receivedStoreIdParam =
                    url.searchParams.get('store_id') ?? undefined
                return HttpResponse.json(mockListResponse)
            },
        )

        server.use(queryHandler.handler, mockAccountSettingsHandler.handler)

        renderComponent()

        const allStoresButton = await screen.findByRole('button', {
            name: /all stores/i,
        })
        await user.click(allStoresButton)

        const storeOption = await screen.findByRole('option', {
            name: /Test Shopify Store/,
        })
        await act(async () => {
            await user.click(storeOption)
        })

        await waitFor(() => {
            expect(receivedStoreIdParam).toBe('42')
        })
    })

    it('displays badge with correct count when integrations are selected', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('1 integration selected'),
            ).toBeInTheDocument()
        })
    })

    it('displays badge with plural form when multiple integrations are selected', async () => {
        const user = userEvent.setup()
        renderComponent(undefined, {
            toggleIntegrationsToOverride: jest.fn(),
        })

        await waitFor(() => {
            expect(
                screen.getByText(integrations[0].integration_name),
            ).toBeInTheDocument()
        })

        const selectAllCheckbox = screen.getByRole('checkbox', {
            name: 'Select all integrations',
        })

        await user.click(selectAllCheckbox)

        await waitFor(() => {
            expect(
                screen.getByText('3 integrations selected'),
            ).toBeInTheDocument()
        })
    })

    it('renders the override confirmation checkbox when there are integrations to override', () => {
        renderComponent(undefined, {
            integrationsToOverride: [1, 2, 3],
        })

        expect(
            screen.getByRole('checkbox', {
                name: 'I confirm overwriting the existing schedules',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /3 of the selected integrations are already assigned to other custom business hour schedules/,
            ),
        ).toBeInTheDocument()
    })

    it('passes target_business_hours_id parameter when businessHoursId is provided in context', async () => {
        const businessHoursId = 123
        let receivedTargetBusinessHoursId: string | undefined

        const queryHandler = mockListIntegrationsForBusinessHoursHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                receivedTargetBusinessHoursId =
                    url.searchParams.get('target_business_hours_id') ??
                    undefined
                return HttpResponse.json(mockListResponse)
            },
        )

        server.use(queryHandler.handler)

        renderComponent(undefined, {
            businessHoursId,
        })

        await waitFor(() => {
            expect(receivedTargetBusinessHoursId).toBe(
                businessHoursId.toString(),
            )
        })
    })
})
