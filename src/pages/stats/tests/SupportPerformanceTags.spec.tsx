import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../state/types'
import SupportPerformanceTags from '../SupportPerformanceTags'
import TagsStatsFilter from '../TagsStatsFilter'
import {TicketChannel} from '../../../business/types/ticket'
import {ticketsPerTagStat} from '../../../fixtures/stats'
import useStatResource from '../useStatResource'
import {renderWithRouter} from '../../../utils/testing'
import {integrationsState} from '../../../fixtures/integrations'

jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock('../useStatResource')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceTags', () => {
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
        integrations: fromJS(integrationsState),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceTags />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    period: {
                        start_time: '2021-02-03T00:00:00.000Z',
                        end_time: '2021-02-03T23:59:59.999Z',
                    },
                    channels: [TicketChannel.Chat],
                    tags: [1],
                    integrations: [integrationsState.integrations[0].id],
                },
            }),
        })
        useStatResourceMock.mockReturnValue([ticketsPerTagStat, false])

        const {container} = renderWithRouter(
            <Provider store={store}>
                <SupportPerformanceTags />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
