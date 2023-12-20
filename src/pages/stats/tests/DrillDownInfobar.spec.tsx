import React from 'react'
import {render, screen} from '@testing-library/react'

import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {OverviewMetric} from 'state/ui/stats/types'
import {DRILLDOWN_QUERY_LIMIT} from 'utils/reporting'
import {assumeMock} from 'utils/testing'
import {
    DRILL_DOWN_PER_PAGE,
    useDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {
    DrillDownInfobar,
    TOTAL_RESULTS_PLACEHOLDER,
} from 'pages/stats/DrillDownInfobar'

jest.mock('pages/stats/DrillDownDownloadButton', () => ({
    DrillDownDownloadButton: () => null,
}))
jest.mock('hooks/reporting/useDrillDownData')
const useDrillDownDataMock = assumeMock(useDrillDownData)

describe('<DrillDownInfobar />', () => {
    const metricData: DrillDownMetric = {metricName: OverviewMetric.OpenTickets}
    const totalResults = 50

    useDrillDownDataMock.mockReturnValue({
        perPage: DRILL_DOWN_PER_PAGE,
        totalResults,
        isFetching: false,
    } as any)

    it('should render the infobar with current number of results', () => {
        render(<DrillDownInfobar metricData={metricData} />)

        expect(
            screen.getByText(`${totalResults}`, {exact: false})
        ).toBeInTheDocument()
    })

    it(`should render the Infobar when ${DRILLDOWN_QUERY_LIMIT} results or more`, () => {
        const totalResults = 200
        useDrillDownDataMock.mockReturnValue({
            perPage: DRILL_DOWN_PER_PAGE,
            totalResults,
            isFetching: false,
        } as any)
        render(<DrillDownInfobar metricData={metricData} />)

        expect(
            screen.getByText(String(DRILLDOWN_QUERY_LIMIT), {exact: false})
        ).toBeInTheDocument()
    })

    it('should render "?" as number of rows when fetching', () => {
        useDrillDownDataMock.mockReturnValue({
            perPage: DRILL_DOWN_PER_PAGE,
            totalResults,
            isFetching: true,
        } as any)

        render(<DrillDownInfobar metricData={metricData} />)

        expect(
            screen.getByText(TOTAL_RESULTS_PLACEHOLDER, {exact: false})
        ).toBeInTheDocument()
    })
})
