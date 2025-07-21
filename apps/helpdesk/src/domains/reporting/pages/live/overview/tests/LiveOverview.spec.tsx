import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import {
    OPEN_TICKETS_ASSIGNMENT_STATUSES,
    USERS_STATUSES,
} from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import LiveOverview from 'domains/reporting/pages/live/overview/LiveOverview'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import {
    openTicketsAssignmentStatuses,
    supportVolumePerHour,
    usersStatuses,
} from 'fixtures/stats'
import { teams } from 'fixtures/teams'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

jest.mock('domains/reporting/hooks/useStatResource')
jest.mock('react-chartjs-2', () => ({ Line: () => <canvas /> }))
jest.mock(
    'pages/common/components/FeaturePaywall/FeaturePaywall',
    () =>
        ({ feature }: ComponentProps<typeof FeaturePaywall>) => {
            return <div>Paywall for {feature}</div>
        },
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>,
)
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('LiveOverview', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator([agents[0].id]),
            },
        },
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({ resourceName }) => {
            if (resourceName === USERS_STATUSES) {
                return [usersStatuses, false, _noop]
            } else if (resourceName === OPEN_TICKETS_ASSIGNMENT_STATUSES) {
                return [openTicketsAssignmentStatuses, false, _noop]
            }
            return [supportVolumePerHour, false, _noop]
        })

        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveOverview />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the paywall when the current account has no overview live statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.OverviewLiveStatistics, 'enabled'],
                false,
            ),
        })
        const { container } = render(
            <Provider store={store}>
                <LiveOverview />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
