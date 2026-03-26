import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentsTable } from './SegmentsTable'

const mockSegments: Segment[] = [
    {
        id: 1,
        name: 'Support small business',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 0,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-09-12T00:00:00',
    },
    {
        id: 2,
        name: 'Super brand like really super',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 98762,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-01-20T00:00:00',
    },
]

const defaultProps = {
    data: mockSegments,
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
})
