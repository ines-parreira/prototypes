import {screen} from '@testing-library/react'
import React from 'react'
import {useChannelsSortingQuery} from 'hooks/reporting/support-performance/useChannelsSortingQuery'
import {OrderDirection} from 'models/api/types'
import {ChannelsHeaderCellContent} from 'pages/stats/support-performance/channels/ChannelsHeaderCellContent'
import {ChannelsTableLabels} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {ChannelsTableColumns} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useChannelsSortingQuery')
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

        renderWithStore(
            <ChannelsHeaderCellContent column={column} width={150} />,
            {}
        )

        expect(
            screen.getByText(ChannelsTableLabels[column])
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

        renderWithStore(
            <ChannelsHeaderCellContent column={column} width={150} />,
            {}
        )

        expect(
            screen.getByText(ChannelsTableLabels[column])
        ).toBeInTheDocument()
        expect(screen.getByText('arrow_upward')).toBeInTheDocument()
    })
})
