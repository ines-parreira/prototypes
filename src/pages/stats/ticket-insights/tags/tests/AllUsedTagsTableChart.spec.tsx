import {render} from '@testing-library/react'
import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import {AllUsedTagsTable} from 'pages/stats/ticket-insights/tags/AllUsedTagsTable'
import {AllUsedTagsTableChart} from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/ChartCard')
const ChartCardMock = assumeMock(ChartCard)
jest.mock('pages/stats/ticket-insights/tags/AllUsedTagsTable')
const AllUsedTagsTableMock = assumeMock(AllUsedTagsTable)

describe('<AllUsedTagsTableChart />', () => {
    beforeEach(() => {
        ChartCardMock.mockImplementation(({children}) => <div>{children}</div>)
        AllUsedTagsTableMock.mockImplementation(() => <div />)
    })
    it('should render Chart Card with AllUserTagsTable', () => {
        render(<AllUsedTagsTableChart />)
    })
})
