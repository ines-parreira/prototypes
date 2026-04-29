import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useChannelsSortingQuery } from 'domains/reporting/hooks/support-performance/useChannelsSortingQuery'
import { ChannelsHeaderCellContent } from 'domains/reporting/pages/support-performance/channels/ChannelsHeaderCellContent'
import { ChannelsTableLabels } from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/support-performance/useChannelsSortingQuery')
const useChannelsSortingQueryMock = assumeMock(useChannelsSortingQuery)

describe('ChannelsHeaderCellContent', () => {
    beforeEach(() => {
        useChannelsSortingQueryMock.mockReturnValue({
            sortCallback: jest.fn(),
            direction: OrderDirection.Desc,
            field: ChannelsTableColumns.CustomerSatisfaction,
        })
    })

    it('should render column label and sorting direction', () => {
        const column = ChannelsTableColumns.CustomerSatisfaction

        render(<ChannelsHeaderCellContent column={column} width={150} />)

        expect(
            screen.getByText(ChannelsTableLabels[column]),
        ).toBeInTheDocument()
        expect(screen.getByText('arrow_downward')).toBeInTheDocument()
    })

    it('should render Lead column label', () => {
        const column = ChannelsTableColumns.Channel
        useChannelsSortingQueryMock.mockReturnValue({
            sortCallback: jest.fn(),
            direction: OrderDirection.Asc,
            field: ChannelsTableColumns.Channel,
        })

        render(<ChannelsHeaderCellContent column={column} width={150} />)

        expect(
            screen.getByText(ChannelsTableLabels[column]),
        ).toBeInTheDocument()
        expect(screen.getByText('arrow_upward')).toBeInTheDocument()
    })
})
