import React from 'react'

import { render } from '@testing-library/react'

import { DRILL_DOWN_PER_PAGE } from 'domains/reporting/hooks/useDrillDownData'
import { DrillDownTableContentSkeleton } from 'domains/reporting/pages/common/components/Table/DrillDownTableContentSkeleton'

describe('DrillDownTableContentSkeleton', () => {
    it('renders correctly', () => {
        const columnWidths = [300, 140]
        const { getAllByRole } = render(
            <DrillDownTableContentSkeleton columnWidths={columnWidths} />,
        )
        expect(getAllByRole('row').length).toBe(DRILL_DOWN_PER_PAGE)
        expect(getAllByRole('cell').length).toBe(
            DRILL_DOWN_PER_PAGE * columnWidths.length,
        )
    })
})
