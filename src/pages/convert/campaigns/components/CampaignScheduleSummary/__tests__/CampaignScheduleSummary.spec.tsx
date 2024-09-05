import React from 'react'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {render} from '@testing-library/react'

import {SETTING_TYPE_BUSINESS_HOURS} from 'state/currentAccount/constants'
import {RootState, StoreDispatch} from 'state/types'

import CampaignScheduleSummary from '../CampaignScheduleSummary'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS({
        settings: [
            {
                type: SETTING_TYPE_BUSINESS_HOURS,
                data: {
                    business_hours: [
                        {
                            days: '2',
                            from_time: '10:00',
                            to_time: '17:00',
                        },
                        {
                            days: '4',
                            from_time: '11:00',
                            to_time: '17:00',
                        },
                    ],
                    timezone: 'US/Pacific',
                },
            },
        ],
    }),
} as RootState

const defaultStore = mockStore(defaultState)

const renderComponent = (props?: any) => {
    return render(
        <Provider store={defaultStore}>
            <CampaignScheduleSummary {...props} />
        </Provider>
    )
}

describe('<CampaignScheduleSummary />', () => {
    it('return correct TZ', () => {
        const {getByText} = renderComponent()

        expect(getByText(/US\/Pacific/)).toBeInTheDocument()
    })
})
