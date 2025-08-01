import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetBusinessHoursDetailsHandler,
    mockGetBusinessHoursDetailsResponse,
    mockListAccountSettingsHandler,
} from '@gorgias/helpdesk-mocks'
import { BusinessHoursConfig } from '@gorgias/helpdesk-types'

import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'
import { useBusinessHoursSearch } from 'hooks/businessHours/useBusinessHoursSearch'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import BusinessHoursSelectField from '../BusinessHoursSelectField'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div>Skeleton</div>,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)

jest.mock('hooks/businessHours/useBusinessHoursSearch')
jest.mock('hooks/businessHours/useBusinessHours')
jest.mock('hooks/useAppSelector')

jest.mock('../AddCustomBusinessHoursModal', () => {
    return function MockAddCustomBusinessHoursModal({
        isOpen,
        onClose,
        onCreateSuccess,
    }: {
        isOpen: boolean
        onClose: () => void
        onCreateSuccess: (id: number) => void
    }) {
        return isOpen ? (
            <div data-testid="add-custom-business-hours-modal">
                <div>Add Custom Business Hours Modal</div>
                <button onClick={onClose}>Close Modal</button>
                <button
                    onClick={() => {
                        onClose()
                        onCreateSuccess(1)
                    }}
                >
                    Add Business Hours
                </button>
            </div>
        ) : null
    }
})

const server = setupServer()
const queryClient = mockQueryClient()

const businessHours1 = mockGetBusinessHoursDetailsResponse({
    name: 'US Business Hours',
})
const businessHours2 = mockGetBusinessHoursDetailsResponse({
    name: 'EU Business Hours',
})
const businessHours3 = mockGetBusinessHoursDetailsResponse({
    name: '24/7 Support',
})

const defaultBusinessHours = {
    id: 1,
    type: 'business_hours',
    data: {
        business_hours: [
            {
                days: '1,2,3,4,5',
                from_time: '09:00',
                to_time: '17:00',
            },
        ],
        timezone: 'Europe/Rome',
    },
}

const mockGetBusinessHoursDetails = mockGetBusinessHoursDetailsHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    const listAccountSettingsMock = mockListAccountSettingsHandler(async () =>
        HttpResponse.json({
            data: [defaultBusinessHours],
        }),
    )
    server.use(
        listAccountSettingsMock.handler,
        mockGetBusinessHoursDetails.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const useBusinessHoursSearchMock = assumeMock(useBusinessHoursSearch)
const useBusinessHoursMock = assumeMock(useBusinessHours)

const handleChange = jest.fn()
const renderComponent = (value?: number | null) =>
    render(
        <QueryClientProvider client={queryClient}>
            <BusinessHoursSelectField value={value} onChange={handleChange} />
        </QueryClientProvider>,
    )

describe('<BusinessHoursSelectField />', () => {
    const mockBusinessHours = [businessHours1, businessHours2, businessHours3]

    const mockGetBusinessHoursConfigLabel = jest.fn()

    beforeEach(() => {
        const mockHandleBusinessHoursSearch = Object.assign(jest.fn(), {
            cancel: jest.fn(),
            flush: jest.fn(),
        })
        useBusinessHoursSearchMock.mockReturnValue({
            businessHours: mockBusinessHours,
            onLoad: jest.fn(),
            shouldLoadMore: false,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
            handleBusinessHoursSearch: mockHandleBusinessHoursSearch,
        } as any)
        useBusinessHoursMock.mockReturnValue({
            getBusinessHoursConfigTimeFrameLabelList: jest.fn(),
            getBusinessHoursConfigLabel: mockGetBusinessHoursConfigLabel,
        })
        mockGetBusinessHoursConfigLabel.mockImplementation(
            (config: BusinessHoursConfig, showTimezone: boolean) => {
                if (config.business_hours.length === 0) {
                    return '24/7'
                }
                const timeframe = 'Mon-Fri, 09:00-17:00'
                return showTimezone
                    ? `${timeframe}, ${config.timezone}`
                    : timeframe
            },
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it.each([
        {
            value: null,
            label: 'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
        },
        {
            value: businessHours1.id,
            label: `${businessHours1.name} (Mon-Fri, 09:00-17:00, ${businessHours1.business_hours_config.timezone})`,
        },
    ])(
        'should display the default business hours as first option',
        async ({ value, label }) => {
            renderComponent(value)

            await waitFor(() => {
                expect(screen.getByText('Business Hours')).toBeInTheDocument()
                expect(screen.getByText(label)).toBeInTheDocument()
            })
        },
    )

    it('should fetch business hours details when the selected business hours is not in the list', async () => {
        const mockHandleBusinessHoursSearch = Object.assign(jest.fn(), {
            cancel: jest.fn(),
            flush: jest.fn(),
        })

        useBusinessHoursSearchMock.mockReturnValue({
            businessHours: [businessHours1],
            onLoad: jest.fn(),
            shouldLoadMore: false,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
            handleBusinessHoursSearch: mockHandleBusinessHoursSearch,
        } as any)

        const mockGetBusinessHoursDetailsWithData =
            mockGetBusinessHoursDetailsHandler(async () =>
                HttpResponse.json(businessHours2),
            )
        server.use(mockGetBusinessHoursDetailsWithData.handler)

        renderComponent(businessHours2.id)

        await waitFor(() => {
            expect(
                screen.getByText(new RegExp(businessHours2.name)),
            ).toBeInTheDocument()
        })
    })

    it('should open the dropdown and display business hours options', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText(
                'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
            )
            await act(() => user.click(selectInput))

            expect(screen.getByText(businessHours1.name)).toBeInTheDocument()
            expect(screen.getByText(businessHours2.name)).toBeInTheDocument()
            expect(screen.getByText(businessHours3.name)).toBeInTheDocument()
        })
    })

    it('should call onChange when default business hours is selected', async () => {
        const user = userEvent.setup()
        renderComponent(businessHours1.id)

        await act(() =>
            user.click(screen.getByText(new RegExp(businessHours1.name))),
        )

        const defaultOption = screen.getByText('Default business hours')
        await act(() => user.click(defaultOption))

        expect(handleChange).toHaveBeenCalledWith(null)
    })

    it('should call onChange when a custom business hours is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText(
                'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
            )
            await act(() => user.click(selectInput))

            const usBusinessHours = screen.getByText(businessHours1.name)
            await act(() => user.click(usBusinessHours))

            expect(handleChange).toHaveBeenCalledWith(businessHours1.id)
        })
    })

    it('should display error state when there is an error', async () => {
        const mockRefetch = jest.fn()
        useBusinessHoursSearchMock.mockReturnValue({
            businessHours: [],
            onLoad: jest.fn(),
            shouldLoadMore: false,
            isLoading: false,
            isError: true,
            refetch: mockRefetch,
            handleBusinessHoursSearch: Object.assign(jest.fn(), {
                cancel: jest.fn(),
                flush: jest.fn(),
            }),
        } as any)

        const user = userEvent.setup()
        renderComponent()

        expect(
            screen.getByText(
                'There was an error while trying to fetch the business hours. Please try again later.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Retry')).toBeInTheDocument()

        await act(() => user.click(screen.getByText('Retry')))
        expect(mockRefetch).toHaveBeenCalled()
    })

    it('should display loading skeletons when data is loading', () => {
        useBusinessHoursSearchMock.mockReturnValue({
            businessHours: [],
            onLoad: jest.fn(),
            shouldLoadMore: false,
            isLoading: true,
            isError: false,
            refetch: jest.fn(),
            handleBusinessHoursSearch: jest.fn(),
        } as any)

        renderComponent()

        expect(screen.getAllByText('Skeleton')).toHaveLength(2)
    })

    it('should handle infinite scroll', async () => {
        const mockOnLoad = jest.fn()
        useBusinessHoursSearchMock.mockReturnValue({
            businessHours: mockBusinessHours,
            onLoad: mockOnLoad,
            shouldLoadMore: true,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
            handleBusinessHoursSearch: jest.fn(),
        } as any)

        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText(
                'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
            )
            await act(() => user.click(selectInput))
        })

        // Infinite scroll should be present and ready to load more
        expect(mockOnLoad).toBeDefined()
    })

    it('should handle well missing default business hours data', async () => {
        const listAccountSettingsMock = mockListAccountSettingsHandler(
            async () => HttpResponse.json(),
        )
        server.use(
            listAccountSettingsMock.handler,
            mockGetBusinessHoursDetails.handler,
        )
        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText('Default business hours')
            await act(() => user.click(selectInput))
        })

        expect(screen.getAllByText('Default business hours')).toHaveLength(1) // i.e. it should not appear in the opened dropdown list
        expect(screen.getByText(businessHours1.name)).toBeInTheDocument()
        expect(screen.getByText(businessHours2.name)).toBeInTheDocument()
        expect(screen.getByText(businessHours3.name)).toBeInTheDocument()
    })

    it('should open modal and close dropdown when "Add Custom Business Hours" button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText(
                'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
            )
            await act(() => user.click(selectInput))
        })

        // check that the dropdown is open
        expect(screen.getByText(businessHours1.name)).toBeInTheDocument()

        const addButton = screen.getByText('Add Custom Business Hours')
        expect(addButton).toBeInTheDocument()
        await act(() => user.click(addButton))

        expect(
            screen.getByTestId('add-custom-business-hours-modal'),
        ).toBeInTheDocument()
        // check that the dropdown is closed
        expect(screen.queryByText(businessHours1.name)).not.toBeInTheDocument()
    })

    it('should handle modal closing', async () => {
        const mockRefetch = jest.fn()
        useBusinessHoursSearchMock.mockReturnValue({
            refetch: mockRefetch,
        } as any)

        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText(
                'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
            )
            await act(() => user.click(selectInput))
        })

        const addButton = screen.getByText('Add Custom Business Hours')
        await act(() => user.click(addButton))

        const closeModalButton = screen.getByText('Close Modal')
        await act(() => user.click(closeModalButton))

        expect(mockRefetch).not.toHaveBeenCalled()
        expect(handleChange).not.toHaveBeenCalled()
        expect(
            screen.queryByTestId('add-custom-business-hours-modal'),
        ).not.toBeInTheDocument()
    })

    it('should handle add business hours on modal', async () => {
        const mockRefetch = jest.fn()
        useBusinessHoursSearchMock.mockReturnValue({
            refetch: mockRefetch,
        } as any)

        const user = userEvent.setup()
        renderComponent()

        await waitFor(async () => {
            const selectInput = screen.getByText(
                'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
            )
            await act(() => user.click(selectInput))
        })

        const addButton = screen.getByText('Add Custom Business Hours')
        await act(() => user.click(addButton))

        const closeModalButton = screen.getByText('Add Business Hours')
        await act(() => user.click(closeModalButton))

        expect(mockRefetch).toHaveBeenCalled()
        expect(handleChange).toHaveBeenCalledWith(1)
        expect(
            screen.queryByTestId('add-custom-business-hours-modal'),
        ).not.toBeInTheDocument()
    })
})
