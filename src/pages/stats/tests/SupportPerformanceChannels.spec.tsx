import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    ticketsCreatedPerChannel,
    ticketsCreatedPerChannelPerDay,
} from 'fixtures/stats'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {renderWithRouter} from 'utils/testing'
import {TICKETS_CREATED_PER_CHANNEL_PER_DAY} from 'config/stats'

import useStatResource from 'hooks/reporting/useStatResource'
import SupportPerformanceChannels from 'pages/stats/SupportPerformanceChannels'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock('hooks/reporting/useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock(
    'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceChannels', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
            },
        },
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
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === TICKETS_CREATED_PER_CHANNEL_PER_DAY) {
                return [ticketsCreatedPerChannelPerDay, false, _noop]
            }
            return [ticketsCreatedPerChannel, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceChannels />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
