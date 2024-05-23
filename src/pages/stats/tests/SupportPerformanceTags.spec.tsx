import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {ticketsPerTagStat} from 'fixtures/stats'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {renderWithRouter} from 'utils/testing'
import {integrationsState} from 'fixtures/integrations'
import {StatsFilters} from 'models/stat/types'

import useStatResource from 'hooks/reporting/useStatResource'
import SupportPerformanceTags from 'pages/stats/SupportPerformanceTags'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('hooks/reporting/useStatResource')
jest.mock('pages/stats/ChannelsStatsFilter', () => () => (
    <div>ChannelsStatsFilter</div>
))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceTags', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                tags: [1],
                integrations: [integrationsState.integrations[0].id],
            } as StatsFilters,
        }),
        integrations: fromJS(integrationsState),
        entities: {
            tags: {},
        },
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewDatePickerVariant]: false,
        }))
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockReturnValue([ticketsPerTagStat, false, _noop])

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTags />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
