import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'

import { InteractionFilterType } from '../../types'
import Filters from '../Filters'
import { InteractionType } from '../InteractionType'
import { RangeFilter } from '../RangeFilter'
import { TicketStatusFilter } from '../TicketStatusFilter'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('../InteractionType', () => ({
    InteractionType: jest.fn(() => (
        <div data-testid="InteractionType">InteractionType</div>
    )),
}))

jest.mock('../RangeFilter', () => ({
    RangeFilter: jest.fn(() => (
        <div data-testid="RangeFilter">RangeFilter</div>
    )),
}))

jest.mock('../TicketStatusFilter', () => ({
    TicketStatusFilter: jest.fn(() => (
        <div data-testid="TicketStatusFilter">TicketStatusFilter</div>
    )),
}))

const useFlagMock = assumeMock(useFlag)
const InteractionTypeMock = assumeMock(InteractionType)
const RangeFilterMock = assumeMock(RangeFilter)
const TicketStatusFilterMock = assumeMock(TicketStatusFilter)

describe('Filters', () => {
    const mockSetActiveFilters = jest.fn()
    const mockSetRangeFilter = jest.fn()
    const mockSetMemoizedFilters = jest.fn()

    const defaultProps = {
        setActiveFilters: mockSetActiveFilters,
        setMemoizedFilters: mockSetMemoizedFilters,
        setRangeFilter: mockSetRangeFilter,
        selectedTypeKeys: ['ticket', 'order'] as InteractionFilterType[],
        selectedStatusKeys: ['open', 'closed'] as any,
        isTypeFilterDisabled: false,
        rangeFilter: { start: null, end: null },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockReturnValue(true) // Enable ShopifyCustomerTimeline by default
    })

    describe('Component rendering', () => {
        it('should render RangeFilter and TicketStatusFilter by default', () => {
            render(<Filters {...defaultProps} />)

            expect(screen.getByTestId('RangeFilter')).toBeInTheDocument()
            expect(screen.getByTestId('TicketStatusFilter')).toBeInTheDocument()
            expect(RangeFilterMock).toHaveBeenCalledWith(
                {
                    range: defaultProps.rangeFilter,
                    setRangeFilter: mockSetRangeFilter,
                },
                {},
            )
            expect(TicketStatusFilterMock).toHaveBeenCalledWith(
                {
                    selectedStatus: defaultProps.selectedStatusKeys,
                    toggleSelectedStatus: expect.any(Function),
                    isDisabled: defaultProps.isTypeFilterDisabled,
                },
                {},
            )
        })

        it('should render InteractionType when ShopifyCustomerTimeline flag is enabled', () => {
            useFlagMock.mockReturnValue(true)

            render(<Filters {...defaultProps} />)

            expect(screen.getByTestId('InteractionType')).toBeInTheDocument()
            expect(InteractionTypeMock).toHaveBeenCalledWith(
                {
                    selectedType: defaultProps.selectedTypeKeys,
                    toggleSelectedType: expect.any(Function),
                },
                {},
            )
        })

        it('should not render InteractionType when ShopifyCustomerTimeline flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            render(<Filters {...defaultProps} />)

            expect(
                screen.queryByTestId('InteractionType'),
            ).not.toBeInTheDocument()
            expect(InteractionTypeMock).not.toHaveBeenCalled()
        })
    })

    describe('InteractionType toggle behavior', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should toggle interaction type using setMemoizedFilters', () => {
            render(<Filters {...defaultProps} />)

            // Get the toggleSelectedType function passed to InteractionType
            const toggleSelectedType =
                InteractionTypeMock.mock.calls[0][0].toggleSelectedType

            // Simulate toggling a type (e.g., 'ticket')
            toggleSelectedType('ticket')

            expect(mockSetMemoizedFilters).toHaveBeenCalledWith(
                expect.any(Function),
            )

            // Test the function passed to setMemoizedFilters
            const setMemoizedFiltersCallback =
                mockSetMemoizedFilters.mock.calls[0][0]
            const previousState = {
                ticket: true,
                order: false,
            }

            const result = setMemoizedFiltersCallback(previousState)

            expect(result).toEqual({
                ticket: false, // ticket toggled from true to false
                order: false,
            })
        })

        it('should handle toggling different interaction types correctly', () => {
            render(<Filters {...defaultProps} />)

            const toggleSelectedType =
                InteractionTypeMock.mock.calls[0][0].toggleSelectedType

            // Simulate toggling 'order'
            toggleSelectedType('order')

            const setMemoizedFiltersCallback =
                mockSetMemoizedFilters.mock.calls[0][0]
            const previousState = {
                ticket: true,
                order: true,
            }

            const result = setMemoizedFiltersCallback(previousState)

            expect(result).toEqual({
                ticket: true,
                order: false, // order toggled from true to false
            })
        })

        it('should preserve other filter properties when toggling interaction type', () => {
            render(<Filters {...defaultProps} />)

            const toggleSelectedType =
                InteractionTypeMock.mock.calls[0][0].toggleSelectedType
            toggleSelectedType('ticket')

            const setMemoizedFiltersCallback =
                mockSetMemoizedFilters.mock.calls[0][0]
            const previousState = {
                ticket: false,
                order: true,
            }

            const result = setMemoizedFiltersCallback(previousState)

            expect(result).toEqual({
                ticket: true, // ticket toggled from false to true
                order: true,
            })
        })
    })

    describe('TicketStatusFilter toggle behavior', () => {
        it('should toggle status filter without affecting other filters', () => {
            render(<Filters {...defaultProps} />)

            // Get the toggleSelectedStatus function passed to TicketStatusFilter
            const toggleSelectedStatus =
                TicketStatusFilterMock.mock.calls[0][0].toggleSelectedStatus

            // Simulate toggling a status (e.g., 'open')
            toggleSelectedStatus('open')

            expect(mockSetActiveFilters).toHaveBeenCalledWith(
                expect.any(Function),
            )

            // Test the function passed to setActiveFilters
            const setActiveFiltersCallback =
                mockSetActiveFilters.mock.calls[0][0]
            const previousState = {
                type: { ticket: true, order: false },
                status: { open: true, closed: false, snooze: true },
                sortOption: {
                    order: 'desc',
                    key: 'last_message_datetime',
                    label: 'Last message',
                },
            }

            const result = setActiveFiltersCallback(previousState)

            expect(result).toEqual({
                type: { ticket: true, order: false }, // type filters unchanged
                status: { open: false, closed: false, snooze: true }, // only 'open' toggled
                sortOption: {
                    order: 'desc',
                    key: 'last_message_datetime',
                    label: 'Last message',
                }, // unchanged
            })
        })

        it('should handle toggling different status types correctly', () => {
            render(<Filters {...defaultProps} />)

            const toggleSelectedStatus =
                TicketStatusFilterMock.mock.calls[0][0].toggleSelectedStatus

            // Test toggling 'closed'
            toggleSelectedStatus('closed')

            const setActiveFiltersCallback =
                mockSetActiveFilters.mock.calls[0][0]
            const previousState = {
                type: { ticket: false, order: true },
                status: { open: false, closed: false, snooze: false },
                sortOption: {
                    order: 'asc',
                    key: 'created_datetime',
                    label: 'Created',
                },
            }

            const result = setActiveFiltersCallback(previousState)

            expect(result).toEqual({
                type: { ticket: false, order: true }, // type filters unchanged
                status: { open: false, closed: true, snooze: false }, // only 'closed' toggled
                sortOption: {
                    order: 'asc',
                    key: 'created_datetime',
                    label: 'Created',
                }, // unchanged
            })
        })
    })

    describe('Props passing', () => {
        it('should pass correct props to all child components', () => {
            const customProps = {
                ...defaultProps,
                selectedTypeKeys: ['ticket'] as InteractionFilterType[],
                selectedStatusKeys: ['open', 'snooze'] as any,
                isTypeFilterDisabled: true,
                rangeFilter: { start: 123456789, end: 987654321 },
            }

            useFlagMock.mockReturnValue(true)

            render(<Filters {...customProps} />)

            // Verify RangeFilter props
            expect(RangeFilterMock).toHaveBeenCalledWith(
                {
                    range: customProps.rangeFilter,
                    setRangeFilter: mockSetRangeFilter,
                },
                {},
            )

            // Verify InteractionType props
            expect(InteractionTypeMock).toHaveBeenCalledWith(
                {
                    selectedType: customProps.selectedTypeKeys,
                    toggleSelectedType: expect.any(Function),
                },
                {},
            )

            // Verify TicketStatusFilter props
            expect(TicketStatusFilterMock).toHaveBeenCalledWith(
                {
                    selectedStatus: customProps.selectedStatusKeys,
                    toggleSelectedStatus: expect.any(Function),
                    isDisabled: customProps.isTypeFilterDisabled,
                },
                {},
            )
        })
    })

    describe('Feature flag integration', () => {
        it('should check for ShopifyCustomerTimeline feature flag', () => {
            render(<Filters {...defaultProps} />)

            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.ShopifyCustomerTimeline,
                false,
            )
        })

        it('should conditionally render InteractionType based on feature flag', () => {
            // Test with flag disabled
            useFlagMock.mockReturnValue(false)
            const { rerender } = render(<Filters {...defaultProps} />)

            expect(InteractionTypeMock).not.toHaveBeenCalled()

            // Test with flag enabled
            useFlagMock.mockReturnValue(true)
            rerender(<Filters {...defaultProps} />)

            expect(InteractionTypeMock).toHaveBeenCalled()
        })
    })
})
