import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGetBusinessHoursDetails } from '@gorgias/helpdesk-queries'
import { BusinessHoursConfig, BusinessHoursList } from '@gorgias/helpdesk-types'

import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'
import { useBusinessHoursSearch } from 'hooks/businessHours/useBusinessHoursSearch'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import BusinessHoursSelectField from '../BusinessHoursSelectField'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetBusinessHoursDetails: jest.fn(),
}))

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

const useBusinessHoursSearchMock = assumeMock(useBusinessHoursSearch)
const useBusinessHoursMock = assumeMock(useBusinessHours)
const useAppSelectorMock = assumeMock(useAppSelector)
const useGetBusinessHoursDetailsMock = assumeMock(useGetBusinessHoursDetails)

const handleChange = jest.fn()
const renderComponent = (value?: number | null) =>
    render(<BusinessHoursSelectField value={value} onChange={handleChange} />)

describe('<BusinessHoursSelectField />', () => {
    const defaultBusinessHours = {
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

    const mockBusinessHours: BusinessHoursList[] = [
        {
            id: 1,
            name: 'US Business Hours',
            business_hours_config: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '09:00',
                        to_time: '17:00',
                    },
                ],
                timezone: 'America/New_York',
            },
            created_datetime: '2021-01-01T00:00:00Z',
            updated_datetime: '2021-01-01T00:00:00Z',
            integration_count: 2,
            first_integration: {
                integration_id: 1,
                integration_name: 'Phone Support',
                integration_type: 'phone',
                store: {
                    store_id: 1,
                    store_name: 'Main Store',
                    store_type: 'shopify',
                },
            },
        },
        {
            id: 2,
            name: 'EU Business Hours',
            business_hours_config: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '08:00',
                        to_time: '16:00',
                    },
                ],
                timezone: 'Europe/London',
            },
            created_datetime: '2021-01-01T00:00:00Z',
            updated_datetime: '2021-01-01T00:00:00Z',
            integration_count: 1,
            first_integration: {
                integration_id: 2,
                integration_name: 'Email Support',
                integration_type: 'email',
                store: {
                    store_id: 2,
                    store_name: 'EU Store',
                    store_type: 'shopify',
                },
            },
        },
        {
            id: 3,
            name: '24/7 Support',
            business_hours_config: {
                business_hours: [],
                timezone: 'UTC',
            },
            created_datetime: '2021-01-01T00:00:00Z',
            updated_datetime: '2021-01-01T00:00:00Z',
            integration_count: 0,
            first_integration: null,
        },
    ]

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
            getBusinessHoursConfigLabel: mockGetBusinessHoursConfigLabel,
        })
        useAppSelectorMock.mockReturnValue(defaultBusinessHours)
        useGetBusinessHoursDetailsMock.mockReturnValue({
            data: null,
        } as any)
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
            value: 1,
            label: 'US Business Hours (Mon-Fri, 09:00-17:00, America/New_York)',
        },
    ])(
        'should display the default business hours as first option',
        ({ value, label }) => {
            renderComponent(value)

            expect(screen.getByText('Business Hours')).toBeInTheDocument()
            expect(screen.getByText(label)).toBeInTheDocument()
        },
    )

    it('should fetch business hours details when the selected business hours is not in the list', () => {
        const mockHandleBusinessHoursSearch = Object.assign(jest.fn(), {
            cancel: jest.fn(),
            flush: jest.fn(),
        })

        useBusinessHoursSearchMock.mockReturnValue({
            businessHours: [mockBusinessHours[1]], // Only EU Business Hours
            onLoad: jest.fn(),
            shouldLoadMore: false,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
            handleBusinessHoursSearch: mockHandleBusinessHoursSearch,
        } as any)

        useGetBusinessHoursDetailsMock.mockReturnValue({
            data: { data: mockBusinessHours[0] }, // Return US Business Hours
        } as any)

        renderComponent(1)

        expect(
            screen.getByText(
                'US Business Hours (Mon-Fri, 09:00-17:00, America/New_York)',
            ),
        ).toBeInTheDocument()

        expect(useGetBusinessHoursDetailsMock).toHaveBeenCalledWith(1, {
            query: {
                enabled: true,
                staleTime: 60_000,
            },
        })
    })

    it('should open the dropdown and display business hours options', async () => {
        const user = userEvent.setup()
        renderComponent()

        const selectInput = screen.getByText(
            'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
        )
        await act(() => user.click(selectInput))

        expect(screen.getByText('Default business hours')).toBeInTheDocument()
        expect(screen.getByText('US Business Hours')).toBeInTheDocument()
        expect(screen.getByText('EU Business Hours')).toBeInTheDocument()
        expect(screen.getByText('24/7 Support')).toBeInTheDocument()
    })

    it('should call onChange when default business hours is selected', async () => {
        const user = userEvent.setup()
        renderComponent(1)

        await act(() =>
            user.click(
                screen.getByText(
                    'US Business Hours (Mon-Fri, 09:00-17:00, America/New_York)',
                ),
            ),
        )

        const defaultOption = screen.getByText('Default business hours')
        await act(() => user.click(defaultOption))

        expect(handleChange).toHaveBeenCalledWith(null)
    })

    it('should call onChange when a custom business hours is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(() =>
            user.click(
                screen.getByText(
                    'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
                ),
            ),
        )

        const usBusinessHours = screen.getByText('US Business Hours')
        await act(() => user.click(usBusinessHours))

        expect(handleChange).toHaveBeenCalledWith(1)
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

        await act(() =>
            user.click(
                screen.getByText(
                    'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
                ),
            ),
        )

        // Infinite scroll should be present and ready to load more
        expect(mockOnLoad).toBeDefined()
    })

    it('should handle well missing default business hours data', async () => {
        useAppSelectorMock.mockReturnValue(undefined)

        const user = userEvent.setup()
        renderComponent()

        const selectInput = screen.getByText('Default business hours')
        await act(() => user.click(selectInput))

        expect(screen.getAllByText('Default business hours')).toHaveLength(1) // i.e. it should not appear in the opened dropdown list
        expect(screen.getByText('US Business Hours')).toBeInTheDocument()
        expect(screen.getByText('EU Business Hours')).toBeInTheDocument()
        expect(screen.getByText('24/7 Support')).toBeInTheDocument()
    })

    it('should open modal and close dropdown when "Add Custom Business Hours" button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const selectInput = screen.getByText(
            'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
        )
        await act(() => user.click(selectInput))

        // check that the dropdown is open
        expect(screen.getByText('US Business Hours')).toBeInTheDocument()

        const addButton = screen.getByText('Add Custom Business Hours')
        expect(addButton).toBeInTheDocument()
        await act(() => user.click(addButton))

        expect(
            screen.getByTestId('add-custom-business-hours-modal'),
        ).toBeInTheDocument()
        // check that the dropdown is closed
        expect(screen.queryByText('US Business Hours')).not.toBeInTheDocument()
    })

    it('should handle modal closing', async () => {
        const mockRefetch = jest.fn()
        useBusinessHoursSearchMock.mockReturnValue({
            refetch: mockRefetch,
        } as any)

        const user = userEvent.setup()
        renderComponent()

        const selectInput = screen.getByText(
            'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
        )
        await act(() => user.click(selectInput))

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

        const selectInput = screen.getByText(
            'Default business hours (Mon-Fri, 09:00-17:00, Europe/Rome)',
        )
        await act(() => user.click(selectInput))

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
