import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentsTable } from './SegmentsTable'

const mockSegments: Segment[] = [
    {
        id: '1',
        name: 'Support small business',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 0,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-09-12T00:00:00',
    },
    {
        id: '2',
        name: 'Super brand like really super',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 98762,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-01-20T00:00:00',
    },
]

const defaultProps = {
    data: mockSegments,
    hasNextPage: false,
    hasPrevPage: false,
    pageSize: 10,
    onNextPage: jest.fn(),
    onPrevPage: jest.fn(),
    onPageSizeChange: jest.fn(),
    onSegmentClick: jest.fn(),
    onEditClick: jest.fn(),
    onDuplicateClick: jest.fn(),
    onDeleteClick: jest.fn(),
}

const renderComponent = (props = {}) =>
    render(<SegmentsTable {...defaultProps} {...props} />)

describe('<SegmentsTable />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('column headers', () => {
        it('should render Title, Estimated size and Last updated columns', () => {
            renderComponent()

            expect(screen.getByText('Title')).toBeInTheDocument()
            expect(screen.getByText('Estimated size')).toBeInTheDocument()
            expect(screen.getByText('Last updated')).toBeInTheDocument()
        })
    })

    describe('rows', () => {
        it('should render a row for each segment', () => {
            renderComponent()

            expect(
                screen.getByText('Support small business'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Super brand like really super'),
            ).toBeInTheDocument()
        })

        it('should render estimated sizes formatted with ± prefix', () => {
            renderComponent()

            expect(screen.getByText('±0')).toBeInTheDocument()
            expect(screen.getByText('±98,762')).toBeInTheDocument()
        })
    })

    describe('empty state', () => {
        it('should render empty state message when data is empty', () => {
            renderComponent({ data: [] })

            expect(screen.getByText('No segments found')).toBeInTheDocument()
        })
    })

    describe('interactions', () => {
        it('should call onSegmentClick with the segment when a segment name is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('Support small business'))
            })

            expect(defaultProps.onSegmentClick).toHaveBeenCalledWith(
                mockSegments[0],
            )
        })
    })

    describe('pagination', () => {
        it('should disable both pagination buttons when hasNextPage and hasPrevPage are false', () => {
            renderComponent({ hasNextPage: false, hasPrevPage: false })

            expect(
                screen.getByRole('button', { name: /next page/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /previous page/i }),
            ).toBeDisabled()
        })

        it('should enable the Next button and disable the Previous button when only hasNextPage is true', () => {
            renderComponent({ hasNextPage: true, hasPrevPage: false })

            expect(
                screen.getByRole('button', { name: /next page/i }),
            ).toBeEnabled()
            expect(
                screen.getByRole('button', { name: /previous page/i }),
            ).toBeDisabled()
        })

        it('should enable the Previous button and disable the Next button when only hasPrevPage is true', () => {
            renderComponent({ hasNextPage: false, hasPrevPage: true })

            expect(
                screen.getByRole('button', { name: /previous page/i }),
            ).toBeEnabled()
            expect(
                screen.getByRole('button', { name: /next page/i }),
            ).toBeDisabled()
        })

        it('should call onNextPage when the Next button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ hasNextPage: true, hasPrevPage: false })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /next page/i }),
                )
            })

            expect(defaultProps.onNextPage).toHaveBeenCalledTimes(1)
        })

        it('should call onPrevPage when the Previous button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ hasNextPage: false, hasPrevPage: true })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /previous page/i }),
                )
            })

            expect(defaultProps.onPrevPage).toHaveBeenCalledTimes(1)
        })
    })
})
