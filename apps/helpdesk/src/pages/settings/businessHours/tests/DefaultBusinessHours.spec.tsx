import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAccountSettingsHandler,
    mockUpdateAccountSettingHandler,
} from '@gorgias/helpdesk-mocks'
import type {
    AccountSettingsItem,
    BusinessHoursTimeframe,
} from '@gorgias/helpdesk-types'

import { useAppNode } from 'appNode'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithStore } from 'utils/testing'

import DefaultBusinessHours from '../DefaultBusinessHours'

jest.mock('appNode')
const mockUseAppNode = assumeMock(useAppNode)

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions')

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => () => (
    <div>Form Unsaved Changes Prompt</div>
))

const mockBusinessHoursData: AccountSettingsItem = {
    id: 1,
    type: 'business-hours',
    data: {
        timezone: 'US/Pacific',
        business_hours: [
            {
                days: '1,2,3,4,5',
                from_time: '09:00',
                to_time: '17:00',
            },
        ] as BusinessHoursTimeframe[],
    },
}

const queryClient = mockQueryClient()
const server = setupServer()

const updateAccountSettingMock = mockUpdateAccountSettingHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    const listAccountSettingsMock = mockListAccountSettingsHandler(async () => {
        return HttpResponse.json({
            data: [mockBusinessHoursData],
        })
    })
    server.use(
        listAccountSettingsMock.handler,
        updateAccountSettingMock.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

describe('<DefaultBusinessHours />', () => {
    let mockAppNode: HTMLElement

    beforeEach(() => {
        mockAppNode = document.createElement('div')
        document.body.appendChild(mockAppNode)
        mockUseAppNode.mockReturnValue(mockAppNode as any)
    })

    afterEach(() => {
        document.body.removeChild(mockAppNode)
        jest.clearAllMocks()
        queryClient.clear()
    })

    const renderComponent = () =>
        renderWithStore(
            <QueryClientProvider client={queryClient}>
                <DefaultBusinessHours />
            </QueryClientProvider>,
            {},
        )

    it('should render the component with business hours data', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Default Business Hours'),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(
                'These hours serve as the default schedule used across Gorgias for all integrations where no custom hours are defined. If no custom hours are specified, the system defaults to treating all time as outside business hours.',
            ),
        ).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('US/Pacific')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(
                screen.getByText('Mon-Fri, 9:00 AM-5:00 PM'),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByLabelText('Edit default business hours'),
        ).toBeInTheDocument()
    })

    it('should handle loading state', async () => {
        renderComponent()

        expect(screen.queryByText('US/Pacific')).not.toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText('US/Pacific')).toBeInTheDocument()
        })
    })

    it('should handle when there is no business hours data', () => {
        const listAccountSettingsMock = mockListAccountSettingsHandler(
            async () =>
                HttpResponse.json({
                    data: [],
                }),
        )
        server.use(listAccountSettingsMock.handler)

        renderComponent()

        expect(screen.getByText('Default Business Hours')).toBeInTheDocument()

        expect(
            screen.getByText(
                'These hours serve as the default schedule used across Gorgias for all integrations where no custom hours are defined. If no custom hours are specified, the system defaults to treating all time as outside business hours.',
            ),
        ).toBeInTheDocument()
    })

    it('should open the drawer when edit button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByLabelText('Edit default business hours'),
            )
        })

        await waitFor(() => {
            expect(
                screen.getByText('Edit default business hours'),
            ).toBeInTheDocument()

            expect(screen.getByText(/Timezone/)).toBeInTheDocument()
            expect(screen.getByText(/Schedule/)).toBeInTheDocument()
            expect(screen.getByText('Save changes')).toBeInTheDocument()
            expect(screen.getByText('Cancel')).toBeInTheDocument()
        })
    })

    it('should have proper aria labels', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByLabelText('Edit default business hours'),
            ).toBeInTheDocument()
        })
    })

    describe('Drawer functionality', () => {
        const user = userEvent.setup()

        it('should close drawer when close button is clicked', async () => {
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Edit default business hours'),
                ).toBeInTheDocument()
            })

            const closeButton = screen.getByTitle('Close form')
            await act(async () => {
                await user.click(closeButton)
            })

            await waitFor(() => {
                expect(
                    screen.queryByText('Edit default business hours'),
                ).not.toBeInTheDocument()
            })
        })

        it('should close drawer when cancel button is clicked', async () => {
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Edit default business hours'),
                ).toBeInTheDocument()
            })

            const cancelButton = screen.getByText('Cancel')
            await act(async () => {
                await user.click(cancelButton)
            })

            await waitFor(() => {
                expect(
                    screen.queryByText('Edit default business hours'),
                ).not.toBeInTheDocument()
            })
        })

        it('should submit form with correct data structure', async () => {
            const waitForUpdateRequest =
                updateAccountSettingMock.waitForRequest(server)

            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(async () => {
                await user.click(screen.getByText('Add time range'))
            })

            const saveButton = screen.getByText('Save changes')
            await act(async () => {
                await user.click(saveButton)
            })

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                expect(body.id).toBe(1)
                expect(body.data.timezone).toBe('US/Pacific')
                expect(body.data.business_hours).toHaveLength(2)
                expect(body.data.business_hours[0].days).toBe('1,2,3,4,5')
                expect(body.data.business_hours[0].from_time).toBe('09:00')
                expect(body.data.business_hours[0].to_time).toBe('17:00')
            })
        })

        it('should handle timezone field interaction', async () => {
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Edit default business hours'),
                ).toBeInTheDocument()
            })

            const timezoneField = screen.getByText(/Timezone/)
            expect(timezoneField).toBeInTheDocument()
        })

        it('should render FormUnsavedChangesPrompt component', async () => {
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Edit default business hours'),
                ).toBeInTheDocument()
            })

            expect(
                screen.getByText('Form Unsaved Changes Prompt'),
            ).toBeInTheDocument()
        })

        it('should handle multiple business hours with mixed everyday and regular days', async () => {
            const mockDataWithMixedHours: AccountSettingsItem = {
                id: 1,
                type: 'business-hours',
                data: {
                    timezone: 'US/Pacific',
                    business_hours: [
                        {
                            days: '1,2,3,4,5',
                            from_time: '09:00',
                            to_time: '17:00',
                        },
                    ] as BusinessHoursTimeframe[],
                },
            }

            const listAccountSettingsMock = mockListAccountSettingsHandler(
                async () =>
                    HttpResponse.json({
                        data: [mockDataWithMixedHours],
                    }),
            )
            server.use(listAccountSettingsMock.handler)

            const waitForUpdateRequest =
                updateAccountSettingMock.waitForRequest(server)

            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(async () => {
                await user.click(screen.getByText('Add time range'))
            })

            const saveButton = screen.getByText('Save changes')
            await act(async () => {
                await user.click(saveButton)
            })

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                expect(body.data.business_hours).toHaveLength(2)
                expect(body.data.business_hours[0].days).toBe('1,2,3,4,5')
                expect(body.data.business_hours[1].days).toBe('1,2,3,4,5,6,7')
            })
        })

        it('should handle empty business hours array', async () => {
            const user = userEvent.setup()
            const waitForUpdateRequest =
                updateAccountSettingMock.waitForRequest(server)

            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByLabelText('Edit default business hours'),
                )
            })

            await waitFor(async () => {
                await user.click(screen.getAllByText('close')[1])
            })

            await act(async () => {
                const saveButton = screen.getByText('Save changes')

                await user.click(saveButton)
            })

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                expect(body.data.business_hours).toHaveLength(0)
            })
        })
    })
})
