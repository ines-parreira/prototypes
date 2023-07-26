import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {HelpdeskMessageMeasure, TicketDimension} from 'models/reporting/types'
import {useMessagesSentMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {formatMetricValue} from 'pages/stats/common/utils'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const useMessagesSentMetricPerAgentMock = assumeMock(
    useMessagesSentMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<MessagesSentCellContent>', () => {
    const agentId = 123
    const firstResponseTimeValue = 1234

    const defaultState = {
        stats: initialState,
    } as RootState

    const useMessagesSentMetricPerAgentReturnValue = {
        data: {
            value: firstResponseTimeValue,
            allData: [
                {
                    [HelpdeskMessageMeasure.MessageCount]:
                        firstResponseTimeValue,
                    [TicketDimension.AssigneeUserId]: agentId,
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useMessagesSentMetricPerAgentMock.mockReturnValue(
        useMessagesSentMetricPerAgentReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MessagesSentCellContent agentId={agentId} />
            </Provider>
        )

        expect(
            screen.getByText(formatMetricValue(firstResponseTimeValue))
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useMessagesSentMetricPerAgentMock.mockReturnValue({
            ...useMessagesSentMetricPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <MessagesSentCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
