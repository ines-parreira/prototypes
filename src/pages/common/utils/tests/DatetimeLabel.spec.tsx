import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {channels as mockChannels} from 'fixtures/channels'

import {DateAndTimeFormatting} from 'constants/datetime'
import {RECHARGE_INTEGRATION_TYPE} from 'constants/integration'

import DatetimeLabel from '../DatetimeLabel'

const mockStore = configureMockStore()

jest.mock('pages/common/components/Tooltip', () => () => 'TooltipMock')
jest.mock('state/integrations/selectors', () => ({
    getIntegrationChannel: () => () => mockChannels[0],
}))

jest.mock('hooks/useId', () => jest.fn(() => 'mocked'))

describe('<DatetimeLabel/>', () => {
    describe('render()', () => {
        it('should render with zero width space', () => {
            const {getByText} = render(
                <Provider
                    store={mockStore({
                        currentUser: fromJS({timezone: 'utc'}),
                    })}
                >
                    <DatetimeLabel dateTime="2016-01-15" breakDate />
                </Provider>
            )

            expect(getByText('01/​15/​2016')).toBeInTheDocument()
        })

        it('should render a modified date because integrationType is Recharge', () => {
            const {getByText} = render(
                <Provider
                    store={mockStore({
                        currentUser: fromJS({timezone: 'US/Pacific'}),
                    })}
                >
                    <DatetimeLabel
                        dateTime="2022-01-01T03:11:07"
                        integrationType={RECHARGE_INTEGRATION_TYPE}
                        labelFormat={DateAndTimeFormatting.CompactDateWithTime}
                    />
                </Provider>
            )

            expect(getByText('01/01/2022 12:11 AM')).toBeInTheDocument()
        })
    })
})
