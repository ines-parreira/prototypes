import React from 'react'
import {render, screen} from '@testing-library/react'

import {TicketMessageSourceType} from 'business/types/ticket'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {OverviewMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {
    DRILL_DOWN_PER_PAGE,
    useDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {DrillDownInfobar} from 'pages/stats/DrillDownInfobar'

jest.mock('pages/stats/DrillDownDownloadButton', () => ({
    DrillDownDownloadButton: () => null,
}))
jest.mock('hooks/reporting/useDrillDownData')
const useDrillDownDataMock = assumeMock(useDrillDownData)

describe('<DrillDownInfobar />', () => {
    const metricData: DrillDownMetric = {metricName: OverviewMetric.OpenTickets}
    const data = [
        {
            ticket: {
                id: 1,
                channel: TicketMessageSourceType.Chat,
                description: 'description',
                isRead: false,
                subject: 'title',
            },
            contactReason: 'reason',
            assignee: {
                id: 1,
                name: 'Agent name',
            },
            created: '22/12/2023',
            metricValue: 15,
        },
    ]

    useDrillDownDataMock.mockReturnValue({
        data,
        perPage: DRILL_DOWN_PER_PAGE,
    } as any)

    it('should render the infobar', () => {
        render(<DrillDownInfobar metricData={metricData} />)

        expect(screen.getByText(`${DRILL_DOWN_PER_PAGE}`)).toBeInTheDocument()
    })
})
