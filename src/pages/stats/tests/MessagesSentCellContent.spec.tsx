import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {HelpdeskMessageMeasure, TicketDimension} from 'models/reporting/types'
import {useMessagesSentMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
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
    const messagesSentValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useMessagesSentMetricPerAgentReturnValue = {
        data: {
            value: messagesSentValue,
            allData: [
                {
                    [HelpdeskMessageMeasure.MessageCount]:
                        String(messagesSentValue),
                    [TicketDimension.AssigneeUserId]: String(agentId),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useMessagesSentMetricPerAgentMock.mockReturnValue(
        useMessagesSentMetricPerAgentReturnValue
    )

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MessagesSentCellContent agentId={agentId} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    messagesSentValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
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
