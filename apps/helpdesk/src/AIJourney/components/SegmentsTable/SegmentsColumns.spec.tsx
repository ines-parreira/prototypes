import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { TableV1CellContext } from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'
import { useAudienceCount } from 'AIJourney/queries/useAudienceCount/useAudienceCount'

import { SegmentMoreOptions } from './SegmentMoreOptions/SegmentMoreOptions'
import { actionColumns, segmentColumns } from './SegmentsColumns'
import type { SegmentsTableMeta } from './SegmentsColumns'

jest.mock('./SegmentMoreOptions/SegmentMoreOptions', () => ({
    SegmentMoreOptions: jest.fn(() => <div>SegmentMoreOptions</div>),
}))

jest.mock('AIJourney/queries/useAudienceCount/useAudienceCount', () => ({
    useAudienceCount: jest.fn(),
}))

const mockUseAudienceCount = useAudienceCount as jest.Mock

const mockSegment: Segment = {
    id: '1',
    name: 'Support small business',
    conditions: 'gt(shopper.lifetime_value, 1000)',
    count: 98762,
    created_datetime: '2026-01-15T00:00:00',
    updated_datetime: '2026-09-12T00:00:00',
}

const mockMeta: SegmentsTableMeta = {
    integrationId: 123,
    onSegmentClick: jest.fn(),
    onEditClick: jest.fn(),
    onDuplicateClick: jest.fn(),
    onDeleteClick: jest.fn(),
    canWrite: true,
}

function makeCellContext(
    value: unknown,
    segmentOverride?: Partial<Segment>,
    metaOverride?: Partial<SegmentsTableMeta>,
): TableV1CellContext<Segment, unknown> {
    return {
        getValue: () => value,
        row: {
            original: { ...mockSegment, ...segmentOverride },
        } as TableV1CellContext<Segment, unknown>['row'],
        table: {
            options: { meta: { ...mockMeta, ...metaOverride } },
        } as unknown as TableV1CellContext<Segment, unknown>['table'],
    } as TableV1CellContext<Segment, unknown>
}

const renderCell = (
    column: (typeof segmentColumns | typeof actionColumns)[number],
    value: unknown,
    segmentOverride?: Partial<Segment>,
    metaOverride?: Partial<SegmentsTableMeta>,
) => {
    const cellFn = column.cell as (
        info: TableV1CellContext<Segment, unknown>,
    ) => React.ReactNode
    return render(
        <>{cellFn(makeCellContext(value, segmentOverride, metaOverride))}</>,
    )
}

describe('segmentColumns', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAudienceCount.mockReturnValue({
            data: undefined,
            isFetching: false,
        })
    })

    describe('name column', () => {
        const nameColumn = segmentColumns[0]

        it('should have "Title" as header', () => {
            expect(nameColumn.header).toBe('Title')
        })

        it('should render the segment name', () => {
            renderCell(nameColumn, mockSegment.name)

            expect(
                screen.getByText('Support small business'),
            ).toBeInTheDocument()
        })

        it('should call onSegmentClick with the segment when clicked', async () => {
            const user = userEvent.setup()
            renderCell(nameColumn, mockSegment.name)

            await user.click(screen.getByText('Support small business'))

            expect(mockMeta.onSegmentClick).toHaveBeenCalledWith(mockSegment)
        })
    })

    describe('count column', () => {
        const countColumn = segmentColumns[1]

        it('should call useAudienceCount with segment conditions and integrationId', () => {
            renderCell(countColumn, 98762)

            expect(mockUseAudienceCount).toHaveBeenCalledWith({
                integration_id: 123,
                conditions: mockSegment.conditions,
            })
        })

        it('should render count from API response with ± prefix and locale formatting', () => {
            mockUseAudienceCount.mockReturnValue({
                data: { count: 98762 },
                isFetching: false,
            })
            renderCell(countColumn, 98762)

            expect(screen.getByText('±98,762')).toBeInTheDocument()
        })

        it('should fall back to segment count when API data is undefined', () => {
            renderCell(countColumn, 98762)

            expect(screen.getByText('±98,762')).toBeInTheDocument()
        })

        it('should render zero count without ± prefix', () => {
            mockUseAudienceCount.mockReturnValue({
                data: { count: 0 },
                isFetching: false,
            })
            renderCell(countColumn, 0, { count: 0 })

            expect(screen.getByText('0')).toBeInTheDocument()
            expect(screen.queryByText('±0')).not.toBeInTheDocument()
        })

        it('should render "—" when both API data and segment count are undefined', () => {
            renderCell(countColumn, undefined, { count: undefined })

            expect(screen.getByText('—')).toBeInTheDocument()
        })

        it('should not render count text while fetching', () => {
            mockUseAudienceCount.mockReturnValue({
                data: undefined,
                isFetching: true,
            })
            renderCell(countColumn, 98762)

            expect(screen.queryByText('±98,762')).not.toBeInTheDocument()
        })

        it('should prefer API count over segment count when API data is available', () => {
            mockUseAudienceCount.mockReturnValue({
                data: { count: 50000 },
                isFetching: false,
            })
            renderCell(countColumn, 98762)

            expect(screen.getByText('±50,000')).toBeInTheDocument()
            expect(screen.queryByText('±98,762')).not.toBeInTheDocument()
        })
    })

    describe('updated_datetime column', () => {
        const dateColumn = segmentColumns[2]

        it('should render the date formatted as MMM D, YYYY', () => {
            renderCell(dateColumn, '2026-09-12T00:00:00')

            expect(screen.getByText('Sep 12, 2026')).toBeInTheDocument()
        })
    })
})

describe('actionColumns', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('actions column', () => {
        const actionsColumn = actionColumns[0]

        it('should render SegmentMoreOptions with the segment and callbacks', () => {
            renderCell(actionsColumn, null)

            expect(SegmentMoreOptions).toHaveBeenCalledWith(
                {
                    segment: mockSegment,
                    onEditClick: mockMeta.onEditClick,
                    onDuplicateClick: mockMeta.onDuplicateClick,
                    onDeleteClick: mockMeta.onDeleteClick,
                },
                {},
            )
        })

        it('should render nothing when canWrite is false', () => {
            renderCell(actionsColumn, null, undefined, { canWrite: false })

            expect(SegmentMoreOptions).not.toHaveBeenCalled()
            expect(
                screen.queryByText('SegmentMoreOptions'),
            ).not.toBeInTheDocument()
        })
    })
})
