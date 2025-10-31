import React from 'react'

import { render } from '@testing-library/react'

import { DRILL_DOWN_PER_PAGE } from 'domains/reporting/hooks/useDrillDownData'
import { DrillDownTableContentSkeleton } from 'domains/reporting/pages/common/components/Table/DrillDownTableContentSkeleton'

describe('DrillDownTableContentSkeleton', () => {
    it('renders correctly with default row count', () => {
        const columnWidths = [300, 140]
        const { getAllByRole } = render(
            <DrillDownTableContentSkeleton columnWidths={columnWidths} />,
        )
        expect(getAllByRole('row').length).toBe(DRILL_DOWN_PER_PAGE)
        expect(getAllByRole('cell').length).toBe(
            DRILL_DOWN_PER_PAGE * columnWidths.length,
        )
    })

    it('renders correctly with custom row count', () => {
        const columnWidths = [300, 140]
        const customRowCount = 5
        const { getAllByRole } = render(
            <DrillDownTableContentSkeleton
                columnWidths={columnWidths}
                rowCount={customRowCount}
            />,
        )
        expect(getAllByRole('row').length).toBe(customRowCount)
        expect(getAllByRole('cell').length).toBe(
            customRowCount * columnWidths.length,
        )
    })

    it('renders correctly with zero rows', () => {
        const columnWidths = [300, 140]
        const { queryAllByRole } = render(
            <DrillDownTableContentSkeleton
                columnWidths={columnWidths}
                rowCount={0}
            />,
        )
        expect(queryAllByRole('row').length).toBe(0)
        expect(queryAllByRole('cell').length).toBe(0)
    })

    it('renders correctly with single row', () => {
        const columnWidths = [300, 140]
        const { getAllByRole } = render(
            <DrillDownTableContentSkeleton
                columnWidths={columnWidths}
                rowCount={1}
            />,
        )
        expect(getAllByRole('row').length).toBe(1)
        expect(getAllByRole('cell').length).toBe(columnWidths.length)
    })
})
