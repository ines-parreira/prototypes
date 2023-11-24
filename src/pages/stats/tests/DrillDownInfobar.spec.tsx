import React from 'react'
import {render, screen} from '@testing-library/react'

import {TicketMessageSourceType} from 'business/types/ticket'
import {assumeMock} from 'utils/testing'
import {DrillDownInfobar} from '../DrillDownInfobar'
import {useDrillDownData} from '../useDrillDownData'

jest.mock('pages/stats/useDrillDownData')
const useDrillDownDataMock = assumeMock(useDrillDownData)

describe('<DrillDownInfobar />', () => {
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
    } as any)

    it('should render the infobar', () => {
        render(<DrillDownInfobar />)

        expect(screen.getByText(`${data.length} tickets`)).toBeInTheDocument()
    })
})
