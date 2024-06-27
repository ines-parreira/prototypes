import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import LD from 'launchdarkly-react-client-sdk'
import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {ticketsCreatedPerHourPerWeekday} from 'fixtures/stats'
import {teams} from 'fixtures/teams'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import useStatResource from 'hooks/reporting/useStatResource'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import SupportPerformanceBusiestTimesOfDays from 'pages/stats/SupportPerformanceBusiestTimesOfDays'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock(
    'pages/stats/TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('hooks/reporting/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock(
    'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>
)

describe('<SupportPerformanceBusiestTimesOfDays />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const useStatResourceMock = useStatResource as jest.MockedFunction<
        typeof useStatResource
    >
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [integrationsState.integrations[0].id],
                agents: [agents[0].id],
                tags: [1],
            },
        },
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewDatePickerVariant]: false,
        }))
    })

    it('should render the page', () => {
        useStatResourceMock.mockImplementation(() => {
            return [ticketsCreatedPerHourPerWeekday, false, _noop]
        })
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceBusiestTimesOfDays />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
