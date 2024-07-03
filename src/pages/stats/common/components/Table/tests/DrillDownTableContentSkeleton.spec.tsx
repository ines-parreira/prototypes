import React from 'react'
import {render} from '@testing-library/react'
import {DrillDownTableContentSkeleton} from 'pages/stats/common/components/Table/DrillDownTableContentSkeleton'
import {DRILL_DOWN_PER_PAGE} from 'hooks/reporting/useDrillDownData'

describe('DrillDownTableContentSkeleton', () => {
    it('renders correctly', () => {
        const columnWidths = [300, 140]
        const {getAllByRole} = render(
            <DrillDownTableContentSkeleton columnWidths={columnWidths} />
        )
        expect(getAllByRole('row').length).toBe(DRILL_DOWN_PER_PAGE)
        expect(getAllByRole('cell').length).toBe(
            DRILL_DOWN_PER_PAGE * columnWidths.length
        )
    })
})
